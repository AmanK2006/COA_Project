# COA Assembler — Setup & Usage Guide

## Project Structure

```
COA_Project/
├── Encoder/
│   ├── encoder.py       # Core assembler logic (hex + binary output)
│   ├── server.py        # Flask REST API server
│   └── requirements.txt
└── Frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.js
    │   └── components/
    │       ├── Header/
    │       │   ├── Header.jsx
    │       │   └── Header.css
    │       ├── InputPanel/
    │       │   ├── InputPanel.jsx
    │       │   └── InputPanel.css
    │       └── OutputPanel/
    │           ├── OutputPanel.jsx
    │           └── OutputPanel.css
    └── package.json
```

---

## Backend Setup (Flask)

### 1. Install dependencies
```bash
cd Encoder
pip install -r requirements.txt
```

### 2. Start the server
```bash
python server.py
```
The API will be available at `http://localhost:5000`.

### API Endpoint
**POST** `/assemble`

Request body:
```json
{
  "source": "mov r0, 5\nadd r1, r0, r2",
  "format": "binary"   // or "hex"
}
```

Response:
```json
{
  "instructions": ["0100100000000101", "0000000001000010"],
  "count": 2,
  "format": "binary"
}
```

---

## Frontend Setup (React)

### 1. Install dependencies
```bash
cd Frontend
npm install
```

### 2. Start development server
```bash
npm start
```
The app will open at `http://localhost:3000`.

> ⚠️ Make sure the Flask backend is running before using the frontend.

---

## Features

- **Write Mode** — Type assembly directly in the code editor with line numbers
- **Upload Mode** — Drag & drop or browse for `.asm`, `.s`, or `.txt` files
- **Output Format** — Toggle between Binary (16-bit) and Hex (4-digit) output
- **Color-coded Output** — Opcode bits highlighted separately from operand bits
- **Stats** — Instruction count, byte size, and encoding base shown at a glance
- **Copy / Download** — Copy output to clipboard or download as a `.txt` file

---

## Supported Instructions

| Instruction | Opcode | Format |
|-------------|--------|--------|
| add, sub, mul, div, mod | Arithmetic | `op rd, rs1, rs2` |
| cmp | Compare | `cmp rs1, rs2` |
| and, or, not | Logical | `op rd, rs1, rs2` |
| mov | Move | `mov rd, imm` |
| lsl, lsr, asr | Shift | `op rd, rs, imm` |
| nop | No-op | `nop` |
| ld, st | Memory | `ld/st rd, addr` |
| beq, bgt, b | Branch | `op label` |
| call | Call | `call label` |
| ret | Return | `ret` |
