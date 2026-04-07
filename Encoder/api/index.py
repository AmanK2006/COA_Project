from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(BASE_DIR)

from src.encoder import assemble_text

app = Flask(__name__)
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=True
)

@app.route("/api")
def home():
    return "Server is running"

@app.route("/api/assemble", methods=["POST"])
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


# REQUIRED FOR VERCEL
def handler(request):
    return app(request.environ, lambda status, headers: None)