# HCAD
# Set up
- navigate to HCAD/backend
- execute Activate.ps1 in venv/Scripts
- set mongoDB url $env:MONGODB_URL = "mongodb://user:pass@host:27017/mydb"
- execute setup.ps1 in shell
    - if doesn't work run "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass"
    - run again
# Starting Site
- in shell run .\venv\Scripts\Activate.ps1
    - if doesn't work same fix as before
- once in venv run python app.py
    - might have to install flask "pip install flask flask-cors"

- in seperate terminal navigate to frontend
- if first time run "npm install"
- run "npm start"
- website should open automatically on http://localhost:3000/