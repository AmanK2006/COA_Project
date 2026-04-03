from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Allow importing encoder from the same directory
sys.path.insert(0, os.path.dirname(__file__))
from encoder import assemble_text

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return "Server is running"

@app.route("/assemble", methods=["POST"])
def assemble():
    """
    Accepts JSON: { "source": "<assembly code>", "format": "binary" | "hex" }
    Returns JSON: { "instructions": [...], "count": N }
    Or on error:  { "error": "..." }
    """
    data = request.get_json()
    if not data or "source" not in data:
        return jsonify({"error": "Missing 'source' field in request body."}), 400

    source = data.get("source", "")
    output_format = data.get("format", "binary").lower()

    if output_format not in ("binary", "hex"):
        return jsonify({"error": "Invalid format. Use 'binary' or 'hex'."}), 400

    if not source.strip():
        return jsonify({"error": "Source code is empty."}), 400

    try:
        instructions = assemble_text(source, output_format)
        return jsonify({
            "instructions": instructions,
            "count": len(instructions),
            "format": output_format
        })
    except ValueError as e:
        return jsonify({"error": str(e)}), 422
    except Exception as e:
        return jsonify({"error": f"Internal error: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
