from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Test portfolio"
    
if __name__ == "__main__":
    app.run(debug=True)