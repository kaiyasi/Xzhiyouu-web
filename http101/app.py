from flask import Flask, request
import os

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'GET':
        if request.args.get('a') == '2':
            return '請用 POST 發送 b=3'
        else:
            return '請用 GET 發送 a=2'

    elif request.method == 'POST':
        if request.form.get('b') == '3':
            return os.environ.get('FLAG', 'NHISCCTF{example_flag}')
        else:
            return '請用 POST 發送 b=3'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
