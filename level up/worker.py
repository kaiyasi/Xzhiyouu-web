from flask import Flask, Request
from werkzeug.test import create_environ
from werkzeug.wrappers import Response
import app

def create_flask_request(cf_request):
    # 創建環境
    environ = create_environ(
        path=cf_request.path,
        method=cf_request.method,
        headers=dict(cf_request.headers),
        query_string=cf_request.query
    )
    return Request(environ)

def handle_request(request):
    return {
        'body': '<h1>Hello from Flask Worker!</h1>',
        'status': 200,
        'headers': {
            'Content-Type': 'text/html'
        }
    }

def main(request, env, ctx):
    return handle_request(request) 