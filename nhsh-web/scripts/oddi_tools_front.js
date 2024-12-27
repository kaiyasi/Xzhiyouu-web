//事件攔截器
function Oddi_EventInterceptor(e) {
    if (e) {
        e.stopPropagation(); //非IE
    } else {
        window.event.cancelBubble = true; //IE
    }
}

//動態新增link tag，並引入css
function Oddi_DynamicCheckAndAddLinkTag(PluginName, PluginFilePath) {
    PluginName = PluginName || "";
    PluginFilePath = PluginFilePath || "";

    if ((PluginName == null || PluginName == "") || (PluginFilePath == null || PluginFilePath == "")) {
        console.log("Both parameter of this linkTag check function cannot be empty!!")
        return;
    }

    let doclinkTag = document.getElementsByTagName("link");

    for (let i = 0; i < doclinkTag.length; i++) {
        if (doclinkTag[i].href.toLowerCase().indexOf(PluginName.toLowerCase()) >= 0) {
            break;
        }
        if (i == doclinkTag.length - 1) {
            let linkTag = document.createElement("link");
            linkTag.setAttribute("rel", "stylesheet");
            linkTag.setAttribute("type", "text/css");
            linkTag.href = hostplace + PluginFilePath;
            document.head.appendChild(linkTag);
            break;
        }
    }
}

//Check Brower Cookie function is on or off
(function () {
    navigator.cookieActivated = function () {
        if (navigator.userAgent.indexOf('MSIE') != -1 || navigator.userAgent.indexOf('Gecko') != -1) {
            // IE
            return ("cookie" in document && (document.cookie.length > 0 ||
                (document.cookie = "test").indexOf.call(document.cookie, "test") > -1));
        } else {
            // Non-IE browsers
            return navigator.cookieEnabled;
        }
    }();
}())

if (!navigator.cookieActivated) {
    alert("本系統需要啟動瀏覽器cookie功能方能使用！")
}
