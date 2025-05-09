import os
from flask import Flask, request, render_template_string

app = Flask(__name__)

FLAG = os.getenv("FLAG", "FLAG{default_flag}")  # 預設值防止本地測試時出錯

@app.route("/", methods=["GET", "POST"])
def index():
    html = '''
    <!doctype html>
    <html lang="en">
      <head>
        <title>Login Panel</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body {{
            background-color: #f8f9fa;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }}
          .card {{
            width: 100%;
            max-width: 400px;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 0 15px rgba(0,0,0,0.1);
          }}
        </style>
      </head>
      <body>
        <div class="card">
          <h3 class="text-center mb-4">Login</h3>
          <form method="POST">
            <div class="mb-3">
              <label class="form-label">Username</label>
              <input name="username" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input name="password" class="form-control" type="password" required>
            </div>
            <button type="submit" class="btn btn-primary w-100">Login</button>
          </form>
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
        import sqlite3
        conn = sqlite3.connect(":memory:")
        conn.execute("CREATE TABLE users (username TEXT, password TEXT);")
        conn.execute("INSERT INTO users VALUES ('admin', 'admin123');")
        query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
        cursor = conn.execute(query)
        if cursor.fetchone():
            message = FLAG
        else:
            message = "Login failed."
    return render_template_string(html, message=message)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
