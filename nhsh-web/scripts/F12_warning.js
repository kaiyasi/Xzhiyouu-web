// 工具箱警告文字
; (function () {
    let warning = {
        "en": ["Stop!", "Do NOT try to TYPE or PASTE anything here.", "If do so, you have to take responsibility for any accident happend!"],
        "zh-hans": ["住手！", "这是提供程序员使用的浏览器功能，", "请勿尝试在此输入或贴上任何东西！", "若因此导致系统发生任何问题，请自行负责！"],
        "zh-hant": ["住手！", "這是提供開發人員使用的瀏覽器功能，", "請勿嘗試在此輸入或貼上任何東西！", "若因此導致系統發生任何問題，請自行負責！"],
        "es": ["Páre!", "Esta es una característica del navegador que proporciona desarrolladores.", "¡No escuche los rumores para escribir o pegar nada aquí!", "Si causa algún problema con el sistema, ¡sea responsable de ello!"],
        "ja": ["やめて！", "これは開発者向けのブラウザ機能です，", "ここに何かを入力したり貼り付けたりしないでください！", "システムに問題がある場合は、その責任を負ってください！"]
    }
    let css_L = "color:#d62828; font-size:50px; font-family: Microsoft JhengHei; text-align:center;";
    let css_S = "color:#ff9900; font-size:14px; font-family: Microsoft JhengHei; text-align:center;";
    // 警告文字的樣式
    let warningMsg = "";
    let language = $("html").attr("lang").toLowerCase() || "zh-hant";
    language = language == "zh-tw" ? "zh-hant" : language == "zh" ? "zh-hant" : language;

    let warningTextArray = warning[language];

    try {
        if (navigator.userAgent.indexOf("MSIE") > -1 || navigator.userAgent.indexOf("rv:") > -1) {
            setTimeout(console.log.bind(console, warningTextArray[0]));

            for (let i in warningTextArray) {
                warningMsg = i > 0 ? warningMsg + warningTextArray[i] + "\n" : warningMsg;
            }

            setTimeout(console.log.bind(console, warningMsg));
        } else {
            setTimeout(console.log.bind(console, "%c" + warningTextArray[0], css_L));

            for (let i in warningTextArray) {
                warningMsg = i > 0 ? warningMsg + warningTextArray[i] + "\n" : warningMsg;
            }

            setTimeout(console.log.bind(console, "%c" + warningMsg, css_S));
        }

    } catch (ErrMsg) { 
        try {
            ConsoleMsg.error(ErrMsg) 
        } catch (error) {
            console.log(ErrMsg);
        }
        
    }
})();