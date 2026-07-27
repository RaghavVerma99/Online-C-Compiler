import { useState, useCallback, useRef } from "react";
import Header from "./components/Header";
import Editor from "./components/Editor";
import Output from "./components/Output";
import Footer from "./components/Footer";
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
  const codeRef = useRef(code);

  codeRef.current = code;

  const handleCompile = useCallback(async () => {
    setStatus("running");
    setOutput("");
    setError("");
    setExecTime(null);

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
      setError(
        "Failed to connect to server. Make sure the backend is running on port 5000."
      );
      setStatus("error");
    }
  }, []);

  return (
    <div className="app">
      <div className="bg-glow glow-1" />
      <div className="bg-glow glow-2" />

      <Header status={status} onCompile={handleCompile} />

      <main className="main">
        <Editor
          code={code}
          onChange={setCode}
          onCompile={handleCompile}
        />
        <Output
          output={output}
          error={error}
          status={status}
          execTime={execTime}
        />
      </main>

      <Footer status={status} />
    </div>
  );
}

export default App;