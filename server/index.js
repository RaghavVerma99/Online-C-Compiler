const express = require("express");
const cors = require("cors");
const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const os = require("os");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const isWindows = os.platform() === "win32";
const TEMP_DIR = path.join(__dirname, "temp");

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Serve React build in production
const clientBuild = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
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

  const id = uuidv4();
  const ext = isWindows ? ".exe" : "";
  const filePath = path.join(TEMP_DIR, `${id}.cpp`);
  const exePath = path.join(TEMP_DIR, `${id}${ext}`);

  try {
    fs.writeFileSync(filePath, code);

    try {
      execSync(
        `g++ -o "${exePath}" "${filePath}" -std=c++17 -Wall -Wextra -O2`,
        { timeout: 15000, encoding: "utf-8" }
      );
    } catch (compileErr) {
      const stderr = compileErr.stderr
        ? compileErr.stderr.toString()
        : compileErr.message;
      return res.json({
        output: "",
        error: stderr,
        status: "compile_error",
      });
    }

    const result = await runExecutable(exePath, input);

    return res.json({
      output: result.stdout,
      error: result.stderr,
      status: result.exitCode === 0 ? "success" : "runtime_error",
      exitCode: result.exitCode,
      executionTime: result.executionTime,
    });
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

function runExecutable(exePath, input) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const proc = spawn(exePath, [], {
      stdio: ["pipe", "pipe", "pipe"],
    });

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

function cleanup(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {}
}

// SPA fallback
if (fs.existsSync(clientBuild)) {
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientBuild, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`C++ Compiler server running on port ${PORT}`);
});
