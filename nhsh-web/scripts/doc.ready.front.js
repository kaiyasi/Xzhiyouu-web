$(function () {
    //LoadFrontStageMainMenu
    if (typeof (MenuPath) != "undefined") {
        try {
            new Promise(function (resolve, reject) {
                if (MenuPath != "" && MenuPath != null && typeof (MenuPath) == "string") {
                    return getjsondata(MenuPath, "menu", "WebGuide", resolve, reject);
                }
            }).then(function () {
                $("#menu>li>ul>li").on("mouseenter", function () {
                    if ($(this).offset().left > $(window).width() * 3 / 4) {
                        !$(this).children("ul").hasClass("otherSide") && $(this).children("ul").addClass("otherSide");
                    }
                });
            }).catch(function (e) {
                console.log(e);
            }).finally(function () {
                try {
                    frontstage();
                } catch (e) { }
            });
        } catch (e) {
            console.log(e);
        }
    }

    //把所有的<button>的型態換成button，避免有自動變成submit的html按鈕元素
    let DomBtn = document.getElementsByTagName("button");
    for (let i = 0; i < DomBtn.length; i++) {
        DomBtn[i].type = "button";
    }

    $(".linkBlock_odd").html(function (index, html) {
        return html.replace(/&nbsp;/g, "");
    });

    //LazyLoad
    switch (page) {
        case "index":
            let Blocks = $("[data-blocktype]");
            let newsBlock = [];

            $.each(Blocks, function (index, item) {
                let blocktype = $(item).attr("data-blocktype");
                if (blocktype == "26" || blocktype == "31" || blocktype == "62") {
                    newsBlock.push(item);
                }
            });

            try {
                for (let i = 0; i < newsBlock.length; i++) {
                    let container = "";
                    switch (newsBlock[i].className) {
                        case "imgList_odd":
                            container = "img_";
                            break;
                        case "textList_odd":
                            container = "list_";
                            break;
                        case "textTable_odd":
                            container = "table_";
                            break;

                        default:
                            break;
                    }
                    bookmark_seton(container + newsBlock[i].dataset.blockid + "_bookmark_", container + newsBlock[i].dataset.blockid + "_bookmark_block_");
                    document.getElementById(container + newsBlock[i].dataset.blockid + "_bookmark_0").click();
                }
            } catch (e) {
                console.log(e);
            }

            //把目前正在顯示的頁籤的新聞load出來
            $.each($("button[data-used]"), function (index, item) {
                ShowingDataToLoad_Container.push($(item))
            });

            if (ShowingDataToLoad_Container.length){
                LoadingDataUsedBookMarkAnnounce();
            }

            //把尚未檢視的頁籤load出來
            // let DataToLoad = $("button[data-lazyloadcontent]");
            // $.each(DataToLoad, function (index, item) {
            //     item = $(item);
            //     let LoadingAmount = item.attr("data-loadingamount") || '';
            //     let place_id = item.attr("data-place_id") || undefined;
            //     let orderblockno = item.attr("data-orderblockno") || undefined;
            //     let blockid = item.attr("data-blockid") || undefined;
            //     let categorystate = item.attr("data-categorystate");
            //     let currentblocktype = item.parent().parent().attr("data-currentblocktype");
            //     let currentblockid = item.parent().parent().attr("data-currentblockid");
            //
            //     if (place_id && orderblockno && blockid) {
            //         if (!index) {
            //             // LazyLoadNews(blockid, categorystate, orderblockno, currentblocktype, currentblockid, LoadingAmount);
            //         } else {
            //             setTimeout(function () {
            //                 // LazyLoadNews(blockid, categorystate, orderblockno, currentblocktype, currentblockid, LoadingAmount);
            //             }, Oddi_CurrentShowLazyLoadDelayTime * i);
            //         }
            //     }
            //     item.removeAttr("data-lazyloadcontent");
            // });

            //把尚未檢視的頁籤在點擊下去的第一次的時候load出來
            $("button[data-lazyloadcontent]").on("click", function () {
                item = $(this);
                let LoadingAmount = item.attr("data-loadingamount") || '';
                let place_id = item.attr("data-place_id") || undefined;
                let orderblockno = item.attr("data-orderblockno") || undefined;
                let blockid = item.attr("data-blockid") || undefined;
                let categorystate = item.attr("data-categorystate");
                let currentblocktype = item.parent().parent().attr("data-currentblocktype");
                let currentblockid = item.parent().parent().attr("data-currentblockid");

                if (place_id && orderblockno && blockid) {
                    LazyLoadNews(blockid, categorystate, orderblockno, currentblocktype, currentblockid, LoadingAmount);
                }
                item.removeAttr("data-lazyloadcontent");
            });

            if ($("[name='select']").length){

                (function () {
                    let formData = new FormData();
                    formData.append("csrf_token", Oddi_csrftoken);

                    $.ajax({
                        type: "POST",
                        mimeType: "multipart/form-data",
                        url: hostplace + "/gettingaccountdomain",
                        data: formData,
                        contentType: false,
                        processData: false,
                        cache: false,
                        dataType: 'json',
                        error: function (e) {
                            console.log(e);
                        },
                        success: function (data) {
                            if (data.res != "success") {
                                console.log(data.msg);
                            } else {
                                $.each(data.data, function (index, item) {
                                    let option = $(document.createElement("option"));
                                    option.val("@" + item).html(item);
                                    $("[name='select']").append(option);
                                });
                            }
                        }
                    });
                })();

                $('[data-btn="loginBtn"]').on("click", function (e) {
                    e.preventDefault();
                    var formData = new FormData();
                    $.each($(".login_odd input"), function (index, item) {
                        if ($(item).attr("name") == "14c4b06b824ec593239362517f538b29") {
                            formData.append($(item).attr("name"), CryptoJS.MD5($(item).val() + $(".login_odd select").val()).toString())
                        } else {
                            formData.append($(item).attr("name"), CryptoJS.MD5($(item).val()));
                        }
                    });

                    formData.append("CurrentProductCode", CurrentProductCode);
                    formData.append("CurrentSystem", CurrentSystem);
                    formData.append("csrf_token", Oddi_csrftoken);
                    formData.append("Target", "frontstage");
                    $.ajax({
                        type: "POST",
                        mimeType: "multipart/form-data",
                        url: hostplace + "/logincheck",
                        data: formData,
                        contentType: false,
                        processData: false,
                        cache: false,
                        dataType: 'json',
                        success: function (data) {
                            document.getElementById("flashes").innerHTML = "";
                            if (data.res == "fail") {
                                if (data.msg.split("-")[0] == "sql") {
                                    jQalert(String.format(Oddi_Msg_Error, data.msg));
                                } else {
                                    if (data.msg == "Account has been locked") {
                                        document.getElementById("flashes").appendChild(document.createTextNode(Oddi_Msg_AccountBeenLocked));
                                        blockEscape();
                                    } else {
                                        document.getElementById("flashes").appendChild(document.createTextNode(data.msg));
                                        blockEscape();
                                    }
                                }
                            } else {
                                if (data.pwdreset) {
                                    if (CurrentSystem != "None") {
                                        location.href = hostplace + "/loginfirstpwdreset?a=" + CurrentSystem;
                                    } else {
                                        location.href = hostplace + "/loginfirstpwdreset";
                                    }
                                } else {
                                    location.reload();
                                }
                            }
                        },
                        error: function () {
                            jQalert(Oddi_Msg_Http500);
                        }
                    });
                });

            }

            $("input.login").on("keypress", function (e) {
                if (e.keyCode == "13") {
                    $('[data-btn="loginBtn"]').click();
                }
            });

            $("[data-btn='clearInput']").on("click", function () {
                $("input.login").val("");
            });
            break;

        case "AlbumList":
        case "Album":
        case "Content":
            try {
                $.each(currentCategory, function (index, item) {
                    $("li[data-id='{0}']".format(btoa(item[0]))).attr("data-used", "");
                });
            } catch (e) {
                console.log(e);
            }
        case "List":
            if ($('[data-loading="ListPage"]').length){
                ContentPageListLazyLoad()
            }

            try {
                loadImgList($("[data-album]").attr("data-album"));
            } catch (error) { }

            let submenuObj = $($(".submenuContent_odd")[0]).find("ul li[data-used]");
            let submenuText = [];
            $.each(submenuObj, function () {
                submenuText.push($(this).find("a").attr("title"));
            });

            $(".submenuTitle_odd").on("click", function (event) {
                EventInterceptor(event);
                if ($(this).find("+.submenuContent_odd").css("display") == "none") {
                    $(this).find(">img").css("transform", "rotate(0)");
                } else {
                    $(this).find(">img").css("transform", "rotate(-90deg)");
                }

                $(this).find("+.submenuContent_odd").slideToggle();
            }).css("cursor", "pointer");

            //options
            $("[data-filteroption]").on("click", function () {
                let URLVariables = location.search.split("?")[1].split("&");
                let objectActive = $(this);
                let URLlist = [];
                let io = false;

                $.each(URLVariables, function (index, item) {
                    item = item.split("=");

                    if (objectActive.attr("data-filteroption") == "category") {
                        if (item[0] == "category") {
                            item = ["category", objectActive.attr("data-value")];
                            io = true;
                        }

                    } else if (objectActive.attr("data-filteroption") == "owner") {
                        if (item[0] == "PubDepartment") {
                            item = ["PubDepartment", objectActive.attr("data-value")];
                            io = true;
                        }
                    }
                    item = item.join("=");
                    URLlist.push(item);

                });

                if (!io) {
                    if (objectActive.attr("data-filteroption") == "category") {
                        URLlist.push("category=" + objectActive.attr("data-value"));

                    } else if (objectActive.attr("data-filteroption") == "owner") {
                        URLlist.push("PubDepartment=" + objectActive.attr("data-value"));
                    }
                }

                // console.log(location.pathname + "?" + URLlist.join("&"));

                location.href = location.pathname + "?" + URLlist.join("&");


            });
            break;

        case "CusArchive":
            console.log("CusArchive");
            $("a[data-id*='control']").on("click", function () {
                let counter = parseInt($("[data-id='counter']").html());

                $("div.CusArchiveObject_odd").css("display", "none");


                counter = $(this).attr("data-id") == "controlPrev" ? counter - 1 :
                    $(this).attr("data-id") == "controlNext" ? counter + 1 : 0;

                counter == 1 ? $("a[data-id='controlPrev']").css("display", "none") :
                    counter == 3 ? $("a[data-id='controlNext']").css("display", "none") :
                        $("a[data-id='controlPrev'], a[data-id='controlNext']").css("display", "inline-block");

                $("div.CusArchiveObject_odd[data-loop='{0}']".format(counter)).css("display", "inline-block");
                $("[data-id='counter']").html(counter);
            });

            $("a[data-id='controlNext']").click();
            break;
        default:
            break;

    }

    //在前臺自動寫入瀏覽人數
    let ClickRateShowBlock = document.querySelectorAll("[data-clickrateshowing]");
    for (let i = 0; i < ClickRateShowBlock.length; i++) {
        if (typeof (ClickRate) == "number") {
            ClickRateShowBlock[i].innerHTML = langData["default-text"]["viewer"].format(ClickRate);
        } else {
            ClickRateShowBlock[i].innerHTML = "";
        }
    }

    // 列表頁搜尋
    $('[data-filter-search-btn]').on('click', function () {

        if (this.dataset.filterSearchBtn == "reset") {
            for (let i = 0; i < $('[data-filter]').length; i++) {
                switch ($('[data-filter]')[i].nodeName) {
                    case "SELECT":
                        $('[data-filter]')[i].value = $('[data-filter]')[i].dataset.defaultValue;
                        break;
                    case "INPUT":
                        if ($('[data-filter]')[i].type == "checkbox") {
                            $('[data-filter]')[i].checked = false;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        
        let dataFiltersSelector = document.querySelectorAll("[data-filter]");
        let URLVariables = location.search.substring(1).split("&")

        for (let j = 0; j < dataFiltersSelector.length; j++) {

            let FilterDataIn = 0;

            for (let k = URLVariables.length - 1; k > -1; k--) {
                URLVariables[k] = URLVariables[k].split("=");

                if (['pagination', 'max', 'N'].indexOf(URLVariables[k][0]) != -1) {
                    URLVariables.splice(k, 1);
                    continue;
                }

                if (URLVariables[k][0] == dataFiltersSelector[j].dataset.filter) {
                    switch (dataFiltersSelector[j].nodeName) {
                        case "SELECT":
                            URLVariables[k][1] = dataFiltersSelector[j].value;
                            break;
                        case "INPUT":
                            if (dataFiltersSelector[j].type == "checkbox") {
                                if (dataFiltersSelector[j].checked) {
                                    URLVariables[k][1] = dataFiltersSelector[j].dataset.checked;
                                } else {
                                    URLVariables[k][1] = dataFiltersSelector[j].dataset.check;
                                }
                            }
                            break;
                        default:
                            break;
                    }
                    
                    URLVariables[k] = URLVariables[k].join("=");
                    FilterDataIn = 1;
                } else {
                    URLVariables[k] = URLVariables[k].join("=");
                }
            }

            if (!FilterDataIn) {
                URLVariables.push("{0}={1}".format(dataFiltersSelector[j].dataset.filter, dataFiltersSelector[j].value));
            }

        }
        URLVariables = CurrentFilterUrl + "?" + URLVariables.join("&")
        location.href = URLVariables;
    })

    //------------------------------------EventManager------------------------------------
    switch (page) {

        case "Search":
            try {
                document.querySelector("[data-searchbtn]").addEventListener("click", function () {
                    if (document.querySelector("[data-keyword]").value != "") {
                        try {
                            document.getElementById("pagination").value = '';
                            document.getElementById("max").value = '';
                        } catch (e) { }
                        $('#searchfilter').submit();
                    } else {
                        jQalert(Oddi_Msg_SearchNeedKeyWord);
                    }
                });


                //搜尋頁的radio btn的click事件]
                $("[data-searchfiltersubmiter]").on("click", function () {
                    if ($("[data-keyword]").val() != "") {
                        document.getElementById("pagination").value = '';
                        document.getElementById("max").value = '';
                        $('#searchfilter').submit();
                    }
                });
            } catch (e) {
                console.log(e)
            }

        case "Album":
        case "Content":
        case "index":
        case "List":
        case "AlbumList":

            try {
                $(".searchBtn_odd").on("click", function () {
                    Oddi_EventInterceptor(event);

                    if ($(this).prev().val() != "") {
                        $(this).parent().parent("form").submit();
                    }
                });
                $(".searchLabel_odd").on("click", function () {
                    Oddi_EventInterceptor(event);
                })
                $(".searchInput_odd").on("click", function () {
                    Oddi_EventInterceptor(event);
                })
            } catch (e) {
                console.log(e)
            }
            break;

        default:

    }
    //------------------------------------EventManager------------------------------------


    switch (page) {

        case "Search":
            getgroupjsondata(String.format("{0}/getorgstructure?currentgroup={1}", hostplace, CurrentGroup), "OrgStructure", 1, 0, 0, 0, "NodeSource");

            setTimeout(function () {
                $("#OrgStructure a").on("click", function () {
                    if ($("[data-keyword]").val() != "") {
                        $('#searchfilter').submit();
                    }
                });
            }, 250);
            break;

        case "RestrictedContent":
            DelayRedirect();
            break;
        default:

    }

    $(".imgListContent_odd div.img, .imgListContent_odd div.img").css({
        "filter": "brightness(80%)",
        "transition": "linear 200ms"
    }).on({
        "mouseover": function () {
            $(this).css({
                "filter": "brightness(100%)"
            });
        },
        "mouseout": function () {
            $(this).css({
                "filter": "brightness(80%)"
            });
        }
    });

    $.each($(".paragraph_odd img"), function (index, item) {
        try {
            if ($(item).attr("onclick").length <= 0) {
                $(".paragraph_odd img")
                    .attr("title", "點擊以放大圖片")
                    .css("cursor", "pointer")
                    .on("click", function () {
                        PicZoom.active(this);
                    });
            }
        } catch (error) {}
    });

    $.each($("[data-carousel='1']"), function (index, item) {
        let owltimer = setInterval(function () {
            if (owlCarouselActive) {
                owlCarouselActive(item);
                clearInterval(owltimer);
            }
        }, 200);
    });

    for (let i = 0; i < $("a").length; i++) {
        if ($("a")[i].target.indexOf("blank") != -1) {
            if ($("a")[i].title.indexOf("視窗") == -1 && $("a")[i].title.indexOf("分頁") == -1) {
                $("a")[i].title = "以新分頁開啟 " + $("a")[i].title;
            }
            
        }
    }
});
