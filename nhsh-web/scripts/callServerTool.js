try {
    Oddi_ProgressBar
} catch (e) {
    $.getScript("/oddi_src/lib/Oddi_tools/ver2.0/progressBar.js");
}

function formActive(method, path, dataset) {
    // 傳入: 方法、路徑、資料(dict)

    if (method == "POST") {
        dataset["csrf_token"] = Oddi_csrftoken;
        // 如果是POST則加入CSRF Token
    }

    let form = $(document.createElement("form"))
        .attr({
            "method": method,
            "action": path,
            "data-hidden": ""
        });

    $.each(dataset, function (key, value) {
        let input = $(document.createElement("input"))
            .attr({
                "name": key,
                "value": value
            });

        $(form).append(input);
    });

    $("body").append(form);
    form.submit();
}

// 經由ajax傳呼(POST)
function postActive(path, dataset, success, fail, error) {
    // 傳入: 路徑、資料(dict)、成功後的行為、失敗後的行為、ajax報錯後的行為

    fail = fail || false;
    error = error || false;

    $.ajax({
        type: "POST",
        mimeType: "multipart/form-data",
        url: path,
        data: dataset,
        contentType: false,
        processData: false,
        cache: false,
        dataType: 'json',
        xhr: function() {
            try {
                return Oddi_ProgressBar();
            } catch (e) {
                console.log(e);
            }
        },
        error: function (e) {
            if (!error) {
                console.error("returnError", e);
                jQalert("發生錯誤，請稍後再試或聯絡管理員。");
            } else {
                error(e);
            }
            $.unblockUI();
            try {
                Oddi_ProgressBar(0);
            } catch (e) {

            }
        },
        success: function (data) {
            if (data.res != "success") {
                if (!fail) {
                    console.error("returnFail", data.msg);
                    jQalert("發生錯誤，請稍後再試或聯絡管理員。");
                } else {
                    fail(data);
                }
            } else {
                isChange = false;
                if (!success) {
                    console.log(data);
                } else {
                    success(data);
                }
            }
            $.unblockUI();
            try {
                Oddi_ProgressBar(0);
            } catch (e) {

            }
        }
    });
}

// 經由getJSON傳呼(GET)
function getActive(path, dataset, success, done, fail, error, always) {
    // 傳入: 路徑、資料、成功後的行為、結束後行為、失敗後行為、jquery報錯行為、結束後行為
    done = done || false;
    always = always || false;
    fail = fail || false;

    $.getJSON(path, dataset, function (data) {
        if (data.res != "success") {
            if (!fail) {
                console.error("returnFail", data.msg);
                jQalert("發生錯誤，請稍後再試或聯絡管理員。");
            } else {
                fail(data);
            }
        } else {
            if (!success) {
                console.log(data);
            } else {
                success(data);
            }
        }
    }).done(function () {
        if (done) {
            done()
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        if (!error) {
            console.error("returnError", jqXHR, textStatus, errorThrown);
            jQalert("發生錯誤，請稍後再試或聯絡管理員。");
        } else {
            error(jqXHR, textStatus, errorThrown);
        }
    }).always(function () {
        if (always) {
            always();
        }
    });
}

// 登入狀態確認
function loginCheck() {
    $.ajax({
        type: "GET",
        mimeType: "multipart/form-data",
        url: hostplace + "/userloginstate",
        data: {},
        contentType: false,
        processData: false,
        cache: false,
        dataType: 'json',
        error: function (e) {
            $(window).off("beforeunload");
            jQalert("操作逾時，將自動登出!", "了解!", function () {
                location.href = hostplace + "/logout";
            });
        },
        success: function (data) {
            if (data.res != "success") {
                $(window).off("beforeunload");
                jQalert("操作逾時，將自動登出!", "了解!", function () {
                    location.href = hostplace + "/logout";
                });
            }
        }
    });
}

// CSRF Token確認
function csrfCheck() {
    let formData = new FormData();
    formData.append("csrf_token", Oddi_csrftoken);

    $.ajax({
        type: "POST",
        mimeType: "multipart/form-data",
        url: hostplace + "/csrftokentest",
        data: formData,
        contentType: false,
        processData: false,
        cache: false,
        dataType: 'json',
        error: function (e) {
            $(window).off("beforeunload");
            jQalert("安全金鑰逾時，將重新整理頁面!", "了解!", function () {
                location.href = location.href;
            });
        },
        success: function (data) {
            if (data.res != "success") {
                $(window).off("beforeunload");
                jQalert("安全金鑰逾時，將重新整理頁面!", "了解!", function () {
                    location.href = location.href;
                });
            }
        }
    });
}
