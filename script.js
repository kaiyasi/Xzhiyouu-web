function decode() {
    const method = document.getElementById('decodeMethod').value;
    const input = document.getElementById('input').value;

    if (!input) {
        alert('不要空白啦！(╬▔皿▔)╯');
        return;
    }

    let output = '';

    switch(method) {
        case 'caesar':
            const shift = parseInt(document.getElementById('shift').value);
            output = caesarDecode(input, shift);
            break;
        case 'base64':
            output = atob(input);
            break;
        case 'rot13':
            output = rot13(input);
            break;
        case 'ascii':
            output = asciiToText(input);
            break;
        case 'binary':
            output = binaryToText(input);
            break;
        case 'hex':
            output = hexToText(input);
            break;
        case 'decimal':
            output = decimalToText(input);
            break;
    }

    document.getElementById('output').innerText = output;
}

function caesarDecode(text, shift) {
    return text.split('').map(char => {
        if (char.match(/[a-z]/i)) {
            const code = char.charCodeAt(0);
            const isUpperCase = code >= 65 && code <= 90;
            const base = isUpperCase ? 65 : 97;
            return String.fromCharCode((code - base - shift + 26) % 26 + base);
        }
        return char;
    }).join('');
}

function rot13(text) {
    return caesarDecode(text, 13);
}

function asciiToText(ascii) {
    return ascii.split(' ').map(code => String.fromCharCode(parseInt(code))).join('');
}

function binaryToText(binary) {
    return binary.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
}

function hexToText(hex) {
    hex = hex.replace(/\s/g, '');
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}

function decimalToText(decimal) {
    return decimal.split(' ').map(num => String.fromCharCode(parseInt(num))).join('');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('decodeMethod').addEventListener('change', function() {
        const caesarShift = document.getElementById('caesarShift');
        if (this.value === 'caesar') {
            caesarShift.style.display = 'block';
        } else {
            caesarShift.style.display = 'none';
        }
    });

    document.querySelector('.decode-btn').addEventListener('click', decode);
    document.querySelector('.copy-btn').addEventListener('click', copyToClipboard);
    document.querySelector('.clear-btn').addEventListener('click', clearAll);
});

function showHint() {
    alert("VHJ5IHRvIGxvb2sgYXQgcm9ib3RzLnR4dD8= 🤔");
}
document.addEventListener('DOMContentLoaded', function() {
    const decodeMethod = document.getElementById('decodeMethod');
    const decodeBtn = document.querySelector('.decode-btn');
    const inputBox = document.getElementById('input');
    
    decodeMethod.addEventListener('change', function() {
        if (this.value === 'flag') {
            decodeBtn.textContent = 'Show';
            inputBox.style.display = 'none';
            showEncryptedFlags();
        } else {
            decodeBtn.textContent = 'Decode';
            inputBox.style.display = 'block';
            document.getElementById('output').innerHTML = '';
        }
    });
});

function showEncryptedFlags() {
    const flags = [
        'bjB3Xw==',              
        'u0c3_',                 
        '796f755f',             
        '01100011 01100001 01101110 01011111',  
        '102'                  
    ];
    
    document.getElementById('output').innerHTML = 
        '<pre style="color: #4CAF50; font-family: monospace; background-color: #1e1e1e; padding: 15px; border-radius: 5px;">' +
        'const array = [\n' +
        '    "' + flags[0] + '",\n' +
        '    "' + flags[1] + '",\n' +
        '    "' + flags[2] + '",\n' +
        '    "' + flags[3] + '",\n' +
        '    "' + flags[4] + '"\n' +
        '];\n\n' +
        'let flag = array.join("");\n' +
        'console.log(flag);\n' +
        '</pre>';
}