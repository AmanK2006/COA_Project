import React, { useState } from "react";
import "./App.css";
import InputPanel from "./Components/InputPanel";
import OutputPanel from "./Components/OutputPanel";
import Header from "./Components/Header";

function App() {
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [outputFormat, setOutputFormat] = useState("binary");

  const handleAssemble = async (sourceCode) => {
    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/assemble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: sourceCode,
          format: outputFormat,
        }),
      });

      // Safer JSON parsing
      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(data.error || "Assembly failed.");
      } else {
        setOutput(data);
      }
    } catch (err) {
      setError("Could not reach the server. Is Flask running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Header />

      <main className="app__main">
        <InputPanel
          outputFormat={outputFormat}
          setOutputFormat={setOutputFormat}
          onAssemble={handleAssemble}
          loading={loading}
        />

        <OutputPanel
          output={output}
          error={error}
          loading={loading}
        />
      </main>
    </div>
  );
}

export default App;