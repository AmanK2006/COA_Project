import React, { useState } from "react";
import "./OutputPanel.css";

function OutputPanel({ output, error, loading }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!output) return;
    const text = output?.instructions?.join("\n") || ""
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const handleDownload = () => {
    if (!output) return;
    const text = output?.instructions?.join("\n") || ""
    const ext = output.format === "hex" ? "hex" : "bin";
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `output_machine.${ext}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isEmpty = !output && !error && !loading;

  return (
    <section className="panel output-panel">
      <div className="panel__header">
        <div className="panel__header-left">
          <span className="panel__label panel__label--output">OUTPUT</span>
          <span className="panel__tag">Machine Code</span>
          {output && (
            <span className={`output-panel__format-badge output-panel__format-badge--${output.format}`}>
              {output.format.toUpperCase()}
            </span>
          )}
        </div>
        {output && (
          <div className="output-panel__actions">
            <button className="icon-btn" onClick={handleCopy} title="Copy to clipboard">
              {copied ? "✔ Copied" : "⎘ Copy"}
            </button>
            <button className="icon-btn icon-btn--accent" onClick={handleDownload} title="Download file">
              ↓ Download
            </button>
          </div>
        )}
      </div>

      <div className="output-panel__body">
        {loading && (
          <div className="output-panel__state">
            <div className="output-panel__loader">
              <div className="loader-bar" />
              <div className="loader-bar" style={{ animationDelay: "0.15s" }} />
              <div className="loader-bar" style={{ animationDelay: "0.3s" }} />
            </div>
            <p className="output-panel__state-text">Assembling...</p>
          </div>
        )}

        {!loading && error && (
          <div className="output-panel__state">
            <div className="output-panel__error-icon">✕</div>
            <p className="output-panel__error-title">Assembly Failed</p>
            <pre className="output-panel__error-msg">{error}</pre>
          </div>
        )}

        {!loading && isEmpty && (
          <div className="output-panel__state output-panel__state--empty">
            <div className="output-panel__empty-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="output-panel__empty-row">
                  <span className="output-panel__empty-addr">0x{(i * 2).toString(16).padStart(4, "0")}</span>
                  <span className="output-panel__empty-bits">{"·".repeat(16)}</span>
                </div>
              ))}
            </div>
            <p className="output-panel__state-text">Awaiting assembly input</p>
          </div>
        )}

        {!loading && output && (
          <>
            <div className="output-panel__stats">
              <div className="stat">
                <span className="stat__value">{output.count}</span>
                <span className="stat__label">Instructions</span>
              </div>
              <div className="stat">
                <span className="stat__value">{output.count * 2}</span>
                <span className="stat__label">Bytes</span>
              </div>
              <div className="stat">
                <span className="stat__value">{output.format === "hex" ? "16" : "2"}</span>
                <span className="stat__label">Base</span>
              </div>
            </div>

            <div className="output-panel__table-wrapper">
              <table className="output-table">
                <thead>
                  <tr>
                    <th className="output-table__th output-table__th--addr">ADDR</th>
                    <th className="output-table__th output-table__th--dec">DEC</th>
                    <th className="output-table__th output-table__th--instr">INSTRUCTION</th>
                  </tr>
                </thead>
                <tbody>
                  {output.instructions.map((instr, i) => {
                    const decimal = output.format === "hex"
                      ? parseInt(instr, 16)
                      : parseInt(instr, 2);
                    return (
                      <tr key={i} className="output-table__row">
                        <td className="output-table__td output-table__td--addr">
                          {i.toString(16).toUpperCase().padStart(4, "0")}
                        </td>
                        <td className="output-table__td output-table__td--dec">
                          {decimal}
                        </td>
                        <td className="output-table__td output-table__td--instr">
                          {output.format === "binary"
                            ? <BinaryDisplay bits={instr} />
                            : <span className="hex-instr">{instr}</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function BinaryDisplay({ bits }) {
  // Color-code opcode (5 bits) vs operands (11 bits)
  const opcode = bits.slice(0, 5);
  const operands = bits.slice(5);
  return (
    <span className="binary-instr">
      <span className="binary-instr__opcode">{opcode}</span>
      <span className="binary-instr__sep"> </span>
      <span className="binary-instr__operands">{operands}</span>
    </span>
  );
}

export default OutputPanel;
