import { useState, useCallback, useRef } from "react";
import "./App.css";

const DEFAULT_CODE = `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`;

function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const [execTime, setExecTime] = useState(null);
  const [activeTab, setActiveTab] = useState("output");
  const codeRef = useRef(code);
  const editorRef = useRef(null);
  const lineNumbersRef = useRef(null);

  codeRef.current = code;

  const handleCompile = useCallback(async () => {
    setStatus("running");
    setOutput("");
    setError("");
    setExecTime(null);
    setActiveTab("output");

    try {
      const res = await fetch("/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeRef.current, input: "" }),
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

      <header className="header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <span className="logo-text">CppLab</span>
          </div>
        </div>

        <div className="header-right">
          <span className="shortcut-hint">Ctrl+Enter</span>
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
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Run
              </>
            )}
          </button>
        </div>
      </header>

      <main className="main">
        <div className="editor-panel">
          <div className="panel-bar">
            <div className="window-dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <span className="file-name">main.cpp</span>
            <span className="cpp-badge">C++17</span>
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
          <div className="panel-bar">
            <div className="output-tabs">
              <button
                className={`tab ${activeTab === "output" ? "active" : ""}`}
                onClick={() => setActiveTab("output")}
              >
                Output
              </button>
              <button
                className={`tab ${activeTab === "error" ? "active" : ""}`}
                onClick={() => setActiveTab("error")}
              >
                Errors
              </button>
            </div>
            <div className="status-area">
              {status === "success" && (
                <span className="status-badge success">
                  <span className="status-dot" />
                </span>
              )}
              {status === "error" && (
                <span className="status-badge error">
                  <span className="status-dot" />
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
                    Output will appear here...
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
                    No errors.
                  </span>
                )}
              </pre>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <span className="footer-left">React + Node.js</span>
        <span className="footer-right">
          {status === "running" ? (
            <span className="footer-status running">Compiling...</span>
          ) : status === "success" ? (
            <span className="footer-status success">Done</span>
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
