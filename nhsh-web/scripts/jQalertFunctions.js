var inhere = 0;
var leavesearch = false;
var nodetemp1 = null;
var nodetemp2 = null;
var nodetemp3 = null;
var Oddi_jQMessage_OkBtnText = "好";
var Oddi_jQMessage_CancelBtnText = "取消";
var Oddi_jQMessage_CancelBtnText_Later = "晚點再說";
var Oddi_jQMessage_CancelBtnText_ThinkAboutIt = "再考慮一下";

function jQalert(contant, buttonDone, active) {
    buttonDone = buttonDone || Oddi_jQMessage_OkBtnText;
    $.MessageBox({
        buttonDone: buttonDone,
        message: contant
    }).done(active);
}

function jConfirm(contant, buttonDone, buttonFail, resolve, reject) {
    buttonDone = buttonDone || Oddi_jQMessage_OkBtnText;
    buttonFail = buttonFail || Oddi_jQMessage_CancelBtnText;
    $.MessageBox({
        buttonDone: buttonDone,
        buttonFail: buttonFail,
        message: contant
    }).done(resolve).fail(reject);
}

function jQprompt(contant) {
    $.MessageBox({
        buttonDone: "確認",
        buttonFail: "取消",
        input: true,
        message: contant
    }).done(function (data) {
        console.log(data)
        if ($.trim(data)) { //"有"輸入資料時執行 $.trim() 是jquery的清除空格

        } else { //"沒有"入任何資料時執行

        }
    });
}

function jQpromptSingleSelection(contant, selectionOptions, FunctionName, Extradata, buttonDone, buttonFail) {
    buttonDone = buttonDone || Oddi_jQMessage_OkBtnText;
    buttonFail = buttonFail || Oddi_jQMessage_CancelBtnText;

    selectionOptions = selectionOptions || {};
    var defaultValue = "";
    // if (typeof(selectionOptions["0"]) == "undefined") {
    //     selectionOptions["0"] = "請選擇";
    //     defaultValue = "0";
    // } else if (typeof(selectionOptions["-1"]) == "undefined") {
    //     selectionOptions["-1"] = "請選擇";
    //     defaultValue = "-1";
    // }
    let selectionElement = document.createElement("select");
    let optionElement = document.createElement("option");
    optionElement.innerHTML = "請選擇";
    optionElement.value = "";
    optionElement.setAttribute("selected", "");

    selectionElement.appendChild(optionElement);

    for (let key in selectionOptions) {
        optionElement = document.createElement("option");
        optionElement.innerHTML = selectionOptions[key];
        optionElement.value = key;

        selectionElement.appendChild(optionElement);
    }

    $.MessageBox({
        buttonDone: buttonDone,
        buttonFail: buttonFail,
        input: selectionElement,
        message: contant + "<br>"
    }).done(function (data) {
        if (data) {
            for (i = 0; i < FunctionName.length; i++) {
                FunctionName[i](data, Extradata);
            }
        } else {
            jQalert_and_execution(Oddi_Msg_NeedToChooseAnyThing, "redoSingleSelection", [contant, selectionOptions, FunctionName, buttonDone, buttonFail])
        }
    });
}

function jQdirector_direct(contant, url, buttonDone) {
    buttonDone = buttonDone || Oddi_jQMessage_OkBtnText;
    $.MessageBox({
        buttonDone: buttonDone,
        message: contant
    }).done(function () {
        $(window).unbind('beforeunload');
        isChange = 0;
        if (url.indexOf("http") == -1) {
            if (hostplace){
                url.substring(0,hostplace.length) != hostplace ? url = hostplace + url : false;
            }
        }
        location.href = url
    });
}

function jQdirector_direct_blank(contant, url, buttonDone) {
    buttonDone = buttonDone || Oddi_jQMessage_OkBtnText;
    $.MessageBox({
        buttonDone: buttonDone,
        message: contant
    }).done(function () {
        $(window).unbind('beforeunload');
        isChange = 0;
        let redirector = document.createElement("a");
        redirector.target = "_blank";

        if (url.indexOf("http") == -1) {
            if (hostplace){
                url.substring(0,hostplace.length) != hostplace ? url = hostplace + url : false;
            }
        }

        redirector.href = url;
        redirector.click();
    });
}

function jQdirector_confirm(contant, urlforward, urlforcancel, buttonDone, buttonFail) {
    buttonDone = buttonDone || Oddi_jQMessage_OkBtnText;
    buttonFail = buttonFail || Oddi_jQMessage_CancelBtnText;
    $.MessageBox({
        buttonDone: buttonDone,
        buttonFail: buttonFail,
        message: contant
    }).done(function () {
        $(window).unbind('beforeunload');
        if (urlforward.indexOf("http") == -1) {
            if (hostplace){
                urlforward.substring(0,hostplace.length) != hostplace ? urlforward = hostplace + urlforward : false;
            }
        }
        location.href = urlforward;
    }).fail(function () {
        if (urlforcancel != undefined && urlforcancel != "#") {
            $(window).unbind('beforeunload');
            if (urlforcancel.indexOf("http") == -1) {
                if (hostplace){
                    urlforcancel.substring(0,hostplace.length) != hostplace ? urlforcancel = hostplace + urlforcancel : false;
                }
            }
            location.href = hostplace + urlforcancel;
        }
    });
}

function jQalert_and_reload(contant, buttonDone) {
    buttonDone = buttonDone || Oddi_jQMessage_OkBtnText;
    $.MessageBox({
        buttonDone: buttonDone,
        message: contant
    }).done(function () {
        $(window).unbind('beforeunload');
        location.reload();
    });
}

function jQconfirm_and_reload(contant, buttonDone, buttonFail) {
    buttonDone = buttonDone || Oddi_jQMessage_OkBtnText;
    buttonFail = buttonFail || Oddi_jQMessage_CancelBtnText;
    $.MessageBox({
        buttonDone: buttonDone,
        buttonFail: buttonFail,
        message: contant
    }).done(function () {
        $(window).unbind('beforeunload');
        location.reload();
    }).fail(function () {

    });
}

function jQalert_and_execution(contant, act, values, buttonDone) {
    buttonDone = buttonDone || Oddi_jQMessage_OkBtnText;
    if (inhere >= 1) {
        return;
    }
    inhere += 1;
    $.MessageBox({
        buttonDone: buttonDone,
        message: contant
    }).done(function () {
        jQexecution(act, values);
    });
}

function jQconfirm_and_execution(contant, act, values, buttonDone, buttonFail) {
    buttonDone = buttonDone || Oddi_jQMessage_OkBtnText;
    buttonFail = buttonFail || Oddi_jQMessage_CancelBtnText;
    if (inhere >= 1) {
        return;
    }
    inhere += 1;
    $.MessageBox({
        buttonDone: buttonDone,
        buttonFail: buttonFail,
        message: contant
    }).done(function () {
        jQexecution(act, values);
    }).fail(function () {
        jQexecution(act, values, 0);
        inhere = 0;
    });
}

function jQconfirm(contant, act, extradata, buttonDone, buttonFail) {
    buttonDone = buttonDone || Oddi_jQMessage_OkBtnText;
    buttonFail = buttonFail || Oddi_jQMessage_CancelBtnText;
    if (extradata == undefined) {
        extradata = null;
    }
    if (inhere >= 1) {
        return;
    }
    inhere += 1;
    $.MessageBox({
        buttonDone: buttonDone,
        buttonFail: buttonFail,
        message: contant
    }).done(function () {
        jQconfirmRequirement(true, act, extradata);
    }).fail(function () {
        jQconfirmRequirement(false, act, extradata);
    });
}
