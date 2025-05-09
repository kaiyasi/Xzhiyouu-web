from flask import Flask, request, make_response, redirect, render_template_string
import base64

app = Flask(__name__)

FLAG = "NHISCCTF{y0u_g0t_th3_c00k13s!}"

TEMPLATE = '''
<!doctype html>
<title>Cookie Monster</title>
<h2>🍪 Welcome {{ user }}!</h2>
{% if admin %}
<p>Here is your flag: <b>{{ flag }}</b></p>
{% else %}
<p>You are not admin.</p>
{% endif %}
'''

@app.route("/")
def index():
    cookie = request.cookies.get("user")
    try:
        decoded = base64.b64decode(cookie).decode()
    except:
        decoded = "guest"

    is_admin = (decoded == "admin")

    return render_template_string(
        TEMPLATE,
        user=decoded,
        admin=is_admin,
        flag=FLAG if is_admin else ""
    )

@app.route("/login/<name>")
def login(name):
    resp = make_response(redirect("/"))
    cookie_value = base64.b64encode(name.encode()).decode()
    resp.set_cookie("user", cookie_value)
    return resp

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
