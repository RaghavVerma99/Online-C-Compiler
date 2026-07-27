import { useRef, useCallback } from "react";
import { formatCpp } from "../utils/formatCpp";

function Editor({ code, onChange, onCompile }) {
  const editorRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (editorRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
    }
  }, []);

  const handleFormat = useCallback(() => {
    const formatted = formatCpp(code);
    onChange(formatted);
  }, [code, onChange]);

  const handleKeyDown = useCallback(
    (e) => {
      // Ctrl+Enter to compile
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onCompile();
      }

      // Shift+Alt+F to format
      if (e.shiftKey && e.altKey && e.key === "F") {
        e.preventDefault();
        handleFormat();
      }

      // Tab to insert spaces
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.target;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const val = ta.value;
        const newVal = val.substring(0, start) + "    " + val.substring(end);
        onChange(newVal);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 4;
        });
      }

      // Enter — smart auto-indent
      if (e.key === "Enter") {
        e.preventDefault();
        const ta = e.target;
        const start = ta.selectionStart;
        const val = ta.value;

        const lineStart = val.lastIndexOf("\n", start - 1) + 1;
        const currentLine = val.substring(lineStart, start);
        const indent = currentLine.match(/^(\s*)/)[1];
        const trimmedLine = currentLine.trimEnd();
        const lastChar = trimmedLine.slice(-1);

        let newIndent = indent;
        if (lastChar === "{" || lastChar === "(" || lastChar === "[") {
          newIndent = indent + "    ";
        }

        const insert = "\n" + newIndent;
        const newVal = val.substring(0, start) + insert + val.substring(start);
        const cursorPos = start + insert.length;

        onChange(newVal);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = cursorPos;
        });
      }
    },
    [onCompile, handleFormat, onChange]
  );

  const lineCount = code.split("\n").length;

  return (
    <div className="editor-panel">
      <div className="panel-bar">
        <div className="window-dots">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </div>
        <span className="file-name">main.cpp</span>
        <span className="cpp-badge">C++17</span>
        <div className="editor-actions">
          <button
            className="format-btn"
            onClick={handleFormat}
            title="Format Code (Shift+Alt+F)"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="21" y1="10" x2="7" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="21" y1="18" x2="7" y2="18" />
            </svg>
            <span>Format</span>
          </button>
        </div>
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
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck="false"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
        />
      </div>
    </div>
  );
}

export default Editor;