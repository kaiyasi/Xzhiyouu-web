// if (typeof(backstage) != "undefined") {
//     var fontSize = "1.1";
// } else {
//     var fontSize = "1.1";
// }

var fontSize = "1";

var colorTheme = "bluegrey_odd";
const __templates = true;

if (__templates) {
    document.getElementsByTagName("html")[0].style.fontSize = fontSize + "rem";
}

function contextmenu(contextId, controlId) {

    let context = document.getElementById(contextId);
    let control = document.getElementById(controlId);

    let pannels = document.getElementById(contextId).getElementsByClassName("main_odd");

    if (pannels.length > 1) {
        for (let i = 0; i < pannels.length; i++) {
            pannels[i].style.display = "none";
        }

        control.style.display = "block";
    }

    context.style.display = "block";
    context.style.left = window.event.clientX - 140 + "px";
    context.style.top = window.event.clientY + "px";
    window.event.cancelBubble = true;
    window.event.returnvalue = false;

    document.addEventListener("click", function() {
        context.style.display = "none";
        control.style.display = "none";
    });
    context.addEventListener("click", function(event) {
        Oddi_EventInterceptor(event);
    });
}

function fontSizeSet(type) {

    var fontSizeNow = document.getElementsByTagName("html")[0].style.fontSize;

    fontSizeNow = parseFloat(fontSizeNow.split("rem")[0]);

    switch (type) {
        case "up":
            if (fontSizeNow < 2) {
                fontSizeNow = fontSizeNow + 0.2;
            }
            break;
        case "down":
            if (fontSizeNow > 0.8) {
                fontSizeNow = fontSizeNow - 0.2;
            }
            break;
        default:
            fontSizeNow = 1;
    }

    console.log(fontSizeNow);

    document.getElementsByTagName("html")[0].style.fontSize = fontSizeNow + "rem";
}
