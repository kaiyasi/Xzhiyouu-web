import os
import sqlite3
from flask import Flask, request, render_template_string, redirect, make_response

app = Flask(__name__)

flag1 = os.getenv("FLAG1", "TkhJU0NDVEZ7ZGVmYXVsdDF9")
flag2 = os.getenv("FLAG2", "TkhJU0NDVEZ7ZGVmYXVsdDJ9") 
flag3 = os.getenv("FLAG3", "TkhJU0NDVEZ7ZGVmYXVsdDN9") 

html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Triple Trouble</title>
    <style>
        body {{
            background-color: {bg_color};
            color: {text_color};
            font-family: 'Courier New', Courier, monospace;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px;
        }}
        h2 {{
            color: {title_color};
            text-shadow: 0 0 8px {title_color};
        }}
        .flag {{
            padding: 10px;
            border: 2px dashed #ffff00;
            font-size: 1.2em;
            margin: 20px 0;
            animation: glow 1s ease-in-out infinite alternate;
        }}
        .yellow {{ color: #ffff00; border-color: #ffff00; }}
        .red {{ color: #ff5c5c; border-color: #ff5c5c; }}
        @keyframes glow {{
            from {{ box-shadow: 0 0 10px currentColor; }}
            to {{ box-shadow: 0 0 20px currentColor; }}
        }}
        .container {{
            max-width: 600px;
            text-align: center;
        }}
    </style>
</head>
<body>
    <div class="container">
        {content}
    </div>
</body>
</html>
"""

# 初始化資料庫
DB_PATH = "data.db"
if not os.path.exists(DB_PATH):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT);")
    conn.execute("INSERT INTO users (username, password) VALUES ('7348r43gfgo834gtf438fg48ft7', 'gfigfi43fiu3oifg3i4gf3gfu3gfi93');")
    conn.commit()
    conn.close()

# 登入頁面 (SQLi + magic)
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
        background: linear-gradient(135deg, #121212, #1f1f1f);
        color: #f1f1f1;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: 'Courier New', monospace;
      }
      .card {
        background-color: #1e1e1e;
        width: 100%;
        max-width: 400px;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 0 25px rgba(0, 255, 200, 0.2);
        border: 1px solid #00ffc8;
      }
      .card h3 {
        color: #00ffc8;
        text-shadow: 0 0 8px #00ffc8;
      }
      label {
        color: #ccc;
      }
      input[type="text"], input[type="password"] {
        background-color: #2b2b2b;
        border: 1px solid #555;
        color: #f1f1f1;
      }
      input[type="submit"] {
        background-color: #00ffc8;
        border: none;
        color: #000;
        font-weight: bold;
        transition: 0.3s;
      }
      input[type="submit"]:hover {
        background-color: #00cca5;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h3 class="text-center mb-4">Login Panel</h3>
      <form method="POST">
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
                return redirect("/user?id=1")
            else:
                message = "Login failed."
        except Exception as e:
            message = f"SQL Error: {e}"
    return render_template_string(html, message=message)

# 第二段邏輯：IDOR + Cookie check
@app.route("/user")
def user_page():
    user_id = request.args.get("id", "")
    if user_id == "1056":
        cookie_value = request.cookies.get("flag")
        if cookie_value == "1":
            content = f"""
            <h2>Second Flag</h2>
            <div class="flag red">{flag2}</div>
            <p>Hint: The final flag is hidden in <code>/secret</code></p>
            """
            return html_template.format(
                content=content,
                bg_color="#1c0e0e", text_color="#ffcccc", title_color="#ff5c5c"
            )
        else:
            resp = make_response(html_template.format(
                content="""
                <h2>Welcome Admin</h2>
                <p>You don’t have enough privilege yet. Try something else.</p>
                """,
                bg_color="#180d2b", text_color="#ddd", title_color="#b276ff"
            ))
            resp.set_cookie("flag", "0")
            return resp

    elif user_id == "1":
        content = f"""
        <h2>Login Success</h2>
        <p>Here is your first flag:</p>
        <div class="flag yellow">{flag1}</div>
        """
        return html_template.format(
            content=content,
            bg_color="#1e1e1e", text_color="#ffffcc", title_color="#ffff00"
        )
    else:
        return html_template.format(
            content="<p>Unknown user.</p>",
            bg_color="#222", text_color="#ccc", title_color="#ccc"
        )

# 第三段：curl-only Flag 顯示
@app.route("/secret")
def secret():
    user_agent = request.headers.get("User-Agent", "")
    if "curl" in user_agent.lower():
        return flag3
    return """
    <!--
       _____       _           
      / ____|     | |          
     | (___   __ _| | ___ _ __ 
      \___ \ / _` | |/ _ \ '__|
      ____) | (_| | |  __/ |   
     |_____/ \__,_|_|\___|_|   

     Hint: Try to GET the flag using curl!
    -->
    """

# 執行主程式
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
