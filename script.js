// 初始化事件監聽器
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    setupDragAndDrop();
});

function initializeEventListeners() {
    // 輸入方式切換
    document.getElementById('inputMethod').addEventListener('change', function() {
        toggleInputMethod(this.checked);
    });

    // 解密方式切換
    document.querySelectorAll('input[name="decodeMethod"]').forEach(checkbox => {
        checkbox.addEventListener('change', toggleDecodeOptions);
    });

    // 檔案上傳處理
    document.getElementById('fileUpload').addEventListener('change', handleFileUpload);

    // 檔案拖放區域點擊處理
    document.querySelector('.file-drop-zone').addEventListener('click', function() {
        document.getElementById('fileUpload').click();
    });
}

// 設置拖放功能
function setupDragAndDrop() {
    const dropZone = document.querySelector('.file-drop-zone');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('drag-over');
    }

    function unhighlight(e) {
        dropZone.classList.remove('drag-over');
    }

    dropZone.addEventListener('drop', handleDrop, false);
}

// 處理檔案拖放
function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    handleFile(file);
}

// 切換輸入方式
function toggleInputMethod(isFileMode) {
    document.getElementById('textInput').style.display = isFileMode ? 'none' : 'block';
    document.getElementById('fileInput').style.display = isFileMode ? 'block' : 'none';
}

// 切換解密選項
function toggleDecodeOptions() {
    const selectedMethods = Array.from(document.querySelectorAll('input[name="decodeMethod"]:checked'))
        .map(checkbox => checkbox.value);
    
    document.getElementById('vigenereKey').style.display = 
        selectedMethods.includes('vigenere') ? 'block' : 'none';
    document.getElementById('railfenceRails').style.display = 
        selectedMethods.includes('railfence') ? 'block' : 'none';
    document.getElementById('caesarRange').style.display = 
        selectedMethods.includes('caesar') ? 'block' : 'none';
}

// 全選/取消全選解密方式
function toggleAllMethods() {
    const checkboxes = document.querySelectorAll('input[name="decodeMethod"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked;
    });
    
    toggleDecodeOptions();
}

// 檔案上傳處理
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) handleFile(file);
}

// 處理檔案
function handleFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('input').value = e.target.result;
    };
    reader.onerror = function() {
        showToast('檔案讀取失敗！');
    };
    reader.readAsText(file);
}

// 主解密函數
async function decode() {
    const input = document.getElementById('input').value.trim();
    if (!input) {
        showToast('請輸入要解密的內容！');
        return;
    }

    const selectedMethods = Array.from(document.querySelectorAll('input[name="decodeMethod"]:checked'))
        .map(checkbox => checkbox.value);
    
    if (selectedMethods.length === 0) {
        showToast('請選擇至少一種解密方式！');
        return;
    }

    let results = [];
    for (const method of selectedMethods) {
        try {
            const result = await decodeWithMethod(method, input);
            if (result) {
                results.push(`[${method.toUpperCase()}]\n${result}`);
            }
        } catch (error) {
            console.error(`Error in ${method}:`, error);
            results.push(`[${method.toUpperCase()}]\n解密失敗: ${error.message}`);
        }
    }

    document.getElementById('output').innerHTML = results.join('\n\n');
}

// 各種解密方法
async function decodeWithMethod(method, input) {
    switch(method) {
        case 'base64':
            return decodeBase64(input);
        case 'ascii':
            return decodeAscii(input);
        case 'binary':
            return decodeBinary(input);
        case 'hex':
            return decodeHex(input);
        case 'decimal':
            return decodeDecimal(input);
        case 'caesar':
            return decodeCaesar(input);
        case 'rot13':
            return decodeRot13(input);
        case 'vigenere':
            return decodeVigenere(input);
        case 'morse':
            return decodeMorse(input);
        case 'railfence':
            return decodeRailfence(input);
        case 'bacon':
            return decodeBacon(input);
        case 'atbash':
            return decodeAtbash(input);
        default:
            throw new Error('不支援的解密方式');
    }
}

// Base64 解密
function decodeBase64(input) {
    try {
        return atob(input);
    } catch {
        throw new Error('無效的 Base64 編碼');
    }
}

// ASCII 解密
function decodeAscii(input) {
    try {
        return input.split(' ')
            .map(code => String.fromCharCode(parseInt(code)))
            .join('');
    } catch {
        throw new Error('無效的 ASCII 編碼');
    }
}

// 二進制解密
function decodeBinary(input) {
    try {
        return input.split(' ')
            .map(bin => String.fromCharCode(parseInt(bin, 2)))
            .join('');
    } catch {
        throw new Error('無效的二進制編碼');
    }
}

// 十六進制解密
function decodeHex(input) {
    try {
        input = input.replace(/\s/g, '');
        let result = '';
        for (let i = 0; i < input.length; i += 2) {
            result += String.fromCharCode(parseInt(input.substr(i, 2), 16));
        }
        return result;
    } catch {
        throw new Error('無效的十六進制編碼');
    }
}

// 十進制解密
function decodeDecimal(input) {
    try {
        return input.split(' ')
            .map(num => String.fromCharCode(parseInt(num)))
            .join('');
    } catch {
        throw new Error('無效的十進制編碼');
    }
}

