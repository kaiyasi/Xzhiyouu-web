const menuObject = {
    "menuId": "#menu_odd",
    "menuBtn": "#menu_btn_odd, [data-id='menu_btn_odd']",
    "backBtn": "#menu_btn_back_odd",
    "menuCloseBtn": "#menu_btn_close_odd",
    "localSpan": "#menu_local_odd",
    "activeClassName": "menuActive",
}
var menuPath = [];


function menuOnReady(obj) {
    $(obj.menuBtn).on("click", function (event) {
        Oddi_EventInterceptor(event);

        if ($(window).width() < 1000) {
            if ($("." + obj.activeClassName).length > 0) {
                $(obj.menuId).removeClass(obj.activeClassName);
            } else {
                $(obj.menuId).addClass(obj.activeClassName);
            }
        }
    });

    $(obj.menuId + " a").on({
        click: function () {
            if ($(window).width() < 1000) {
                if ($(this).next().length != 0) {
                    $(this).next().slideToggle();
                }
            }
        },
        focus: function () {
            if ($(window).width() > 1000) {
                if ($(this).next().length != 0) {
                    $(this).next().css("display", "inline-block");
                }
            }
        },
        blur: function () {
            if ($(window).width() > 1000) {
                if ($(this).parent().next().length == 0 && $(this).next().length == 0) {
                    $(this).parent().parent().css("display", "");

                    if ($(this).parent().parent().parent().next().length == 0) {
                        $(this).parent().parent().parent().parent().css("display", "");
                    }
                }
            }
        }
    });

    $("body").on("click", function () {
        $("." + obj.activeClassName).removeClass(obj.activeClassName);
        $(obj.menuId + " a").next().css("display", "");
    });

    try {
        $(window).resize(function () {
            if ($(window).width() < 1000) {
                $("ul#menu")[0].style.height = "calc(100vh - " + $("header").height() + "px - " + $(".menuColumn_odd").height() + "px)";
            } else {
                $("ul#menu")[0].style.height = "auto";
            }
        });
    } catch (e) {
        console.log(e);
    }
}
