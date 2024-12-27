var FunctionURLs = {
    "2": "#",
    "3": "announce",
    "5": "#",
    "6": "#",
    "7": "#",
    "8": "#",
    "9": "pagecontenteditorboardsetting",
    "11": "menulist",
    "12": "#",
    "13": "#",
    "15": "announce"
};
var SubwebAlternative = "(另開新視窗)前往{0}網站";

//讀取json資料
function getjsondata(path, menublockid, WebGuideBlockId, resolve, reject) {
    let status = false;

    if (document.getElementsByClassName(menublockid).length > 0) {
        $.getJSON(hostplace + path, {}, function (data) {
            document.getElementById(menublockid).innerHTML = "";
            switch (page) {
                case "WYSIWYGEditor_AccessbilityChecker_Advanced":
                case "WYSIWYGEditor_AccessbilityChecker":
                case "WYSIWYGEditorBoardSetting":
                case "WYSIWYGEditor":
                    for (item in FunctionURLs) {
                        FunctionURLs[item] = ModifyingSubWebUrl + FunctionURLs[item]
                    }

                    for (let i = 0; i < document.getElementsByClassName(menublockid).length; i++) {
                        RecursiveForShowEditorData(data, 0, document.getElementsByClassName(menublockid)[i]);
                    }

                    break;
                case "WebsiteGuide":
                    try {

                        for (let i = 0; i < document.getElementsByClassName(menublockid).length; i++) {
                            RecursiveForShowNormalMenu(data, 0, document.getElementsByClassName(menublockid)[i]);
                        }

                        ProcessMenutypeItem_OnMenu(document.getElementsByClassName(menublockid), 1)

                        // RecursiveForShowNormalMenu(data, 0, document.getElementById(WebGuideBlockId));
                        RecursiveForShowWebGuide2024(data, 0, document.getElementById(WebGuideBlockId));

                        ProcessMenutypeItem_OnMenu(document.getElementById(WebGuideBlockId), 0)

                    } catch (e) {
                        console.log("顯示導覽資料的ul區塊不存在!!");
                        console.log(e);
                    }
                    break;
                default:

                    for (let i = 0; i < document.getElementsByClassName(menublockid).length; i++) {
                        RecursiveForShowNormalMenu(data, 0, document.getElementsByClassName(menublockid)[i]);
                    }

                    ProcessMenutypeItem_OnMenu(document.getElementsByClassName(menublockid), 1)

            }
        }).done(function () {
            return resolve();
        }).fail(function () {
            return reject("Reject this!");
        });
    } else {
        return reject("顯示主選單的ul區塊不存在!!");
    }
}

function RecursiveForShowEditorData(data, classset, parnetUl, liClassName, ulClassName) {
    liClassName = liClassName || "";
    ulClassName = ulClassName || "";
    //增加各階層辨識度所加之空白
    var space = "";
    // for (var i = 0; i <= classset; i++) {
    //     space += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    // }
    //把json內容show出來
    for (var i = 0; i <= data.length - 1; i++) {
        let liTag = document.createElement("li");
        let TagA = document.createElement("a");
        TagA.appendChild(document.createTextNode(space + data[i].title));
        TagA.id = data[i].nodeid;
        TagA.title = data[i].title;
        TagA.dataset.nodetype = data[i].nodetype;
        liTag.className = liClassName;
        // if (data[i].nodetype != "11") {
        //     TagA.style.cursor = "pointer";
        // }

        if (data[i].nodetype in FunctionURLs) {
            if (FunctionURLs[data[i].nodetype] != "#") {
                if (data[i].nodetype != "9") {
                    TagA.onclick = function () {
                        jQdirector_confirm(Oddi_Msg_FunNotAvailableHere, String.format("{0}?a={1}", FunctionURLs[this.dataset.nodetype], this.id), "#");
                        Oddi_EventInterceptor(event);
                    }
                } else {
                    TagA.onclick = function () {
                        location.href = String.format("{0}?a={1}", FunctionURLs[this.dataset.nodetype], this.id);
                        Oddi_EventInterceptor(event);
                    }
                }
            } else {
                TagA.onclick = function () {
                    jQalert(Oddi_Msg_FunNotAvailableNow);
                }
            }
        } else {
            TagA.onclick = function () {
                jQalert(Oddi_Msg_FunNotAvailable);
            }
        }
        liTag.appendChild(TagA);
        if (typeof (data[i].children) != "undefined" && classset <= MenuShowingStage - 1) {
            let ulTag = document.createElement("ul");
            ulTag.id = data[i].nodeid + "_ul";
            ulTag.className = ulClassName;
            RecursiveForShowEditorData(data[i].children, classset + 1, ulTag);
            if (ulTag.children.length > 0) {
                liTag.appendChild(ulTag);
            }
        }

        parnetUl.appendChild(liTag);

        if (i == data.length - 1) {
            if (classset == 0) {
                MenuSetComplete();
            }
            return;
        }
    }
}

