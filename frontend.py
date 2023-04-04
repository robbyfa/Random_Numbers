from flask import Flask, send_from_directory

app = Flask(__name__, static_folder="frontend")

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

if __name__ == "__main__":
    app.run(host="localhost", port=8080, debug=True)
