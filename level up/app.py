from flask import Flask, request, redirect, make_response, render_template_string

app = Flask(__name__)

FLAG = "NHISCCTF{c00kie_m4n1pul4t10n_ftw}"

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Level {{ level }}</title>
</head>
<body>
    <h1>You are at level: {{ level }}</h1>
    {% if level >= 1000 %}
        <p>🎉 Congratulations! Here is your flag:</p>
        <code>{{ flag }}</code>
    {% else %}
        <form method="get" action="/next">
            <button type="submit">Click me to next level</button>
        </form>
        <p>Hint: Your progress is stored somewhere... maybe your browser knows?</p>
    {% endif %}
</body>
</html>
"""

@app.route("/")
def index():
    try:
        level = int(request.cookies.get("level", "0"))
    except ValueError:
        level = 0

    flag = FLAG if level >= 1000 else None
    return render_template_string(HTML_TEMPLATE, level=level, flag=flag)

@app.route("/next")
def next_level():
    try:
        level = int(request.cookies.get("level", "0"))
    except ValueError:
        level = 0
    level += 1
    resp = make_response(redirect("/"))
    resp.set_cookie("level", str(level))
    return resp

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