// Caesar 密碼暴力破解
function decodeCaesar(input) {
    const start = parseInt(document.getElementById('shiftStart').value) || 1;
    const end = parseInt(document.getElementById('shiftEnd').value) || 25;
    let results = [];

    for (let shift = start; shift <= end; shift++) {
        const result = input.split('').map(char => {
            if (char.match(/[a-z]/i)) {
                const code = char.charCodeAt(0);
                const isUpperCase = code >= 65 && code <= 90;
                const base = isUpperCase ? 65 : 97;
                return String.fromCharCode((code - base - shift + 26) % 26 + base);
            }
            return char;
        }).join('');
        results.push(`位移 ${shift}: ${result}`);
    }
    return results.join('\n');
}

// ROT13 解密
function decodeRot13(input) {
    return input.split('').map(char => {
        if (char.match(/[a-z]/i)) {
            const code = char.charCodeAt(0);
            const isUpperCase = code >= 65 && code <= 90;
            const base = isUpperCase ? 65 : 97;
            return String.fromCharCode((code - base + 13) % 26 + base);
        }
        return char;
    }).join('');
}

// Vigenère 密碼解密
function decodeVigenere(input) {
    const key = document.getElementById('key').value.toLowerCase();
    if (!key) throw new Error('請輸入 Vigenère 密鑰');

    return input.split('').map((char, i) => {
        if (char.match(/[a-z]/i)) {
            const code = char.charCodeAt(0);
            const isUpperCase = code >= 65 && code <= 90;
            const base = isUpperCase ? 65 : 97;
            const shift = key[i % key.length].charCodeAt(0) - 97;
            return String.fromCharCode((code - base - shift + 26) % 26 + base);
        }
        return char;
    }).join('');
}

// Morse 密碼解密
function decodeMorse(input) {
    const morseDict = {
        '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
        '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
        '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
        '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
        '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
        '--..': 'Z', '-----': '0', '.----': '1', '..---': '2', '...--': '3',
        '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8',
        '----.': '9', '/': ' '
    };

    return input.split(' ').map(code => morseDict[code] || code).join('');
}

// Rail Fence 密碼解密
function decodeRailfence(input) {
    const rails = parseInt(document.getElementById('rails').value) || 3;
    if (rails < 2) throw new Error('柵欄層數必須大於 1');

    const len = input.length;
    const fence = Array(rails).fill().map(() => Array(len).fill('\n'));
    
    let rail = 0;
    let dir = 1;
    
    // 標記柵欄位置
    for (let i = 0; i < len; i++) {
        fence[rail][i] = '';
        if (rail === 0) dir = 1;
        else if (rail === rails - 1) dir = -1;
        rail += dir;
    }
    
    // 填充字符
    let index = 0;
    for (let i = 0; i < rails; i++) {
        for (let j = 0; j < len; j++) {
            if (fence[i][j] === '') {
                fence[i][j] = input[index++];
            }
        }
    }
    
    // 讀取結果
    let result = '';
    rail = 0;
    dir = 1;
    for (let i = 0; i < len; i++) {
        result += fence[rail][i];
        if (rail === 0) dir = 1;
        else if (rail === rails - 1) dir = -1;
        rail += dir;
    }
    
    return result;
}

// Bacon 密碼解密
function decodeBacon(input) {
    const baconDict = {
        'AAAAA': 'A', 'AAAAB': 'B', 'AAABA': 'C', 'AAABB': 'D', 'AABAA': 'E',
        'AABAB': 'F', 'AABBA': 'G', 'AABBB': 'H', 'ABAAA': 'I', 'ABAAB': 'J',
        'ABABA': 'K', 'ABABB': 'L', 'ABBAA': 'M', 'ABBAB': 'N', 'ABBBA': 'O',
        'ABBBB': 'P', 'BAAAA': 'Q', 'BAAAB': 'R', 'BAABA': 'S', 'BAABB': 'T',
        'BABAA': 'U', 'BABAB': 'V', 'BABBA': 'W', 'BABBB': 'X', 'BBAAA': 'Y',
        'BBAAB': 'Z'
    };

    input = input.toUpperCase().replace(/[^AB]/g, '');
    let result = '';
    for (let i = 0; i < input.length; i += 5) {
        const chunk = input.substr(i, 5);
        result += baconDict[chunk] || '';
    }
    return result;
}

// Atbash 密碼解密
function decodeAtbash(input) {
    return input.split('').map(char => {
        if (char.match(/[a-z]/i)) {
            const code = char.charCodeAt(0);
            const isUpperCase = code >= 65 && code <= 90;
            const base = isUpperCase ? 65 : 97;
            return String.fromCharCode(25 - (code - base) + base);
        }
        return char;
    }).join('');
}

// 顯示提示訊息
function showToast(message) {
    // 移除現有的 toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 使用 setTimeout 而不是 animation 來控制移除
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2700);
}

// 複製結果
function copyToClipboard() {
    const output = document.getElementById('output');
    if (!output.textContent) {
        showToast('沒有可複製的內容！');
        return;
    }

    navigator.clipboard.writeText(output.textContent)
        .then(() => showToast('已複製到剪貼簿！'))
        .catch(() => showToast('複製失敗！'));
}

// 清除所有內容
function clearAll() {
    document.getElementById('input').value = '';
    document.getElementById('output').innerHTML = '';
    document.getElementById('fileUpload').value = '';
    document.querySelectorAll('input[name="decodeMethod"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    toggleDecodeOptions();
    showToast('已清除所有內容！');
}

// 顯示提示
function showHint() {
    showToast("試試看用不同的解密方式組合？也許會有意想不到的發現喔！ (｡･ω･｡)");
}