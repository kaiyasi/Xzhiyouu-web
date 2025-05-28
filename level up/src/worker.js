export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 獲取當前等級
    let level = 0;
    const cookie = request.headers.get('cookie');
    if (cookie) {
      const match = cookie.match(/level=(\d+)/);
      if (match) {
        level = parseInt(match[1]);
      }
    }

    // 處理點擊下一級
    if (url.pathname === '/next') {
      level++;
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/',
          'Set-Cookie': `level=${level}; Path=/`
        }
      });
    }

    // 返回主頁
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Level ${level}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        text-align: center;
      }
      button {
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        margin: 20px 0;
      }
      button:hover {
        background-color: #45a049;
      }
    </style>
</head>
<body>
    <h1>You are at level: ${level}</h1>
    ${level >= 1000 
      ? `<p>🎉 Congratulations! Here is your flag:</p>
         <code>NHISCCTF{c00kie_m4n1pul4t10n_ftw}</code>`
      : `<form method="get" action="/next">
           <button type="submit">Click me to next level</button>
         </form>
         <p>Hint: Your progress is stored somewhere... maybe your browser knows?</p>`
    }
</body>
</html>`;

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8"
      }
    });
  }
}; 