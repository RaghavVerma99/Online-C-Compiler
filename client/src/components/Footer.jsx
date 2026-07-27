function Footer({ status }) {
  return (
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
  );
}

export default Footer;