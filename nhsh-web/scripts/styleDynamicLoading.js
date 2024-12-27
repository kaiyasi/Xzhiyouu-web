// 動態載入樣式表
const StyleDynamicLoading = function (path) {
    // 傳入: 樣式表連結
    var extension = path.split(".");
    extension = extension[extension.length - 1].toLowerCase();

    var style = document.createElement("link");
    style.rel = "stylesheet";
    style.type = "text/" + extension; //會自動判斷樣式表的副檔名
    style.href = path;

    document.head.appendChild(style);
}