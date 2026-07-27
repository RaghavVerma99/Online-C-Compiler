function Header({ status, onCompile }) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <div className="logo-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
          onClick={onCompile}
          disabled={status === "running"}
        >
          {status === "running" ? (
            <>
              <span className="spinner" />
              Running
            </>
          ) : (
            <>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Run
            </>
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;