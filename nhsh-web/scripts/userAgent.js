// 判斷user的操作系統和瀏覽器

const UserAgent = {
    useragent: navigator.userAgent,
    windows: (navigator.userAgent.indexOf("Windows", 0) != -1) ? 1 : 0,
    mac: (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel"),
    android: navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1,
    ios: !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
}
const UserBrowser = {
    ie: navigator.userAgent.indexOf("MSIE") > -1,
    ie11: navigator.userAgent.indexOf("like Gecko") > -1,
    opera: navigator.userAgent.indexOf("Opera") > -1 || navigator.userAgent.indexOf("OPR") > -1,
    edge: navigator.userAgent.indexOf("Edge") > -1,
    firefox: navigator.userAgent.indexOf("Firefox") > -1,
    safari: navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") == -1,
    chrome: navigator.userAgent.indexOf("Chrome") > -1 && navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Edge") <= -1
}

const SysDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;