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
      const response = await fetch(`/api/assemble`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: sourceCode,
          format: outputFormat,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(data.error || "Assembly failed.");
      } else {
        setOutput(data); // ✅ SHOW OUTPUT IN PANEL
      }
    } catch (err) {
      setError("Could not reach the server. Is Flask running?");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
  if (!output) return;

  const text = output?.instructions?.join("\n") || "";
  const ext = output.format === "hex" ? "hex" : "bin";

  const blob = new Blob([text], { type: "application/octet-stream" }); // ✅ better type
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;

  // ✅ FIXED (removed .txt)
  a.download = `output_machine.${ext}`;

  a.click();
  URL.revokeObjectURL(url);
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
          onDownload={handleDownload}
        />
      </main>
    </div>
  );
}

export default App;
