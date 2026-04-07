from flask import Flask, request, jsonify
from flask_cors import CORS
from flask import send_file
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
    data = request.get_json()

    if not data or "source" not in data:
        return jsonify({"error": "Missing 'source' field"}), 400

    source = data.get("source", "")
    output_format = data.get("format", "binary").lower()

    try:
        instructions = assemble_text(source, output_format)

        return jsonify({
            "instructions": instructions,
            "count": len(instructions),
            "format": output_format
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
