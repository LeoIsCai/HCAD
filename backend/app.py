from flask import Flask, request, session, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os

# --- Application Factory ---
def create_app():
    app = Flask(__name__)
    app.secret_key = os.getenv("SECRET_KEY", "johnpork")
    app.config.update(
        SESSION_COOKIE_SAMESITE="None",
        SESSION_COOKIE_SECURE=True
    )

    # CORS setup: erlaubt Preflight-OPTIONS global
    CORS(
        app,
        supports_credentials=True,
        resources={r"/*": {"origins": [
            "http://localhost:3000",
            r"https://.*\.vercel\.app"
        ]}}
    )

    # MongoDB connection
    mongodb_url = os.getenv("MONGODB_URL")
    if not mongodb_url:
        raise RuntimeError("MONGODB_URL is not set!")
    client = MongoClient(mongodb_url)
    db = client.hcad
    app.collections = {
        'users': db.users,
        'posts': db.posts,
        'requests': db.requests
    }

    # Register all routes
    register_routes(app)
    return app

# --- Helper Decorator ---
def require_login(fn):
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # Allow CORS preflight without session
        if request.method == 'OPTIONS':
            return ('', 200)
        if 'user' not in session:
            return jsonify({"message": "Nicht angemeldet"}), 401
        return fn(*args, **kwargs)
    return wrapper

# --- Route Definitions ---
def register_routes(app):
    users = app.collections['users']
    posts = app.collections['posts']
    reqs  = app.collections['requests']

    # Registration
    @app.route('/register', methods=['OPTIONS', 'POST'])
    def register():
        if request.method == 'OPTIONS':
            return '', 200
        data = request.get_json(silent=True) or {}
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        if not username or not password:
            return jsonify({"message": "Username und Passwort erforderlich"}), 400
        if users.find_one({'username': username}):
            return jsonify({"message": "Username existiert bereits"}), 400
        users.insert_one({'username': username, 'password': password})
        return jsonify({"message": "Account erfolgreich erstellt"}), 200

    # Login
    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json(silent=True) or {}
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        if not username or not password:
            return jsonify({"message": "Username und Passwort erforderlich"}), 400
        user_doc = users.find_one({'username': username})
        if user_doc and user_doc.get('password') == password:
            session['user'] = username
            return jsonify({"message": "Login erfolgreich", "user": username}), 200
        return jsonify({"message": "Ungültige Anmelde­daten"}), 401

    # Logout
    @app.route('/logout', methods=['OPTIONS', 'POST'])
    @require_login
    def logout():
        session.pop('user', None)
        return jsonify({"message": "Abgemeldet"}), 200

    # Check session
    @app.route('/check-login', methods=['GET'])
    def check_login():
        if 'user' in session:
            return jsonify({"logged_in": True, "user": session['user']}), 200
        return jsonify({"logged_in": False}), 200

    # User profile
    @app.route('/user', methods=['OPTIONS', 'GET', 'PUT'])
    @require_login
    def user_profile():
        if request.method == 'OPTIONS':
            return '', 200
        username = session['user']
        if request.method == 'GET':
            user_doc = users.find_one({'username': username}, {'_id': 0, 'password': 0})
            if user_doc:
                return jsonify(user_doc), 200
            return jsonify({"message": "User nicht gefunden"}), 404
        # PUT: update profile
        data = request.get_json(silent=True) or {}
        update = {}
        for f in ('password', 'email', 'fullname'):
            if data.get(f): update[f] = data[f]
        if not update:
            return jsonify({"message": "Keine Felder zum Aktualisieren übergeben"}), 400
        res = users.update_one({'username': username}, {'$set': update})
        if res.matched_count:
            return jsonify({"message": "Profil aktualisiert"}), 200
        return jsonify({"message": "Update fehlgeschlagen"}), 500

    # Posts
    @app.route('/posts', methods=['OPTIONS', 'GET', 'POST'])
    @require_login
    def handle_posts():
        if request.method == 'OPTIONS':
            return '', 200
        if request.method == 'GET':
            all_posts = list(posts.find({}, {'_id': 0}).sort('timestamp', -1))
            return jsonify(all_posts), 200
        data = request.get_json(silent=True) or {}
        content = data.get('content', '').strip()
        if not content:
            return jsonify({"message": "Beitrag darf nicht leer sein"}), 400
        posts.insert_one({'username': session['user'], 'content': content, 'timestamp': datetime.utcnow()})
        return jsonify({"message": "Beitrag erstellt"}), 200

    # Help requests
    @app.route('/requests', methods=['OPTIONS', 'GET', 'POST'])
    @require_login
    def handle_requests():
        if request.method == 'OPTIONS':
            return '', 200
        if request.method == 'GET':
            results = []
            for doc in reqs.find({}, {'__v': 0}).sort('timestamp', -1):
                answers = [
                    {'username': a['username'], 'content': a['content'], 'timestamp': a['timestamp'].isoformat()}
                    for a in doc.get('answers', [])
                ]
                results.append({
                    'id': str(doc['_id']), 'username': doc['username'],
                    'anliegen': doc['anliegen'], 'adresse': doc['adresse'],
                    'telefon': doc['telefon'], 'name': doc['name'],
                    'datumzeit': doc['datumzeit'], 'beschreibung': doc['beschreibung'],
                    'timestamp': doc['timestamp'].isoformat(), 'answers': answers
                })
            return jsonify(results), 200
        # POST
        data = request.get_json(silent=True) or {}
        fields = ('anliegen','adresse','telefon','name','datumzeit','beschreibung')
        if not all(data.get(f, '').strip() for f in fields):
            return jsonify({"message": "Bitte fülle alle Felder aus"}), 400
        req_doc = {f: data[f].strip() for f in fields}
        req_doc.update({'username': session['user'], 'timestamp': datetime.utcnow(), 'answers': []})
        new_id = reqs.insert_one(req_doc).inserted_id
        return jsonify({"message": "Anfrage erfolgreich erstellt", "id": str(new_id)}), 200

    # Add answer
    @app.route('/requests/<string:req_id>/answers', methods=['OPTIONS', 'POST'])
    @require_login
    def add_answer(req_id):
        if request.method == 'OPTIONS':
            return '', 200
        data = request.get_json(silent=True) or {}
        content = data.get('content', '').strip()
        if not content:
            return jsonify({"message": "Antwort darf nicht leer sein"}), 400
        try:
            oid = ObjectId(req_id)
        except Exception:
            return jsonify({"message": "Ungültige Anfrage‐ID"}), 400
        answer = {'username': session['user'], 'content': content, 'timestamp': datetime.utcnow()}
        res = reqs.update_one({'_id': oid}, {'$push': {'answers': answer}})
        if res.matched_count != 1:
            return jsonify({"message": "Anfrage nicht gefunden"}), 404
        return jsonify({"message": "Antwort erfolgreich hinzugefügt"}), 200
    
app = create_app()

# --- Run Application ---
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
