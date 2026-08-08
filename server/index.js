const express = require("express");
const cors = require("cors");
const compression = require("compression");
const crypto = require("crypto");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const os = require("os");

const app = express();
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "1mb" }));

const isWindows = os.platform() === "win32";
const TEMP_DIR = path.join(__dirname, "temp");
const PCH_DIR = path.join(TEMP_DIR, "pch");

for (const dir of [TEMP_DIR, PCH_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const CXX_FLAGS = ["-std=c++17", "-O2", "-Wall", "-Wextra", "-pipe"];

// ── Precompiled standard headers ──────────────────────────────────────────
// Parsing the C++ standard library dominates compile time (~70%+). We build a
// `.gch` of <bits/stdc++.h> once in the background and reuse it for every
// compile, cutting typical compile times by 3-4x. Falls back to normal
// compilation if the PCH can't be built for this environment.
const PCH_HEADER = path.join(PCH_DIR, "std.h");
const PCH_FILE = path.join(PCH_DIR, "std.h.gch");
let pchReady = false;

function ensurePCH() {
  if (fs.existsSync(PCH_FILE)) {
    pchReady = true;
    return;
  }
  if (!fs.existsSync(PCH_HEADER)) {
    fs.writeFileSync(PCH_HEADER, "#include <bits/stdc++.h>\n");
  }
  const proc = spawn("g++", [...CXX_FLAGS, "-o", PCH_FILE, PCH_HEADER]);
  proc.on("error", () => {
    pchReady = false;
  });
  proc.on("close", (code) => {
    pchReady = code === 0;
    if (!pchReady) cleanup(PCH_FILE);
  });
}
ensurePCH();

function buildCompileArgs(srcPath, exePath) {
  const args = [...CXX_FLAGS, "-o", exePath, srcPath];
  if (pchReady) {
    args.push("-include", PCH_HEADER, "-Winvalid-pch");
  }
  return args;
}

// ── Compile cache (content-addressed, TTL) ────────────────────────────────
const CACHE_MAX_ENTRIES = 50;
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

function cacheKey(code) {
  return crypto
    .createHash("sha1")
    .update(code + "::" + CXX_FLAGS.join(" "))
    .digest("hex");
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.result;
}

function setCache(key, result) {
  cache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
  if (cache.size > CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

// ── Concurrency pool ──────────────────────────────────────────────────────
// g++/execution are heavy OS processes. Limit how many run at once so the
// machine doesn't thrash, while still allowing parallel requests. Uses spawn
// so the event loop is never blocked.
const MAX_CONCURRENT = Math.max(
  1,
  Math.min(2, Math.floor(os.cpus().length / 2))
);
let active = 0;
const queue = [];

function runInPool(task) {
  return new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    pump();
  });
}

function pump() {
  while (active < MAX_CONCURRENT && queue.length > 0) {
    const job = queue.shift();
    active++;
    job
      .task()
      .then(job.resolve, job.reject)
      .finally(() => {
        active--;
        pump();
      });
  }
}

// ── Compilation ───────────────────────────────────────────────────────────
function compileCpp(srcPath, exePath) {
  return new Promise((resolve) => {
    const proc = spawn("g++", buildCompileArgs(srcPath, exePath));
    let stdout = "";
    let stderr = "";

    const timer = setTimeout(() => {
      proc.kill("SIGKILL");
      resolve({
        ok: false,
        error: (stderr || "") + "\nCompilation timed out (15s limit)",
      });
    }, 15000);

    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));

    proc.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        ok: false,
        error: (stderr || "") + "\n" + err.message,
      });
    });

    proc.on("close", (code) => {
      clearTimeout(timer);
      resolve({ ok: code === 0, error: stderr });
    });
  });
}

function runExecutable(exePath, input) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const proc = spawn(exePath, [], { stdio: ["pipe", "pipe", "pipe"] });

    let stdout = "";
    let stderr = "";
    let killed = false;

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
      if (stdout.length > 100000 && !killed) {
        killed = true;
        proc.kill("SIGKILL");
      }
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    if (input) {
      proc.stdin.write(input);
    }
    proc.stdin.end();

    const timer = setTimeout(() => {
      if (!killed) {
        killed = true;
        proc.kill("SIGKILL");
      }
      resolve({
        stdout,
        stderr: stderr + "\nExecution timed out (10s limit)",
        exitCode: 1,
        executionTime: 10000,
      });
    }, 10000);

    proc.on("close", (exitCode) => {
      clearTimeout(timer);
      if (!killed || exitCode !== null) {
        resolve({
          stdout,
          stderr,
          exitCode: exitCode ?? 1,
          executionTime: Date.now() - startTime,
        });
      }
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: stderr + "\n" + err.message,
        exitCode: 1,
        executionTime: Date.now() - startTime,
      });
    });
  });
}

// ── Serve React build with long-lived caching ─────────────────────────────
const clientBuild = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientBuild)) {
  const assetsDir = path.join(clientBuild, "assets");
  if (fs.existsSync(assetsDir)) {
    app.use(
      "/assets",
      express.static(assetsDir, { maxAge: "1y", immutable: true })
    );
  }
  app.use(express.static(clientBuild, { etag: true, maxAge: 0 }));
}

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", platform: os.platform() });
});

app.post("/compile", async (req, res) => {
  const { code, input = "" } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "No code provided" });
  }

  if (code.length > 50000) {
    return res.status(400).json({ error: "Code exceeds 50KB limit" });
  }

  const key = cacheKey(code);
  const cached = getCache(key);
  if (cached) {
    return res.json({ ...cached, executionTime: 0 });
  }

  const id = uuidv4();
  const ext = isWindows ? ".exe" : "";
  const filePath = path.join(TEMP_DIR, `${id}.cpp`);
  const exePath = path.join(TEMP_DIR, `${id}${ext}`);

  try {
    fs.writeFileSync(filePath, code);

    const compileResult = await runInPool(() =>
      compileCpp(filePath, exePath)
    );

    if (!compileResult.ok) {
      const result = {
        output: "",
        error: compileResult.error,
        status: "compile_error",
      };
      setCache(key, result);
      return res.json(result);
    }

    const result = await runExecutable(exePath, input);
    const response = {
      output: result.stdout,
      error: result.stderr,
      status: result.exitCode === 0 ? "success" : "runtime_error",
      exitCode: result.exitCode,
      executionTime: result.executionTime,
    };
    setCache(key, response);
    return res.json(response);
  } catch (err) {
    return res.json({
      output: "",
      error: err.message || "Internal server error",
      status: "server_error",
    });
  } finally {
    cleanup(filePath);
    cleanup(exePath);
  }
});

function cleanup(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {}
}

// SPA fallback (never cache HTML)
if (fs.existsSync(clientBuild)) {
  app.get("*", (_req, res) => {
    res.set("Cache-Control", "no-cache");
    res.sendFile(path.join(clientBuild, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`C++ Compiler server running on port ${PORT}`);
});
