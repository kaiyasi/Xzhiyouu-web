from flask import Flask, request, render_template_string, abort
import os

app = Flask(__name__)

FLAG = os.environ.get("FLAG", "FLAG{not_set}")

user_data = {
    "389": {"flag": FLAG}
}

@app.route("/user")
def get_user():
    user_id = request.args.get("id")
    user = user_data.get(user_id)

    if user and "flag" in user:
        return render_template_string("""
<!DOCTYPE html>
<html>
<head>
    <title>Welcome</title>
    <style>
        body { font-family: Arial; background: #f2f2f2; padding: 50px; }
        .box {
            background: white;
            max-width: 600px;
            margin: auto;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .flag {
            margin-top: 20px;
            padding: 15px;
            background: #e3fcef;
            color: #155724;
            font-weight: bold;
            border: 1px solid #c3e6cb;
            border-radius: 5px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="box">
        <h2>Access Granted</h2>
        <p class="flag">{{ flag }}</p>
    </div>
</body>
</html>
        """, flag=user["flag"])

    abort(404)
