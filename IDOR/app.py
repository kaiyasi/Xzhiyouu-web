from flask import Flask, request, jsonify
import os

app = Flask(__name__)

users = {
    str(i): {
        "id": i,
        "username": f"user{i}",
        "data": f"This is user{i}'s profile"
    }
    for i in range(1, 501)
}

FLAG_USER_ID = "389"

@app.route("/user")
def get_user():
    user_id = request.args.get("id")
    if user_id in users:
        user_data = users[user_id].copy()
        if user_id == FLAG_USER_ID:
            user_data["flag"] = os.environ.get("FLAG", "FLAG{not_set}")
        return jsonify(user_data)
    return "User not found", 404

if __name__ == "__main__":
    app.run(debug=True)
