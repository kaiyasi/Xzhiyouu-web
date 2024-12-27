const PicZoom = {
    initStatus: false,
    imgStack: [],
    altStack: [],
    imgLength: 0,
    imgCursor: 0,
    __init__: function () {
        if (!PicZoom.initStatus) {
            $("#picZoomViewerPreviousBtn").on({
                "click": PicZoom.prev,
                "keypress": PicZoom.keypress
            });
            $("#picZoomVieweNextBtn").on({
                "click": PicZoom.next,
                "keypress": PicZoom.keypress
            });
            $("#picZoomViewerExitBtn").on({
                "click": PicZoom.exit,
                "keydown": PicZoom.keydown
            });
            PicZoom.initStatus = true;
        }
    },
    _active: function () {
        $("#picZoomImg").attr("src", PicZoom.imgStack[PicZoom.imgCursor]);
        $("#picZoomAlt").html(PicZoom.altStack[PicZoom.imgCursor]);
        $("#now").html(PicZoom.imgCursor + 1);
        $("#total").html(PicZoom.imgLength);
    },
    _blockui: function () {
        $.blockUI({
            message: $("#blockUI_piczoom_odd"),
            css: {
                "border": "none",
                "background-color": "rgba(0, 0, 0, 0.6)",
                "width": "100%",
                "height": "100%",
                "top": "0",
                "left": "0",
                "overflow": "hidden"
            }
        });
    },
    next: function () {
        if (PicZoom.imgCursor == PicZoom.imgLength - 1) {
            PicZoom.imgCursor = 0;
        } else {
            PicZoom.imgCursor++;
        }

        PicZoom._active();
    },
    prev: function () {
        if (PicZoom.imgCursor == 0) {
            PicZoom.imgCursor = PicZoom.imgLength - 1;
        } else {
            PicZoom.imgCursor--;
        }

        PicZoom._active();
    },
    exit: function () {
        $.unblockUI();
        PicZoom.imgStack = [];
        PicZoom.altStack = [];
        PicZoom.imgLength = 0;
        PicZoom.imgCursor = 0;

        $("#picZoomViewerPreviousBtn, #picZoomVieweNextBtn, #count").removeAttr("data-hidden");
    },
    keydown: function (event) {
        let code = event.keyCode;
        code == 27 ? PicZoom.exit() : code == 37 ? PicZoom.prev() : code == 39 ? PicZoom.next() : "";
    },
    active: function (img, altSwitch) {
        PicZoom.__init__();
        let src =
            $(img).attr("data-zoom") ? $(img).attr("data-zoom") :
                $(img).attr("src").indexOf("temp.png") < 0 ? $(img).attr("src") :
                    $(img).attr("data-src");
        let alt = $(img).attr("alt");

        altSwitch = altSwitch == undefined ? true : altSwitch;

        $("#picZoomImg").attr("src", src);
        $("#picZoomViewerPreviousBtn, #picZoomVieweNextBtn, #count").attr("data-hidden", "");

        if (altSwitch) {
            $("#picZoomAlt").html(alt);
        } else {
            $("#blockUI_piczoom_odd div.alt").attr("data-hidden");
            $("#picZoom_imgContent").attr("data-only-img", "");
        }

        PicZoom._blockui();
    },
    carousel: function (parent, cursor) {
        PicZoom.__init__();
        let stack = $(parent).find("img");
        let position =
            $(cursor).attr("data-zoom") ? $(cursor).attr("data-zoom") :
                $(cursor).attr("src").indexOf("temp.png") < 0 ? $(cursor).attr("src") :
                    $(cursor).attr("data-src");;

        $.each(stack, function () {
            if ($(this).attr("data-zoom")) {
                PicZoom.imgStack.push($(this).attr("data-zoom"));
            } else if ($(this).attr("src").indexOf("temp.png") >= 0) {
                PicZoom.imgStack.push($(this).attr("data-src"));
            } else {
                PicZoom.imgStack.push($(this).attr("src"));
            }
            PicZoom.altStack.push($(this).attr("alt"));
        });

        PicZoom.imgLength = PicZoom.imgStack.length;
        PicZoom.imgCursor = PicZoom.imgStack.indexOf(position);


        PicZoom._active();
        PicZoom._blockui();
    }
}