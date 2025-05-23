from flask import Flask, request, session, jsonify
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "johnpork"
app.config.update(
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=True
)
CORS(
    app,
    supports_credentials=True,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:3000",           
                 r"https://.*\.vercel\.app"
            ]
        }
    }
)

users = {
    "admin": "admin123",
    "leo": "mypass"
}

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if users.get(username) == password:
        session["user"] = username
        return jsonify({"message": "Login successful", "user": username})
    else:
        return jsonify({"message": "Inval   id credentials"}), 401
    
@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user", None)
    return jsonify({"message": "Logged out"})

@app.route("/check-login", methods=["GET"])
def check_login():
    if "user" in session:
        return jsonify({"logged_in": True, "user": session["user"]})
    else:
        return jsonify({"logged_in": False})
    
if __name__ == "__main__":
    app.run(debug=True)