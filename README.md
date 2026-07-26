# CppLab — Online C++ Compiler

A sleek, browser-based C++ compiler built with **React** and **Node.js**. Write, compile, and run C++ code directly in your browser with instant output, stdin support, and a polished dark UI.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![C++](https://img.shields.io/badge/C++-17-00599C?style=flat-square&logo=cplusplus)

---

## Features

- **Instant Compilation** — Compile and execute C++17 code with g++
- **Live Output** — Real-time stdout and stderr display with execution time
- **Stdin Input** — Provide standard input for interactive programs
- **Example Programs** — Pre-loaded examples (Hello World, Fibonacci, Bubble Sort, User Input)
- **Keyboard Shortcut** — `Ctrl+Enter` to compile and run instantly
- **Syntax-Ready Editor** — Monospace editor with line numbers and tab support
- **Dark UI** — Glassmorphism design with animated gradient glows
- **Responsive** — Works on both desktop and tablet viewports

---

## Tech Stack

| Layer    | Technology               |
| -------- | ------------------------ |
| Frontend | React 19, Vite           |
| Backend  | Node.js, Express         |
| Compiler | g++ (C++17)              |
| Deploy   | Render (Web Service)     |

---

## Project Structure

```
cpp-online-compiler/
├── package.json          # Root — all deps + build/start scripts
├── render.yaml           # Render Blueprint config
├── .gitignore
│
├── client/               # React frontend
│   ├── src/
│   │   ├── App.jsx       # Main application component
│   │   ├── App.css       # Component styles (glassmorphism UI)
│   │   ├── index.css     # Global CSS variables & reset
│   │   └── main.jsx      # React entry point
│   ├── index.html
│   ├── vite.config.js    # Vite config with API proxy
│   └── package.json
│
└── server/               # Node.js backend
    ├── index.js          # Express server + compilation logic
    └── package.json      # Metadata only (deps live at root)
```

---

## Local Development

### Prerequisites

- **Node.js** 18+
- **g++** (must be in your PATH)

### Setup

```bash
# Clone the repo
git clone https://github.com/your-username/cpp-online-compiler.git
cd cpp-online-compiler

# Install all dependencies (root + client)
npm install
cd client && npm install && cd ..
```

### Running

Open two terminals:

**Terminal 1 — Backend (port 5000):**
```bash
npm run dev:server
```

**Terminal 2 — Frontend (port 3000):**
```bash
npm run dev:client
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The Vite dev server proxies `/api/*` requests to the Express backend automatically.

---

## Deployment on Render

This project includes a `Dockerfile` and `render.yaml` — both are configured for Render.

### Option A: Blueprint (render.yaml) — Recommended

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect your GitHub repo
4. Render reads `render.yaml`, builds the Docker image (which installs g++, deps, and builds the React client), and deploys automatically

### Option B: Manual Web Service with Docker

1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Set **Runtime** to `Docker`
4. Leave the Dockerfile path as `Dockerfile` (root)
5. Render will build the image and deploy

### How the Dockerfile works

```
node:18-slim  →  installs g++  →  npm install (root deps)  →  npm install (client deps)  →  builds React  →  runs server
```

g++ is installed inside the Docker image, so C++ compilation works at runtime on Render.

---

## API Reference

### `POST /compile`

Compiles and executes C++ code.

**Request Body:**
```json
{
  "code": "#include <iostream>\nusing namespace std;\nint main() { cout << 42; }",
  "input": ""
}
```

**Response:**
```json
{
  "output": "42",
  "error": "",
  "status": "success",
  "exitCode": 0,
  "executionTime": 45
}
```

**Status Values:**
| Status | Meaning |
| --- | --- |
| `success` | Code compiled and ran without errors |
| `compile_error` | Compilation failed |
| `runtime_error` | Compiled but exited with non-zero code |
| `server_error` | Internal server error |

### `GET /health`

Health check endpoint. Returns `{ "status": "ok", "platform": "linux" }`.

---

## Security & Limits

- Code size limit: **50 KB**
- Compilation timeout: **15 seconds**
- Execution timeout: **10 seconds**
- Output size limit: **100 KB** (truncated)
- Temp files are auto-cleaned after each request
- No persistent storage of user code

---

## License

MIT
