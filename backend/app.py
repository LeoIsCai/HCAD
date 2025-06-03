from flask import Flask, request, session, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os

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
MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    raise RuntimeError("MONGODB_URL nicht gesetzt!")

client = MongoClient(MONGODB_URL)
db = client.hcad                  
users_coll = db.users  

requests_coll = db.requests


@app.route("/register", methods=["POST", "OPTIONS"])
def register():
    if request.method == "OPTIONS":
        
        return ("", 200)
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username und Passwort erforderlich"}), 400

    existing = users_coll.find_one({"username": username})
    if existing:
        return jsonify({"message": "Username existiert bereits"}), 400

    users_coll.insert_one({
        "username": username,
        "password": password  #hashing missing
    })
    return jsonify({"message": "Account erfolgreich erstellt"}), 200

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username und Passwort erforderlich"}), 400

    user_doc = users_coll.find_one({"username": username})
    if user_doc and user_doc.get("password") == password:
        session["user"] = username
        return jsonify({"message": "Login erfolgreich", "user": username}), 200
    else:
        return jsonify({"message": "Ungültige Anmelde­daten"}), 401
    
@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user", None)
    return jsonify({"message": "Abgemeldet"}), 200

@app.route("/check-login", methods=["GET"])
def check_login():
    if "user" in session:
        return jsonify({"logged_in": True, "user": session["user"]}), 200
    else:
        return jsonify({"logged_in": False}), 200
    
if __name__ == "__main__":
    app.run(debug=True)