import React, { useState, useRef } from "react";
import "./InputPanel.css";

const PLACEHOLDER = `// Example Assembly Program
// COA Assembler - Enter your code here

start:
  mov r0, 5
  mov r1, 3
  add r2, r0, r1
  cmp r2, r0
  beq done
  sub r3, r2, r1

done:
  nop
  ret`;

function InputPanel({ outputFormat, setOutputFormat, onAssemble, loading }) {
  const [inputMode, setInputMode] = useState("manual"); // "manual" | "upload"
  const [code, setCode] = useState("");
  const [fileName, setFileName] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFileLoad = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target.result);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e) => {
    handleFileLoad(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileLoad(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleClear = () => {
    setCode("");
    setFileName(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = () => {
    const source = code.trim();
    if (!source) return;
    onAssemble(source);
  };

  const lineCount = code ? code.split("\n").length : 0;

  return (
    <section className="panel input-panel">
      <div className="panel__header">
        <div className="panel__header-left">
          <span className="panel__label">INPUT</span>
          <span className="panel__tag">Assembly Source</span>
        </div>
        {lineCount > 0 && (
          <span className="panel__line-count">{lineCount} lines</span>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-toggle__btn ${inputMode === "manual" ? "mode-toggle__btn--active" : ""}`}
          onClick={() => setInputMode("manual")}
        >
          <span className="mode-toggle__icon">✎</span>
          Write Code
        </button>
        <button
          className={`mode-toggle__btn ${inputMode === "upload" ? "mode-toggle__btn--active" : ""}`}
          onClick={() => setInputMode("upload")}
        >
          <span className="mode-toggle__icon">↑</span>
          Upload File
        </button>
      </div>

      {/* Upload Area */}
      {inputMode === "upload" && (
        <div
          className={`dropzone ${dragOver ? "dropzone--active" : ""} ${fileName ? "dropzone--loaded" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".asm,.s,.txt"
            className="dropzone__input"
            onChange={handleFileChange}
          />
          {fileName ? (
            <div className="dropzone__loaded">
              <span className="dropzone__file-icon">◈</span>
              <span className="dropzone__file-name">{fileName}</span>
              <span className="dropzone__file-lines">{lineCount} lines loaded</span>
            </div>
          ) : (
            <div className="dropzone__prompt">
              <span className="dropzone__icon">⬡</span>
              <span className="dropzone__text">Drop .asm / .s / .txt file here</span>
              <span className="dropzone__subtext">or click to browse</span>
            </div>
          )}
        </div>
      )}

      {/* Code Editor */}
      <div className="editor-wrapper">
        <div className="editor-gutter">
          {(code || inputMode === "manual")
            ? (code || PLACEHOLDER).split("\n").map((_, i) => (
                <span key={i} className="editor-gutter__line">{i + 1}</span>
              ))
            : null}
        </div>
        <textarea
          className="editor"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>

      {/* Format & Controls */}
      <div className="controls">
        <div className="format-selector">
          <span className="format-selector__label">OUTPUT FORMAT</span>
          <div className="format-selector__options">
            <button
              className={`format-btn ${outputFormat === "binary" ? "format-btn--active" : ""}`}
              onClick={() => setOutputFormat("binary")}
            >
              <span className="format-btn__dot" />
              Binary
            </button>
            <button
              className={`format-btn ${outputFormat === "hex" ? "format-btn--active" : ""}`}
              onClick={() => setOutputFormat("hex")}
            >
              <span className="format-btn__dot" />
              Hex
            </button>
          </div>
        </div>

        <div className="controls__actions">
          <button className="btn btn--ghost" onClick={handleClear} disabled={!code}>
            Clear
          </button>
          <button
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={!code.trim() || loading}
          >
            {loading ? (
              <span className="btn__loading">
                <span className="btn__spinner" />
                Encoding...
              </span>
            ) : (
              <span>▶ Assemble</span>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

export default InputPanel;
