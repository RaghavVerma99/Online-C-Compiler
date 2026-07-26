import { useState, useCallback, useRef } from "react";
import "./App.css";

const DEFAULT_CODE = `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`;

const EXAMPLES = {
  hello: {
    name: "Hello World",
    icon: "\u{1F44B}",
    code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  },
  fibonacci: {
    name: "Fibonacci",
    icon: "\u{1F522}",
    code: `#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    int n = 10;
    cout << "Fibonacci(" << n << ") = " << fibonacci(n) << endl;
    return 0;
}`,
  },
  sorting: {
    name: "Bubble Sort",
    icon: "\u{1F504}",
    code: `#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++)
        for (int j = 0; j < n - i - 1; j++)
            if (arr[j] > arr[j + 1])
                swap(arr[j], arr[j + 1]);
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    bubbleSort(arr);
    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}`,
  },
  input: {
    name: "User Input",
    icon: "\u{23CF}\u{FE0F}",
    code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    int age;
    cout << "Enter your name: ";
    cin >> name;
    cout << "Enter your age: ";
    cin >> age;
    cout << "Hello " << name << ", you are " << age << " years old!" << endl;
    return 0;
}`,
  },
};

function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const [execTime, setExecTime] = useState(null);
  const [activeTab, setActiveTab] = useState("output");
  const codeRef = useRef(code);
  const inputRef = useRef(input);
  const editorRef = useRef(null);
  const lineNumbersRef = useRef(null);

  codeRef.current = code;
  inputRef.current = input;

  const handleCompile = useCallback(async () => {
    setStatus("running");
    setOutput("");
    setError("");
    setExecTime(null);
    setActiveTab("output");

    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeRef.current, input: inputRef.current }),
      });
      const data = await res.json();

      if (data.status === "success") {
        setOutput(data.output || "(no output)");
        setStatus("success");
      } else if (data.status === "compile_error") {
        setError(data.error);
        setStatus("error");
      } else {
        if (data.output) setOutput(data.output);
        setError(data.error);
        setStatus("error");
      }
      setExecTime(data.executionTime);
    } catch {
      setError("Failed to connect to server. Make sure the backend is running on port 5000.");
      setStatus("error");
    }
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleCompile();
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.target;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const val = ta.value;
        const newVal = val.substring(0, start) + "    " + val.substring(end);
        setCode(newVal);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 4;
        });
      }
    },
    [handleCompile]
  );

  const handleScroll = useCallback(() => {
    if (editorRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
    }
  }, []);

  const lineCount = code.split("\n").length;

  return (
    <div className="app">
      <div className="bg-glow glow-1" />
      <div className="bg-glow glow-2" />
      <div className="bg-glow glow-3" />

      <header className="header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <span className="logo-text">CppLab</span>
          </div>
        </div>

        <div className="header-center">
          <div className="example-pills">
            {Object.entries(EXAMPLES).map(([key, ex]) => (
              <button
                key={key}
                className="pill"
                onClick={() => setCode(ex.code)}
              >
                <span className="pill-icon">{ex.icon}</span>
                {ex.name}
              </button>
            ))}
          </div>
        </div>

        <div className="header-right">
          <span className="shortcut-hint">Ctrl + Enter</span>
          <button
            className={`run-btn ${status === "running" ? "running" : ""}`}
            onClick={handleCompile}
            disabled={status === "running"}
          >
            {status === "running" ? (
              <>
                <span className="spinner" />
                Running
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Run Code
              </>
            )}
          </button>
        </div>
      </header>

      <main className="main">
        <div className="editor-panel">
          <div className="panel-header">
            <div className="window-dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <div className="file-tab">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              main.cpp
            </div>
            <div className="cpp-badge">C++17</div>
          </div>
          <div className="editor-wrapper">
            <div className="line-numbers" ref={lineNumbersRef}>
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i + 1} className="line-num">
                  {i + 1}
                </div>
              ))}
            </div>
            <textarea
              ref={editorRef}
              className="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
            />
          </div>
        </div>

        <div className="right-panel">
          <div className="io-section input-section">
            <div className="panel-header">
              <span className="panel-title">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Stdin Input
              </span>
            </div>
            <textarea
              className="io-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your input here..."
              spellCheck="false"
            />
          </div>

          <div className="io-section output-section">
            <div className="panel-header output-header">
              <div className="output-tabs">
                <button
                  className={`tab ${activeTab === "output" ? "active" : ""}`}
                  onClick={() => setActiveTab("output")}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                  Output
                </button>
                <button
                  className={`tab ${activeTab === "error" ? "active" : ""}`}
                  onClick={() => setActiveTab("error")}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  Errors
                </button>
              </div>
              <div className="status-bar">
                {status === "success" && (
                  <span className="status-badge success">
                    <span className="status-dot" /> Compiled &amp; Run
                  </span>
                )}
                {status === "error" && (
                  <span className="status-badge error">
                    <span className="status-dot" /> Failed
                  </span>
                )}
                {execTime !== null && (
                  <span className="exec-time">{execTime}ms</span>
                )}
              </div>
            </div>
            <div className="output-content">
              {activeTab === "output" ? (
                <pre
                  className={`output-text ${
                    status === "success" ? "success" : ""
                  }`}
                >
                  {output || (
                    <span className="output-placeholder">
                      Output will appear here after you run your code...
                    </span>
                  )}
                </pre>
              ) : (
                <pre
                  className={`output-text ${
                    status === "error" ? "error-text" : ""
                  }`}
                >
                  {error || (
                    <span className="output-placeholder">
                      No compilation or runtime errors.
                    </span>
                  )}
                </pre>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <span className="footer-left">Built with React + Node.js</span>
        <span className="footer-right">
          {status === "running" ? (
            <span className="footer-status running">Compiling &amp; Executing...</span>
          ) : status === "success" ? (
            <span className="footer-status success">Ready</span>
          ) : status === "error" ? (
            <span className="footer-status error">Error</span>
          ) : (
            <span className="footer-status idle">Idle</span>
          )}
        </span>
      </footer>
    </div>
  );
}

export default App;
