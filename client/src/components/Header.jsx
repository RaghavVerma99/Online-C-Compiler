function Header({ status, onCompile }) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo" title="CppLab — Online C++ Compiler">
          <div className="logo-icon">
            <svg className="logo-svg" viewBox="0 0 48 48" fill="none">
              <defs>
                <linearGradient id="logo-bg" x1="0" y1="0" x2="48" y2="48">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="logo-stroke" x1="6" y1="4" x2="42" y2="44">
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="100%" stopColor="#67e8f9" />
                </linearGradient>
              </defs>
              <rect className="logo-rect" x="5" y="5" width="38" height="38" rx="11" fill="url(#logo-bg)" />
              <rect className="logo-ring" x="1.5" y="1.5" width="45" height="45" rx="14" stroke="url(#logo-stroke)" strokeWidth="1.4" strokeDasharray="12 8" strokeLinecap="round" opacity="0.9" />
              <path d="M20 18 L14 24 L20 30" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M28 18 L34 24 L28 30" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <line x1="23.5" y1="15.5" x2="23.5" y2="32.5" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
            </svg>
          </div>
          <span className="logo-text">
            Cpp<span className="logo-text-grad">Lab</span>
          </span>
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
                className="run-icon"
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
