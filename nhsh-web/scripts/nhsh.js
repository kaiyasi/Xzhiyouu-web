var frontstage = function () {
    $(window).resize(function () {
        $(window).scroll();
    });

    try {
        $(".linkBlockTitle_odd").click(function () {
            $(this).next(".linkBlockContent_odd").slideToggle()
        });
    } catch (e) {
        console.log(e);
    }

    if ($(window).width() < 1000) {
        $(".banner_odd").css("margin-top", $("header").height() + "px");
    } else {
        $(".banner_odd").css("margin-top", "0");
    }

    $(window).resize(function () {
        if ($(window).width() < 1000) {
            $(".banner_odd").css("margin-top", $("header").height() + "px");
        } else {
            $(".banner_odd").css("margin-top", "0");
        }
    });

    try {
        if ($(window).width() < 1000) {
            $(".menuColumn_odd")[0].style.top = $("header").height() + "px";
            $("header")[0].style.top = 0;

            let p = 0,
                t = 0;

            $(window).scroll(function () {
                p = $(this).scrollTop();
                if (t < p) {
                    if ($(window).scrollTop() > $("header").height() && $(window).scrollTop() > 50) {
                        $(".menuColumn_odd")[0].dataset["set"] = 1;
                        $(".menuColumn_odd")[0].style.top = $("div.navigation_odd").height() + "px";
                        $("header")[0].style.top = "-" + $("div.navigation_odd").height() + "px";
                    } else {
                        $(".menuColumn_odd")[0].dataset["set"] = 0;
                        $(".menuColumn_odd")[0].style.top = $("header").height() + "px";;
                        $("header")[0].style.top = 0;
                    }
                } else {
                    $(".menuColumn_odd")[0].dataset["set"] = 0;
                    $(".menuColumn_odd")[0].style.top = $("header").height() + "px";
                    $("header")[0].style.top = 0;
                }


                setTimeout(function () {
                    t = p;
                }, 1);

            });
        } else {
            $(".menuColumn_odd")[0].style.top = 0;
            $("header")[0].style.top = 0;
        }
    } catch (e) {
        console.log(e);
    }

    let timer = setInterval(function () {
        if ($("header").height() > 0) {
            clearInterval(timer);
            $(window).resize();
            $(window).scroll();
        }
    }, 100);
}
