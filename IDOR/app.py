from flask import Flask, request, render_template_string
import os

app = Flask(__name__)

users = {
    str(i): {
        "id": i,
        "username": f"user{i}",
        "data": f"This is user{i}'s profile."
    }
    for i in range(1, 501)
}

FLAG_USER_ID = "389"

@app.route("/user")
def get_user():
    user_id = request.args.get("id")
    if user_id in users:
        profile = users[user_id]
        flag = os.environ.get('FLAG') if user_id == FLAG_USER_ID else ""
        return render_template_string("""
<!DOCTYPE html>
<html>
<head>
    <title>{{ username }}'s Profile</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f2f2f2;
            padding: 40px;
        }
        .profile-box {
            background: white;
            max-width: 500px;
            margin: auto;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h2 {
            color: #333;
        }
        .flag {
            margin-top: 20px;
            padding: 15px;
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeeba;
            border-radius: 5px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="profile-box">
        <h2>Profile of {{ username }}</h2>
        <p><strong>User ID:</strong> {{ user_id }}</p>
        <p><strong>Info:</strong> {{ data }}</p>
        {% if flag %}
        <div class="flag">
            <strong>Flag:</strong> {{ flag }}
        </div>
        {% endif %}
    </div>
</body>
</html>
        """, username=profile['username'], user_id=profile['id'], data=profile['data'], flag=flag)
    return "User not found", 404
