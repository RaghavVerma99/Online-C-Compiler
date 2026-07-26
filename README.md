# `</>` CppLab

> A real-time online C++ compiler — write, compile, and run C++ instantly in your browser.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![C++](https://img.shields.io/badge/C++-17-00599C?style=for-the-badge&logo=cplusplus)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## What is it?

CppLab is a lightweight, browser-based C++ compiler. It takes your code, sends it to a Node.js backend where **g++ compiles and executes it**, and streams the result back — all in under a second. No installations. No IDE setup. Just code and run.

---

## Highlights

| | Feature | Detail |
|---|---|---|
| ⚡ | **Instant Compile** | C++17 code compiles and runs on the server with g++ |
| 📥 | **Stdin Support** | Pass standard input for interactive programs |
| 🔬 | **Live Errors** | Compilation and runtime errors shown with context |
| ⏱ | **Execution Time** | See exactly how long your code took to run |
| 🧪 | **4 Examples** | Hello World, Fibonacci, Bubble Sort, User Input — one click to load |
| 🌙 | **Dark Glass UI** | Animated gradient glows, glassmorphism panels |
| ⌨️ | **`Ctrl+Enter`** | Keyboard shortcut to compile instantly |

---

## How It Works

```
 You (Browser)                  Server                    System
 ┌─────────────┐   POST /compile   ┌──────────┐            │
 │  Write C++  │ ───────────────►  │ Express  │            │
 │  Click Run  │                   │          │            │
 └─────────────┘                   │ g++ -o   │ ──compile──►│
       ▲                           │ output   │            │
       │         { output, error } │          │ ◄──binary──│
       └───────────────────────────│ run ./out│ ──execute──►│
                                   │          │ ◄──stdout──│
                                   └──────────┘            │
```

1. You write C++ in the editor and hit **Run**
2. Frontend sends `{ code, input }` to `POST /compile`
3. Server writes code to a temp `.cpp` file
4. `g++ -std=c++17` compiles it
5. Binary executes with your stdin (if any)
6. stdout/stderr + execution time returned
7. Temp files cleaned up automatically

---

## Tech Stack

| Layer | Stack |
|---|---|
| **Frontend** | React 19 + Vite |
| **Backend** | Node.js + Express |
| **Compiler** | g++ (C++17) |
| **UI** | Custom CSS — glassmorphism, animated gradients |

---

## Quick Start

**Prerequisites:** Node.js 18+, g++ in PATH

```bash
git clone https://github.com/your-username/cpp-online-compiler.git
cd cpp-online-compiler
npm install && cd client && npm install && cd ..
```

**Run locally (two terminals):**

```bash
# Terminal 1 — Backend (port 5000)
npm run dev:server

# Terminal 2 — Frontend (port 3000)
npm run dev:client
```

Open **http://localhost:3000** — the Vite dev server proxies API calls to the backend automatically.

---

## Project Structure

```
cpp-online-compiler/
├── package.json              # Root deps (express, cors, uuid)
├── Dockerfile                # Container build for Render
├── render.yaml               # Render Blueprint
│
├── client/                   # React frontend
│   ├── src/
│   │   ├── App.jsx           # Main component — editor, I/O, run logic
│   │   ├── App.css           # Glassmorphism UI styles
│   │   ├── index.css         # CSS variables & reset
│   │   └── main.jsx          # Entry point
│   ├── index.html
│   └── vite.config.js        # Dev proxy to backend
│
└── server/
    └── index.js              # Express — compile, execute, cleanup
```

---

## API

### `POST /compile`

```json
// Request
{ "code": "#include <iostream>\nusing namespace std;\nint main(){cout<<42;}", "input": "" }

// Response
{ "output": "42", "error": "", "status": "success", "exitCode": 0, "executionTime": 12 }
```

| `status` | Meaning |
|---|---|
| `success` | Compiled and ran cleanly |
| `compile_error` | g++ rejected the code |
| `runtime_error` | Compiled but exited non-zero |
| `server_error` | Internal failure |

### `GET /health`

Returns `{ "status": "ok", "platform": "linux" }`.

---

## Safety

| Limit | Value |
|---|---|
| Max code size | 50 KB |
| Compile timeout | 15s |
| Run timeout | 10s |
| Max output | 100 KB |
| Temp files | Auto-cleaned per request |
| Persistent storage | None |

---

## License

MIT
