from flask import Flask, request, make_response, redirect, render_template_string, url_for
from flask import g
import json
import sqlite3
import os
import re

app = Flask(__name__)

# 初始化資料庫
def init_db():
    db_path = 'shop.db'
    if not os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute('''
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            username TEXT,
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        c.execute('''
        CREATE TABLE IF NOT EXISTS secret_products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            price INTEGER,
            flag TEXT
        )
        ''')
        # 插入一些初始評論
        c.execute("INSERT INTO comments (product_id, username, comment) VALUES (?, ?, ?)", 
                 (51, "user1", "這商品太貴了！"))
        # 插入秘密商品
        c.execute("INSERT INTO secret_products (id, name, price, flag) VALUES (?, ?, ?, ?)",
                 (999, "Hidden Flag", 1000, "NHISCCTF{sql_injection_master_2024}"))
        conn.commit()
        conn.close()

init_db()

products = [
    {"id": 50, "name": "商品 A", "price": 20, "img": "https://via.placeholder.com/300x200?text=商品+A"},
    {"id": 51, "name": "神秘商品 Level 1", "price": 999999999999, "flag": "NHISCCTF{simple_cookie_edit}", "img": "https://via.placeholder.com/300x200?text=神秘商品1"},
    {"id": 52, "name": "商品 B", "price": 35, "img": "https://via.placeholder.com/300x200?text=商品+B"},
    {"id": 53, "name": "XSS 挑戰商品", "price": 100, "flag": "NHISCCTF{xss_challenge_completed}", "img": "https://via.placeholder.com/300x200?text=XSS挑戰"},
    {"id": 54, "name": "洋芋片", "price": 25, "img": "https://via.placeholder.com/300x200?text=洋芋片"}
]

def get_wallet():
    try:
        return int(request.cookies.get('wallet', '50'))
    except ValueError:
        return 50

def get_purchased_dict():
    try:
        data = json.loads(request.cookies.get('purchased', '{}'))
        if isinstance(data, dict):
            return data
        return {}
    except:
        return {}

head_html = """
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link href="https://unpkg.com/aos@2.3.4/dist/aos.css" rel="stylesheet">
  <style>
    :root {
      --primary-color: #4a90e2;
      --secondary-color: #f39c12;
      --background-color: #f8f9fa;
      --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    body { 
      background: var(--background-color);
      font-family: 'Segoe UI', '微軟正黑體', sans-serif;
    }
    
    .navbar {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: var(--card-shadow);
    }
    
    .card {
      border: none;
      border-radius: 15px;
      box-shadow: var(--card-shadow);
      transition: all 0.3s ease;
      background: white;
    }
    
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    
    .card-img-top {
      border-radius: 15px 15px 0 0;
      object-fit: cover;
      height: 200px;
    }
    
    .btn-primary {
      background: var(--primary-color);
      border: none;
      border-radius: 25px;
      padding: 8px 20px;
      transition: all 0.3s ease;
    }
    
    .btn-primary:hover {
      background: #357abd;
      transform: scale(1.05);
    }
    
    .btn-success {
      border-radius: 25px;
      padding: 8px 20px;
      transition: all 0.3s ease;
    }
    
    .btn-success:hover {
      transform: scale(1.05);
    }
    
    .wallet-badge {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: white;
      padding: 15px 25px;
      border-radius: 15px;
      box-shadow: var(--card-shadow);
    }
    
    .flag-box {
      background: linear-gradient(135deg, #ffd700, #ffa500);
      border: none;
      padding: 20px;
      border-radius: 15px;
      font-family: 'Courier New', monospace;
      box-shadow: var(--card-shadow);
      color: #2c3e50;
    }
    
    .product-price {
      font-size: 1.2em;
      color: var(--primary-color);
      font-weight: bold;
    }
    
    .purchased-list {
      background: white;
      padding: 20px;
      border-radius: 15px;
      box-shadow: var(--card-shadow);
    }
    
    .hint-box {
      background: rgba(74, 144, 226, 0.1);
      border-left: 4px solid var(--primary-color);
      padding: 15px;
      border-radius: 0 15px 15px 0;
      margin: 20px 0;
    }
    
    .comment-section {
      background: white;
      padding: 20px;
      border-radius: 15px;
      box-shadow: var(--card-shadow);
      margin-top: 30px;
    }
    
    .comment-form {
      margin-bottom: 20px;
    }
    
    .comment-list {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .comment-item {
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    
    .search-box {
      margin: 20px 0;
      padding: 20px;
      background: white;
      border-radius: 15px;
      box-shadow: var(--card-shadow);
    }
  </style>
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-light fixed-top">
  <div class="container">
    <a class="navbar-brand" href="/">
      <i class="fas fa-store"></i> CTF商店
    </a>
  </div>
</nav>
<div class="container" style="margin-top: 80px;">
"""

tail_html = """
</div>
<footer class="bg-light py-4 mt-5">
  <div class="container text-center">
    <p class="mb-0">🎮 CTF Web Security Challenge</p>
  </div>
</footer>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>
<script>
  AOS.init({
    duration: 800,
    once: true
  });
</script>
</body>
</html>
"""

@app.route('/')
def index():
    wallet = get_wallet()
    purchased_dict = get_purchased_dict()

    purchased_items = []
    for p in products:
        count = purchased_dict.get(str(p['id']), 0)
        if count > 0:
            purchased_items.append((p, count))

    html = head_html + """
<div class="text-center mb-5" data-aos="fade-down">
  <h2 class="display-4 mb-4">🛒 商品列表</h2>
  <div class="wallet-badge d-inline-block">
    <i class="fas fa-wallet me-2"></i>錢包餘額：<strong>${{ wallet }}</strong>
  </div>
</div>

<div class="hint-box" data-aos="fade-right">
  <i class="fas fa-lightbulb me-2"></i>
  <span class="text-muted">提示：這是一個簡單的 Web 安全挑戰，試試看如何購買價格很高的商品？</span>
</div>

<div class="row">
  {% for product in products %}
  <div class="col-md-4 mb-4" data-aos="zoom-in" data-aos-delay="{{ loop.index * 100 }}">
    <div class="card h-100">
      <img src="{{ product.img }}" class="card-img-top" alt="{{ product.name }}">
      <div class="card-body">
        <h5 class="card-title">
          {{ product.name }}
          {% if 'flag' in product %}
          <i class="fas fa-crown text-warning ms-2"></i>
          {% endif %}
        </h5>
        <p class="product-price mb-3">
          <i class="fas fa-tag me-2"></i>${{ product.price }}
        </p>
        <a href="/product/{{ product.id }}" class="btn btn-primary w-100">
          <i class="fas fa-shopping-cart me-2"></i>查看商品
        </a>
      </div>
    </div>
  </div>
  {% endfor %}
</div>

{% if purchased_items %}
  <div class="purchased-list mt-5" data-aos="fade-up">
    <h4 class="mb-4">
      <i class="fas fa-box-open me-2"></i>已購買商品清單
    </h4>
    <ul class="list-group list-group-flush">
      {% for item, count in purchased_items %}
        <li class="list-group-item d-flex justify-content-between align-items-center">
          {{ item.name }}
          <span class="badge bg-primary rounded-pill">× {{ count }}</span>
        </li>
      {% endfor %}
    </ul>
  </div>
{% endif %}
""" + tail_html

    return render_template_string(html, title="商品列表", wallet=wallet,
                                  products=products, purchased_items=purchased_items)

@app.route('/product/<int:pid>')
def product_detail(pid):
    product = next((p for p in products if p['id'] == pid), None)
    if not product:
        return "找不到此商品", 404

    wallet = get_wallet()
    purchased_dict = get_purchased_dict()
    count = purchased_dict.get(str(pid), 0)

    # 獲取商品評論
    conn = sqlite3.connect('shop.db')
    c = conn.cursor()
    comments = c.execute("SELECT * FROM comments WHERE product_id = ?", (pid,)).fetchall()
    conn.close()

    purchased_items = [(p, purchased_dict.get(str(p['id']), 0)) for p in products if purchased_dict.get(str(p['id']), 0) > 0]

    html = head_html + """
<nav aria-label="breadcrumb" class="mt-3">
  <ol class="breadcrumb">
    <li class="breadcrumb-item">
      <a href="/" class="text-decoration-none">
        <i class="fas fa-home"></i> 首頁
      </a>
    </li>
    <li class="breadcrumb-item active">{{ product.name }}</li>
  </ol>
</nav>

<div class="card mt-4" data-aos="zoom-in">
  <div class="row g-0">
    <div class="col-md-6">
      <img src="{{ product.img }}" class="img-fluid rounded-start" alt="{{ product.name }}">
    </div>
    <div class="col-md-6">
      <div class="card-body">
        <h3 class="card-title mb-4">
          {{ product.name }}
          {% if 'flag' in product %}
          <i class="fas fa-crown text-warning ms-2"></i>
          {% endif %}
        </h3>
        <div class="mb-4">
          <h5 class="text-muted">商品價格</h5>
          <p class="product-price">${{ product.price }}</p>
        </div>
        <div class="mb-4">
          <h5 class="text-muted">你的錢包</h5>
          <p class="product-price">${{ wallet }}</p>
        </div>
        {% if wallet >= product.price %}
          <form method="POST" action="{{ url_for('buy_product', pid=product.id) }}">
            <button class="btn btn-success btn-lg w-100">
              <i class="fas fa-shopping-cart me-2"></i>立即購買
            </button>
          </form>
        {% else %}
          <div class="alert alert-danger">
            <i class="fas fa-exclamation-circle me-2"></i>
            餘額不足，無法購買
          </div>
        {% endif %}
        
        {% if count > 0 %}
          <div class="mt-4">
            <div class="alert alert-success">
              <i class="fas fa-check-circle me-2"></i>
              已購買此商品 × {{ count }} 次
            </div>
            {% if product.flag %}
              <div class="flag-box mt-3">
                <div class="mb-2">
                  <i class="fas fa-flag me-2"></i>恭喜獲得 FLAG！
                </div>
                <code>{{ product.flag }}</code>
              </div>
            {% endif %}
          </div>
        {% endif %}
      </div>
    </div>
  </div>
</div>

<div class="comment-section" data-aos="fade-up">
    <h4 class="mb-4"><i class="fas fa-comments"></i> 商品評論</h4>
    
    <form class="comment-form" method="POST" action="{{ url_for('add_comment') }}">
        <input type="hidden" name="product_id" value="{{ product.id }}">
        <div class="mb-3">
            <input type="text" class="form-control" name="username" placeholder="你的名字" required>
        </div>
        <div class="mb-3">
            <textarea class="form-control" name="comment" rows="3" placeholder="寫下你的評論..." required></textarea>
        </div>
        <button type="submit" class="btn btn-primary">
            <i class="fas fa-paper-plane"></i> 發表評論
        </button>
    </form>
    
    <div class="comment-list">
        {% for comment in comments %}
        <div class="comment-item">
            <strong>{{ comment[2] }}</strong>
            <p>{{ comment[3] | safe }}</p>
            <small class="text-muted">{{ comment[4] }}</small>
        </div>
        {% endfor %}
    </div>
</div>

{% if product.id == 53 %}
<div class="search-box">
    <h4 class="mb-3"><i class="fas fa-search"></i> 搜尋隱藏商品</h4>
    <div class="input-group">
        <input type="text" id="searchInput" class="form-control" placeholder="輸入關鍵字...">
        <button class="btn btn-primary" onclick="searchProducts()">
            <i class="fas fa-search"></i> 搜尋
        </button>
    </div>
    <div id="searchResults" class="mt-3"></div>
</div>

<script>
function searchProducts() {
    const query = document.getElementById('searchInput').value;
    fetch(`/api/search_products?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            const resultsDiv = document.getElementById('searchResults');
            resultsDiv.innerHTML = JSON.stringify(data, null, 2);
        });
}
</script>
{% endif %}
""" + tail_html

    return render_template_string(html, title=product["name"], 
                                product=product, wallet=wallet,
                                count=count, purchased_items=purchased_items,
                                comments=comments)

@app.route('/buy/<int:pid>', methods=['POST'])
def buy_product(pid):
    product = next((p for p in products if p['id'] == pid), None)
    if not product:
        return "商品不存在", 404

    wallet = get_wallet()
    if wallet < product['price']:
        return "餘額不足", 403

    wallet -= product['price']
    purchased = get_purchased_dict()
    purchased[str(pid)] = purchased.get(str(pid), 0) + 1

    resp = make_response(redirect(url_for('product_detail', pid=pid)))
    resp.set_cookie('wallet', str(wallet))
    resp.set_cookie('purchased', json.dumps(purchased))
    return resp

@app.before_request
def maybe_init_cookie():
    g.reset_wallet = not request.cookies.get('wallet')
    g.reset_purchased = not request.cookies.get('purchased')

@app.after_request
def set_initial_cookies_if_needed(response):
    if g.get('reset_wallet'):
        response.set_cookie('wallet', '50')
    if g.get('reset_purchased'):
        response.set_cookie('purchased', '{}')
    return response

@app.route('/api/search_products')
def search_products():
    query = request.args.get('q', '')
    conn = sqlite3.connect('shop.db')
    c = conn.cursor()
    # 故意使用不安全的 SQL 查詢
    sql = f"SELECT * FROM secret_products WHERE name LIKE '%{query}%'"
    try:
        results = c.execute(sql).fetchall()
        return json.dumps(results)
    except Exception as e:
        return str(e)
    finally:
        conn.close()

@app.route('/api/add_comment', methods=['POST'])
def add_comment():
    product_id = request.form.get('product_id')
    username = request.form.get('username', '')
    comment = request.form.get('comment', '')
    
    # 簡單的 XSS 防護，但有漏洞
    if '<script>' in comment.lower():
        return "評論包含不允許的內容", 400
        
    conn = sqlite3.connect('shop.db')
    c = conn.cursor()
    c.execute("INSERT INTO comments (product_id, username, comment) VALUES (?, ?, ?)",
             (product_id, username, comment))
    conn.commit()
    conn.close()
    return redirect(url_for('product_detail', pid=product_id))

@app.route('/api/get_comments/<int:pid>')
def get_comments(pid):
    conn = sqlite3.connect('shop.db')
    c = conn.cursor()
    comments = c.execute("SELECT * FROM comments WHERE product_id = ?", (pid,)).fetchall()
    conn.close()
    return json.dumps(comments)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8787)
