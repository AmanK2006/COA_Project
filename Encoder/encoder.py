import os

# -------- OPERATION CODES --------
OPS = {
    "add": "00000", "sub": "00001", "mul": "00010", "div": "00011",
    "mod": "00100", "cmp": "00101", "and": "00110", "or": "00111",
    "not": "01000", "mov": "01001",
    "lsl": "01010", "lsr": "01011", "asr": "01100",
    "nop": "01101",
    "ld": "01110", "st": "01111",
    "beq": "10000", "bgt": "10001", "b": "10010",
    "call": "10011", "ret": "10100"
}

# -------- REGISTER MAP --------
REG_MAP = {f"r{i}": format(i, "04b") for i in range(16)}

# -------- COMMENT REMOVAL --------
def clean_line(line):
    line = line.split("//")[0]
    return line.strip()

# -------- LABEL SCAN (PASS 1) --------
def scan_labels(lines):
    label_positions = {}
    pc = 0
    for line in lines:
        line = clean_line(line)
        if not line:
            continue
        if ":" in line:
            label, *rest = line.split(":")
            label = label.strip()
            label_positions[label] = pc
            if rest and rest[0].strip():
                pc += 1
        else:
            pc += 1
    return label_positions

# -------- TRANSLATE LINE (PASS 2) --------
def translate_line(line, label_map, pc):
    line = clean_line(line)
    if not line:
        return None
    if ":" in line:
        parts = line.split(":")
        if len(parts) > 1 and parts[1].strip():
            line = parts[1].strip()
        else:
            return None
    tokens = line.replace(",", "").split()
    op = tokens[0]
    if op not in OPS:
        raise ValueError(f"Invalid opcode: {op}")
    op_bits = OPS[op]

    if op in ["nop", "ret"]:
        return op_bits + "00000000000"

    if op in ["beq", "bgt", "b", "call"]:
        if len(tokens) < 2:
            raise ValueError(f"Missing label in: {line}")
        label = tokens[1]
        if label not in label_map:
            raise ValueError(f"Undefined label: {label}")
        offset = label_map[label] - pc - 1
        offset_bin = format(offset & 0x7FF, "011b")
        return op_bits + offset_bin

    bits = op_bits
    for operand in tokens[1:]:
        if operand in REG_MAP:
            bits += REG_MAP[operand]
        else:
            try:
                value = int(operand)
                bits += format(value & 0xF, "04b")
            except:
                raise ValueError(f"Invalid operand: {operand}")
    return bits.ljust(16, "0")

# -------- CONVERT BINARY TO HEX --------
def binary_to_hex(binary_str):
    """Convert 16-bit binary string to 4-digit hex string."""
    return format(int(binary_str, 2), "04X")

# -------- ASSEMBLE FROM TEXT --------
def assemble_text(source_text, output_format="binary"):
    """
    Assemble source assembly text into machine code.
    output_format: "binary" or "hex"
    Returns list of instruction strings.
    """
    lines = source_text.splitlines()
    label_map = scan_labels(lines)

    output = []
    pc = 0
    errors = []

    for line in lines:
        try:
            machine = translate_line(line, label_map, pc)
            if machine:
                if output_format == "hex":
                    output.append(binary_to_hex(machine))
                else:
                    output.append(machine)
                pc += 1
        except ValueError as e:
            errors.append(str(e))

    if errors:
        raise ValueError("\n".join(errors))

    return output

# -------- CLI ENTRYPOINT --------
def assemble_program(file_path, output_format="binary"):
    with open(file_path, "r") as f:
        source_text = f.read()

    instructions = assemble_text(source_text, output_format)

    ext = "_machine_hex.txt" if output_format == "hex" else "_machine.txt"
    output_file = os.path.splitext(file_path)[0] + ext
    with open(output_file, "w") as f:
        for instr in instructions:
            f.write(instr + "\n")

    print(f"✔ Output written to: {output_file}")

if __name__ == "__main__":
    file_input = input("Enter file name: ")
    fmt = input("Output format (binary/hex) [binary]: ").strip().lower() or "binary"
    assemble_program(file_input, fmt)
