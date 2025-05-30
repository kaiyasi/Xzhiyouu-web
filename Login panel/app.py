import os
import sqlite3
from flask import Flask, request, render_template_string

app = Flask(__name__)
FLAG = os.getenv("FLAG", "FLAG{default_flag}")

DB_PATH = "data.db"
if not os.path.exists(DB_PATH):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT);")
    conn.execute("INSERT INTO users (username, password) VALUES ('7348r43gfgo834gtf438fg48ft7', 'gfigfi43fiu3oifg3i4gf3gfu3gfi93');")
    conn.commit()
    conn.close()

@app.route("/", methods=["GET", "POST"])
def index():
    html = '''
    <!doctype html>
    <html lang="en">
      <head>
        <title>Login Panel</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body {
            background-color: #f8f9fa;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .card {
            width: 100%;
            max-width: 400px;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 0 15px rgba(0,0,0,0.1);
          }
          #magic-box {
            display: none;
            white-space: pre-wrap;
            background-color: #f1f1f1;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 10px;
            margin-top: 15px;
            font-family: monospace;
          }
        </style>
        <script>
          function updateMagic() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
            document.getElementById('magic-box').textContent = sql;
          }

          function toggleMagic() {
            const box = document.getElementById('magic-box');
            box.style.display = box.style.display === 'none' ? 'block' : 'none';
          }
        </script>
      </head>
      <body>
        <div class="card">
          <h3 class="text-center mb-4">Login</h3>
          <form method="POST" oninput="updateMagic()">
            <div class="mb-3">
              <label class="form-label">Username</label>
              <input id="username" name="username" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input id="password" name="password" class="form-control" type="password" required>
            </div>
            <button type="submit" class="btn btn-primary w-100">Login</button>
          </form>
          <button onclick="toggleMagic()" class="btn btn-secondary w-100 mt-2">Magic</button>
          <div id="magic-box" class="mt-2"></div>
          {% if message %}
          <div class="alert alert-info mt-3 text-center">{{ message }}</div>
          {% endif %}
        </div>
      </body>
    </html>
    '''
    message = ""
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        conn = sqlite3.connect(DB_PATH)
        query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
        try:
            cursor = conn.execute(query)
            if cursor.fetchone():
                message = FLAG
            else:
                message = "Login failed."
        except Exception as e:
            message = f"SQL Error: {e}"
    return render_template_string(html, message=message)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