//生成前台的主選單
function RecursiveForShowNormalMenu(data, classset, parnetUl, liClassName, ulClassName) {
    liClassName = liClassName || "";
    ulClassName = ulClassName || "";
    //增加各階層辨識度所加之空白
    var space = "";
    // for (var i = 0; i <= classset; i++) {
    //     space += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    // }
    //把json內容show出來

    if (classset == 0) {
        ulClassName = "splash";
    }

    for (var i = 0; i <= data.length - 1; i++) {
        let liTag = document.createElement("li");
        let TagA = document.createElement("a");
        TagA.appendChild(document.createTextNode(space + data[i].title));
        TagA.id = data[i].nodeid;
        TagA.title = data[i].title;
        liTag.className = liClassName;

        if (data[i].nodetype == "11" && classset < MenuShowingStage) {
            //working need to change to SW
            TagA.href = "javascript:void(0);";
        } else {
            if (data[i].link != "") {
                if (data[i].nodetype == "13") {
                    if (data[i].link.indexOf("<a") != -1) {
                        let LinkConverter = document.createElement("div");
                        LinkConverter.innerHTML = data[i].link;
                        TagA = LinkConverter.getElementsByTagName("a")[0];
                        TagA.innerHTML = space + data[i].title;
                        // data[i].link = LinkConverter.getElementsByTagName("a")[0].href;
                        // data[i].title =
                        // if (data[i].targetBlank) {
                        //     TagA.target = "_blank";
                        // }
                    }
                } else if (data[i].nodetype == "12") {
                    TagA.title = String.format(SubwebAlternative, data[i].title);
                    if (data[i].targetBlank) {
                        TagA.target = "_blank";
                    }
                    TagA.href = data[i].link;
                } else if (data[i].nodetype == "39" || data[i].nodetype == "40" || data[i].nodetype == "41" || data[i].nodetype == "42") {
                    TagA.href = data[i].link;
                }
            } else {
                TagA.href = String.format("{0}{2}/content?a={1}", hostplace, TagA.id, subweburl);
            }
        }

        if (TagA.target = "_blank" && TagA.href.indexOf("javascript:void(0)") == -1) {
            TagA.title = "以新分頁開啟 " + TagA.title;
        }

        liTag.appendChild(TagA);
        liTag.onclick = function () {
            Oddi_EventInterceptor(event);
        }

        if (typeof (data[i].children) != "undefined" && classset < MenuShowingStage) {
            let ulTag = document.createElement("ul");
            ulTag.id = data[i].nodeid + "_ul";
            ulTag.className = ulClassName;
            RecursiveForShowNormalMenu(data[i].children, classset + 1, ulTag);
            if (ulTag.children.length > 0) {
                liTag.appendChild(ulTag);
            }
        }
        parnetUl.appendChild(liTag);

        if (i == data.length - 1) {
            if (classset == 0) {
                MenuSetComplete();
            }
            return;
        }
    }
}

//生成網站導覽
function RecursiveForShowWebGuide(data, classset, parnetUl, liClassName, ulClassName) {
    liClassName = liClassName || "";
    ulClassName = ulClassName || "";
    //增加各階層辨識度所加之空白
    var space = "";
    // for (var i = 0; i <= classset; i++) {
    //     space += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    // }
    //把json內容show出來
    for (var i = 0; i <= data.length - 1; i++) {
        let liTag = document.createElement("li");
        let TagA = document.createElement("a");
        TagA.appendChild(document.createTextNode(space + data[i].title));
        TagA.id = data[i].nodeid;
        TagA.title = data[i].title;
        liTag.className = liClassName;

        if (data[i].nodetype == "11" && classset < MenuShowingStage) {
            TagA.href = "javascript:void(0);";
        } else {
            if (data[i].link != "") {
                if (data[i].nodetype == "13") {
                    if (data[i].link.indexOf("<a") != -1) {
                        let LinkConverter = document.createElement("div");
                        LinkConverter.innerHTML = data[i].link;
                        TagA = LinkConverter.getElementsByTagName("a")[0];
                        TagA.innerHTML = space + data[i].title;
                        // data[i].link = LinkConverter.getElementsByTagName("a")[0].href;
                        // if (data[i].targetBlank) {
                        //     TagA.target = "_blank";
                        // }
                    }
                } else if (data[i].nodetype == "12") {
                    TagA.title = String.format(SubwebAlternative, data[i].title);
                    if (data[i].targetBlank) {
                        TagA.target = "_blank";
                    }
                    TagA.href = data[i].link;
                }
            } else {
                TagA.href = String.format("{0}{2}/content?a={1}", hostplace, TagA.id, subweburl);
            }
        }

        if (TagA.target = "_blank" && TagA.href.indexOf("javascript:void(0)") == -1) {
            TagA.title = "以新分頁開啟 " + TagA.title;
        }

        liTag.appendChild(TagA);
        liTag.onclick = function () {
            Oddi_EventInterceptor(event);
        }

        if (typeof (data[i].children) != "undefined" && classset < MenuShowingStage) {
            let ulTag = document.createElement("ul");
            ulTag.id = data[i].nodeid + "_ul";
            ulTag.className = ulClassName;
            RecursiveForShowWebGuide(data[i].children, classset + 1, ulTag);
            if (ulTag.children.length > 0) {
                liTag.appendChild(ulTag);
            }
        }
        parnetUl.appendChild(liTag);
        if (i == data.length - 1) {
            return;
        }
    }
}

