import { useState } from "react";

function Output({ output, error, status, execTime }) {
  const [activeTab, setActiveTab] = useState("output");

  return (
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
            className={`output-text ${status === "success" ? "success" : ""}`}
          >
            {output || (
              <span className="output-placeholder">
                Output will appear here...
              </span>
            )}
          </pre>
        ) : (
          <pre
            className={`output-text ${status === "error" ? "error-text" : ""}`}
          >
            {error || (
              <span className="output-placeholder">No errors.</span>
            )}
          </pre>
        )}
      </div>
    </div>
  );
}

export default Output;