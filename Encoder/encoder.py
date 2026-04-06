import re

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
REG_MAP = {
    "r0":  "0000", "r1":  "0001", "r2":  "0010", "r3":  "0011",
    "r4":  "0100", "r5":  "0101", "r6":  "0110", "r7":  "0111",
    "r8":  "1000", "r9":  "1001", "r10": "1010", "r11": "1011",
    "r12": "1100", "r13": "1101", "r14": "1110", "r15": "1111"
}

# -------- CLEAN LINE --------
def clean_line(line):
    return line.split("//")[0].strip()

# -------- TOKENIZER --------
def tokenize(line):
    line = line.replace(",", " ")
    line = re.sub(r"\s+", " ", line)
    return line.strip().split()

# -------- SIGNED BINARY --------
def to_signed_bin(value, bits):
    max_val = 2 ** bits
    if value < 0:
        value = max_val + value
    binary = bin(value)[2:]
    return binary.zfill(bits)

# -------- LABEL SCAN --------
def scan_labels(lines):
    labels = {}
    pc = 0

    for lineno, line in enumerate(lines, start=1):
        line = clean_line(line)
        if not line:
            continue

        if ":" in line:
            label, *rest = line.split(":")
            label = label.strip()
            labels[label] = pc
            if rest and rest[0].strip():
                pc += 1
        else:
            pc += 1

    return labels

# -------- TRANSLATE --------
def translate_line(line, labels, pc, lineno):
    line = clean_line(line)
    if not line:
        return None

    if ":" in line:
        parts = line.split(":")
        if len(parts) > 1 and parts[1].strip():
            line = parts[1].strip()
        else:
            return None

    tokens = tokenize(line)
    if not tokens:
        return None

    op = tokens[0]
    if op not in OPS:
        raise ValueError(f"[Line {lineno}] Invalid opcode: {op}")

    op_bits = OPS[op]

    # NO OPERAND
    if op in ["nop", "ret"]:
        return op_bits + "0" * 11

    # BRANCH
    if op in ["beq", "bgt", "b", "call"]:
        if len(tokens) < 2:
            raise ValueError(f"[Line {lineno}] Missing label")

        label = tokens[1]
        if label not in labels:
            raise ValueError(f"[Line {lineno}] Undefined label: {label}")

        offset = labels[label] - pc - 1
        return op_bits + to_signed_bin(offset, 11)

    # NORMAL
    bits = op_bits
    for operand in tokens[1:]:
        if operand in REG_MAP:
            bits += REG_MAP[operand]
        else:
            try:
                value = int(operand)
                bits += to_signed_bin(value, 4)
            except:
                raise ValueError(f"[Line {lineno}] Invalid operand: {operand}")

    return bits.ljust(16, "0")


# -------- FINAL FUNCTION (USED BY FLASK) --------
def assemble_text(source_code, output_format="binary"):
    lines = source_code.split("\n")

    labels = scan_labels(lines)

    output_bin = []
    output_hex = []
    pc = 0

    for lineno, line in enumerate(lines, start=1):
        machine = translate_line(line, labels, pc, lineno)

        if machine:
            output_bin.append(machine)
            hex_val = hex(int(machine, 2))[2:].zfill(4)
            output_hex.append("0x" + hex_val.upper())
            pc += 1

    return output_hex if output_format == "hex" else output_bin