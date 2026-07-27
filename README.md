# `</>` CppLab

> A real-time online C++ compiler — write, compile, and run C++ instantly in your browser.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![C++](https://img.shields.io/badge/C++-17-00599C?style=for-the-badge&logo=cplusplus)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## What is CppLab?

CppLab is a lightweight, browser-based C++ compiler designed for students, developers, and anyone who wants to quickly write, compile, and run C++ code without installing any tools. Built with a modern glassmorphism UI, it provides a professional coding experience right in your browser. Simply write your C++ code, click Run, and see the output instantly — all compiled and executed server-side with g++.

---

## Features

| | Feature | Detail |
|---|---|---|
| ⚡ | **Instant Compile** | C++17 code compiles and runs on the server with g++ in milliseconds |
| 📥 | **Stdin Support** | Pass standard input for interactive programs (cin, getline, etc.) |
| 🔬 | **Live Errors** | Compilation and runtime errors shown with full context and line numbers |
| ⏱ | **Execution Time** | See exactly how long your code took to run with millisecond precision |
| 🧪 | **4 Built-in Examples** | Hello World, Fibonacci, Bubble Sort, User Input — one click to load |
| 🌙 | **Dark Glass UI** | Animated gradient glows, glassmorphism panels, and modern aesthetics |
| ⌨️ | **Keyboard Shortcuts** | `Ctrl+Enter` to compile, `Shift+Alt+F` to format code |
| 🎨 | **Code Formatting** | Built-in C++ formatter that auto-indents, spaces operators, and organizes braces |
| 🔤 | **Classic Mac Typography** | Monaco/Menlo font stack for authentic retro coding feel |
| 🔄 | **Smart Auto-Indent** | Pressing Enter automatically follows previous line indentation |
| 📱 | **Responsive Design** | Works on both desktop and mobile screens |

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

1. You write C++ in the editor and hit **Run** (or press `Ctrl+Enter`)
2. Frontend sends `{ code, input }` to `POST /compile`
3. Server writes code to a temp `.cpp` file with a unique UUID
4. `g++ -std=c++17 -Wall -Wextra -O2` compiles it with full warnings
5. Binary executes with your stdin (if any) — 10 second timeout
6. stdout/stderr + execution time returned as JSON
7. Temp files cleaned up automatically

---

## Code Editor Features

### Smart Auto-Indentation

When you press `Enter`, the editor automatically:
- **Follows the previous line's indentation level**
- **Adds an extra indent** when the previous line ends with `{`, `(`, or `[`
- **Maintains clean structure** without manual spacing

Example:
```cpp
if (condition) {     // You type this
    // Pressing Enter automatically indents here
}
```

### Code Formatter

Click the **Format** button or press `Shift+Alt+F` to:
- Normalize indentation to 4 spaces
- Fix spacing around operators (`=`, `==`, `+`, `-`, etc.)
- Organize brace placement consistently
- Clean up blank lines and trailing whitespace
- Format include statements and namespace declarations

---

## Tech Stack

| Layer | Stack |
|---|---|
| **Frontend** | React 19 + Vite |
| **Backend** | Node.js + Express |
| **Compiler** | g++ (C++17) |
| **UI** | Custom CSS — glassmorphism, animated gradients |
| **Typography** | Monaco, Menlo, SF Mono, IBM Plex Mono |
| **Linting** | oxlint (Rust-based ESLint alternative) |

---

## Quick Start

**Prerequisites:** Node.js 18+, g++ in PATH

### Installation

```bash
git clone https://github.com/your-username/cpp-online-compiler.git
cd cpp-online-compiler

# Install root dependencies (server)
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### Development

Run both frontend and backend in separate terminals:

```bash
# Terminal 1 — Backend (port 5000)
npm run dev:server

# Terminal 2 — Frontend (port 3000)
npm run dev:client
```

Open **http://localhost:3000** — the Vite dev server proxies API calls to the backend automatically.

### Production Build

```bash
npm run build    # Builds client into client/dist
npm start        # Starts server serving built client
```

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
│   │   ├── App.jsx           # Main app container
│   │   ├── App.css           # Glassmorphism UI styles
│   │   ├── index.css         # CSS variables & reset
│   │   ├── main.jsx          # Entry point
│   │   │
│   │   ├── components/       # React components
│   │   │   ├── Header.jsx    # Logo, shortcuts, run button
│   │   │   ├── Editor.jsx    # Code editor, line numbers, format btn
│   │   │   ├── Output.jsx    # Output/error tabs
│   │   │   └── Footer.jsx    # Status bar
│   │   │
│   │   └── utils/            # Utility functions
│   │       └── formatCpp.js  # C++ code formatter
│   │
│   ├── index.html
│   └── vite.config.js        # Dev proxy to backend
│
└── server/
    └── index.js              # Express — compile, execute, cleanup
```

---

## API

### `POST /compile`

Compiles and executes C++ code.

```json
// Request
{
  "code": "#include <iostream>\nusing namespace std;\nint main(){cout<<42;}",
  "input": ""
}

// Response (success)
{
  "output": "42",
  "error": "",
  "status": "success",
  "exitCode": 0,
  "executionTime": 12
}

// Response (compile error)
{
  "output": "",
  "error": "main.cpp:3:1: error: expected ';' before '}' token",
  "status": "compile_error"
}
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

## Safety & Limits

| Limit | Value | Reason |
|---|---|---|
| Max code size | 50 KB | Prevents abuse |
| Compile timeout | 15s | Catches infinite loops in compilation |
| Run timeout | 10s | Prevents runaway programs |
| Max output | 100 KB | Prevents memory exhaustion |
| Temp files | Auto-cleaned | No persistent storage between requests |
| Persistent storage | None | Privacy-first design |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Enter` | Compile and run code |
| `Shift+Alt+F` | Format code |
| `Tab` | Insert 4 spaces |

---

## License

MIT