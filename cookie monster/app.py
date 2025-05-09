from flask import Flask, request, make_response, render_template_string
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
    resp = make_response()

    if not cookie:
        default_user = "guest"
        cookie_value = base64.b64encode(default_user.encode()).decode()
        resp.set_cookie("user", cookie_value)
        user = default_user
    else:
        try:
            user = base64.b64decode(cookie).decode()
        except:
            user = "guest"

    is_admin = (user == "admin")

    rendered = render_template_string(
        TEMPLATE,
        user=user,
        admin=is_admin,
        flag=FLAG if is_admin else ""
    )
    resp.set_data(rendered)
    return resp

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
