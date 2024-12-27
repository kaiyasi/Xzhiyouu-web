// 刪除物件以及快速刪除
// 依賴於jqAlert
$(window).on({
    "keydown": function (event) {
        shiftKey = event.keyCode == 16 ? true : false;
    },
    "keyup": function () {
        shiftKey = false;
    }
});

function objectDelete(delFunc) {
    if (!shiftKey) {
        jConfirm("確定要刪除嗎?<br />(按住shift可以略過詢問視窗，快速刪除。)", undefined, undefined, delFunc);
    } else {
        delFunc();
    }
}