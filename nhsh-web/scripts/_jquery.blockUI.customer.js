const BlockuiLoadingUI =
    `
    <div id='blockuiLoading'>
        <div class='process'>
            <span id='progresstext' class='process'>處理中...</span>
            <span id='progresspercentvalue' class='process'></span>
        </div>
    </div>
`;

var blockuiActived = false;

var widthSpace, heightSpace;

function blockuiActive(title, blockId, size) {
    $("#blockui .main_odd").css("display", "none");
    let css;
    widthSpace = typeof (size) == "number" ? size + "vw" : "12vw";
    heightSpace = typeof (size) == "number" ? size + "vh" : "12vh";

    if ($(window).width() < 1000) {
        css = {
            "width": "94vw",
            "height": "96vh",
            "marginTop": "2vh",
            "marginRight": "4vw",
            "marginBottom": "2vh",
            "marginLeft": "2vw",
            "top": 0,
            "left": 0,
            "border": "none",
            "borderRadius": ".5em",
            "background-color": "#F8F8F8",
            "cursor": "",
            "overflow": "hidden",
            "boxShadow": "1px 1px 1px rgb(0,0,0,.3)",
            "textAlign": "left",
            "zIndex": "11"
        }
    } else {
        css = {
            "width": "calc(100vw - {0} * 2)".format(widthSpace),
            "height": "calc(100vh - {0} * 2)".format(heightSpace),
            "marginTop": heightSpace,
            "marginRight": widthSpace,
            "marginBottom": heightSpace,
            "marginLeft": widthSpace,
            "top": 0,
            "left": 0,
            "border": "none",
            "borderRadius": ".5em",
            "background-color": "#F8F8F8",
            "cursor": "",
            "overflow": "hidden",
            "boxShadow": "1px 1px 1px rgb(0,0,0,.3)",
            "textAlign": "left",
            "zIndex": "11"
        }
    }

    let timer = setInterval(function () {
        if ($("#blockui").length > 0 && $("#" + blockId).length > 0) {
            $("#blockuiExit").on("click", blockEscape);
            $("#blockuiSize").on("click", function () {
                blockuiMiniSize(this);
            });

            $(".blockuiTitle").html(title);
            $("#" + blockId).css("display", "inline-block");

            $.blockUI({
                message: $("#blockui"),
                css: css
            });

            blockuiActived = true;

            clearInterval(timer);
        }
    }, 500);
}

function blockuiMiniSize(object) {
    $(".blockOverlay").css({
        top: "100vh",
        left: "-100vw"
    });

    if ($(window).width() < 1000) {
        $(".blockMsg").css({
            width: "25em",
            top: "calc(100% - 2vh - 40px)",
            left: "-2vw"
        });

    } else {
        $(".blockMsg").css({
            width: "25em",
            top: "calc(100% - {0} - 40px)".format(heightSpace),
            left: "-{0}".format(widthSpace)
        });
    }

    $(object).off().on("click", function () {
        blockuiOriginalSize(this);
    });
}

function blockuiOriginalSize(object) {
    $(".blockOverlay").css({
        top: "0",
        left: "0"
    });

    if ($(window).width() < 1000) {
        $(".blockMsg").css({
            width: "94vw",
            top: "0",
            left: "0"
        });

    } else {
        $(".blockMsg").css({
            width: "calc(100vw - {0} * 2)".format(widthSpace),
            top: "0",
            left: "0"
        });
    }

    $(object).off().on("click", function () {
        blockuiMiniSize(this);
    });
}

function blockuiLoading() {
    $.blockUI({
        message: BlockuiLoadingUI,
        css: {
            "width": "300px",
            "height": "300px",
            "marginTop": "calc((100% - 300px) / 4 - 4em)",
            "marginRight": "calc((100% - 300px) / 2)",
            "marginBottom": "calc((100% - 300px) / 2)",
            "marginLeft": "calc((100% - 300px) / 2)",
            "border": "none",
            "backgroundColor": "rgba(0,0,0,0)",
            "backgroundImage": "url('/oddi_src/img/Spin_white.gif')",
            "backgroundSize": "100%",
            "top": 0,
            "left": 0
        }
    });
}


var blockEscape = function () {
    blockuiActived = false;
    $.unblockUI();
    $("#blockui .main_odd").css("display", "none");
}
