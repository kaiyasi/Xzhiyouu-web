from flask import Flask, request, redirect, Response, send_file
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

app = Flask(__name__)
FLAG = "NHISCCTF{sl4sh_byp4ss_via_param}"

@app.route('/')
def index():
    return """
    <h1>Slash Escape</h1>
    <p>Try to reach the flag, but don’t go the obvious way.</p>
    <ul>
        <li><a href="/flag">flag</a></li>
        <li><a href="/path?target=step">step</a></li>
    </ul>
    <!-- Hint: Some paths are too direct... others must be passed. -->
    """

@app.route('/flag')
def bait():
    return redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ", code=302)

@app.route('/path')
def path_handler():
    target = request.args.get("target", "")

    if target == "step":
        # 回傳一張提示圖片
        img = Image.new("RGB", (400, 120), color=(230, 240, 255))
        draw = ImageDraw.Draw(img)
        try:
            font = ImageFont.truetype("arial.ttf", 18)
        except:
            font = ImageFont.load_default()

        draw.text((20, 20), "You're on the right path...", fill=(0, 0, 0), font=font)
        draw.text((20, 60), "Here is your flag: NHISCCTF{fake_flag}", fill=(20, 20, 80), font=font)

        buf = BytesIO()
        img.save(buf, format='PNG')
        buf.seek(0)
        return send_file(buf, mimetype='image/png')

    if target == "flag":
        # 回傳 flag 圖片
        img = Image.new("RGB", (480, 100), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)
        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except:
            font = ImageFont.load_default()
        draw.text((10, 40), f"Flag: {FLAG}", fill=(0, 0, 0), font=font)

        buf = BytesIO()
        img.save(buf, format='PNG')
        buf.seek(0)
        return send_file(buf, mimetype='image/png')

    return "Nothing here.", 404

if __name__ == '__main__':
    app.run(port=5001)