function MenuSetComplete() {
    try {
        !customMenu ? menuOnReady(menuObject) : "";
    } catch (e) {
        try {
            if (NotReady) {
                setTimeout(function () {
                    try {
                        var a = $("#menu a");
                        var b = [];

                        for (var i = 0; i < a.length; i++) {
                            if (a[i].href.indexOf("void(0)") > 0) {
                                b.push(a[i]);
                            }
                        }

                        $(b).click(function () {
                            $(this).next().slideToggle();
                        });
                    } catch (e) {
                        console.log(e);
                    }
                }, 600);
            }

        } catch (e) {
            console.log(e);
            try {
                menuAddEventListener(menuDOM_UsedObject);
            } catch (e) {
                console.log(e);
            }

        }
    }
}


// ----------------------- WebGuide(New 2024) -----------------------
function RecursiveForShowWebGuide2024(data, classset, parnetUl, currentClasssetNo, liClassName, ulClassName) {
    liClassName = liClassName || "";
    ulClassName = ulClassName || "";
    //增加各階層辨識度所加之空白
    let space = "";
    for (var i = 0; i <= classset; i++) {
        space += nbsp_str;
    }
    // 把json內容show出來

    if (classset == 0) {
        ulClassName = "splash";
    }

    typeof (currentClasssetNo) == "undefined" || !currentClasssetNo ? currentClasssetNo = '' : false;

    for (var i = 0; i <= data.length - 1; i++) {
        let liTag = document.createElement("li");
        let TagA = document.createElement("a");

        let classsetNo = currentClasssetNo;

        classsetNo ? classsetNo += '-' : false;

        classsetNo += (i + 1).toString();

        TagA.appendChild(document.createTextNode(classsetNo + space + data[i].title));
        TagA.id = data[i].nodeid;
        TagA.title = data[i].title;
        liTag.className = liClassName;

        if (data[i].nodetype == "11" && classset < MenuShowingStage) {
            //working need to change to SW
            TagA.href = "javascript:void(0);";
        } else {
            if (data[i].link != "") {
                if (data[i].nodetype == "13") {
                    if (data[i].link.indexOf("<a") != -1) {
                        let LinkConverter = document.createElement("div");
                        LinkConverter.innerHTML = data[i].link;
                        TagA = LinkConverter.getElementsByTagName("a")[0];
                        TagA.innerHTML = classsetNo + space + data[i].title;
                        // data[i].link = LinkConverter.getElementsByTagName("a")[0].href;
                        // data[i].title =
                        // if (data[i].targetBlank) {
                        //     TagA.target = "_blank";
                        // }
                    }
                } else if (data[i].nodetype == "12") {
                    TagA.title = String.format(SubwebAlternative, data[i].title);
                    if (data[i].targetBlank) {
                        TagA.target = "_blank";
                        TagA.title = "以新分頁開啟 " + TagA.title;
                    }
                    TagA.href = data[i].link;
                } else if (data[i].nodetype == "39" || data[i].nodetype == "40" || data[i].nodetype == "41" || data[i].nodetype == "42") {
                    TagA.href = data[i].link;
                }
            } else {
                TagA.href = String.format("{0}{2}/content?a={1}", hostplace, TagA.id, subweburl);
            }
        }

        if (TagA.target = "_blank" && TagA.href.indexOf("javascript:void(0)") == -1) {
            TagA.title = "以新分頁開啟 " + TagA.title;
        }

        liTag.appendChild(TagA);
        liTag.onclick = function () {
            Oddi_EventInterceptor(event);
        }

        if (typeof (data[i].children) != "undefined" && classset < MenuShowingStage) {
            let ulTag = document.createElement("ul");
            ulTag.id = data[i].nodeid + "_ul";
            ulTag.className = ulClassName;
            RecursiveForShowWebGuide2024(data[i].children, classset + 1, ulTag, classsetNo);
            if (ulTag.children.length > 0) {
                liTag.appendChild(ulTag);
            }
        }
        parnetUl.appendChild(liTag);

        if (i == data.length - 1) {
            if (classset == 0) {
                MenuSetComplete();
            }
            return;
        }
    }
}
// ----------------------- WebGuide(New 2024) -----------------------

function ProcessMenutypeItem_OnMenu(MenuDOM, addcursor) {
    for (let i = 0; i < $(MenuDOM).find('a').length; i++) {
        if ($($(MenuDOM).find('a')[i]).attr('href').indexOf("javascript:void(0)") != -1) {
            $($(MenuDOM).find('a')[i]).removeAttr('target');
        }
    }
}