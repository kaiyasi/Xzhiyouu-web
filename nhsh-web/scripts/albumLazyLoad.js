function sortStart() {
    let albumObject = $(".imgListBlock_odd").length > 0 ? $(".imgListBlock_odd") :
        $(".media_odd").length > 0 ? $(".media_odd") : false;

    let ul = $(document.createElement("ul"));
    ul.attr({
        "class": "temp"
    });
    ul.sortable().disableSelection();

    $("#ContentToolsEditArea").css("overflow", "visible");

    $.each(albumObject.children(), function (index, item) {
        let li = $(document.createElement("li"));

        li.attr({
            "style": "cursor:grab;{0}".format($(item).attr("style"))
        }).css({
            "top": 0,
            "left": 0,
            "position": "relative",
            "display": "inline-block",
            "float": "left",
            "margin": "5px"
        }).on({
            "mousedown": function () {
                $(this).css("cursor", "grabbing;");
            },
            "mouseup": function () {
                $(this).css("cursor", "grab;");
            }
        });

        li.append(item);
        ul.append(li);
    });

    albumObject.append(ul);
}

function sortEnd() {
    let ul = $(".temp");
    let li = $(".temp>li");
    let albumObject = $(".imgListBlock_odd").length > 0 ? $(".imgListBlock_odd") :
        $(".media_odd").length > 0 ? $(".media_odd") : false;

    $.each(li, function (index, item) {
        let obj = $(item).children();
        let nodeId = $(obj).attr("data-id");
        let label = $(document.createElement("label"));
        label.attr({
            "data-id": nodeId,
            "data-hidden": ""
        });

        albumObject.append(label);
    });

    ul.remove();
    $("#ContentToolsEditArea").css("overflow", "hidden");
}

function loadImgList(NodeId) {
    let formData = new FormData();
    formData.append("dataid", NodeId);
    formData.append("csrf_token", Oddi_csrftoken);
    $.ajax({
        type: "POST",
        url: hostplace + subweburl + "/gettingnodechildren",
        mimeType: "multipart/form-data",
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
                let promise = new Promise(function (resolve, reject) {
                    try {
                        let albumObject = $(".imgListBlock_odd").length > 0 ? "list" :
                            $(".media_odd").length > 0 ? "album" : false;
                        let refData = [];
                        data = data.data.reverse();

                        if (data.length == 0) {
                            $("#albumSample").remove();
                        } else {
                            switch (albumObject) {
                                case "album":
                                    $.each(data, function (index, item) {
                                        if (item[1] == "57" || item[1] == "58") {
                                            return;
                                        }
                                        if (item[2]) {
                                            refData.push(item);
                                            return;
                                        }
                                        let itemId = item[0];
                                        let div = $(document.createElement("div"));
                                        div.attr({
                                            "data-id": itemId
                                        });

                                        let imgPath = item[5].indexOf("image") >= 0 ?
                                            hostplace + item[5] + item[4] :
                                            "/oddi_src/img/temp.png";

                                        let img = $(document.createElement("img"))
                                            .attr({
                                                "onclick": "PicZoom.carousel('.gallery', this);",
                                                "alt": item[7],
                                                "src": imgPath
                                            });

                                        div.append(img);

                                        if ($("label[data-id='{0}']".format(itemId)).length > 0) {
                                            $("label[data-id='{0}']".format(itemId)).after(div);
                                            $("label[data-id='{0}']".format(itemId)).remove();
                                        } else {
                                            $(".media_odd").prepend(div);
                                        }
                                    });

                                    $.each(refData, function (index, item) {
                                        src = $("img[src*='{0}']".format(item[2])).attr("src");
                                        $("img[src*='{0}']".format(item[2])).attr({
                                            "src": hostplace + "/" + item[5] + item[4],
                                            "data-zoom": src
                                        })
                                    });
                                    break;

                                case "list":
                                    if (data.length > 0) {
                                        $.each(data, function (index, item) {
                                            if (item[2]) { return; }
                                            item[11] = item[11] || ['', '', '', '', '', ''];
                                            item[11] = item[11].length == 0 ?
                                                ['', '', '', '', '', ''] :
                                                item[11];

                                            let style = $(".imgList_odd").attr("data-style");

                                            let itemId = item[0];
                                            let itemTitle = item[3];
                                            let itemSummary = item[7];
                                            let itemPath = item[10];
                                            let coverAlt = item[11][3];
                                            let itemTime = item[12];
                                            let coverPath = "/oddi_src/img/temp.png";
                                            try {
                                                if (item[11][7].indexOf('iframe') != -1) {
                                                    let tempContainer = document.createElement('div');
                                                    tempContainer.innerHTML = item[11][7]
                                                    coverPath = 'https://img.youtube.com/vi/{0}/0.jpg'.format(tempContainer.children[0].src.split('/')[tempContainer.children[0].src.split('/').length - 1])
                                                } else {
                                                    coverPath = item[11][5].indexOf('image') ?
                                                        hostplace + item[11][5] + item[11][4] :
                                                        "/oddi_src/img/temp.png";
                                                }
                                            } catch (e) {
                                                console.log(e);
                                            }

                                            let clone = $(".imgListContent_odd[data-status='filled']").clone();

                                            let albumImg = clone.find("[data-item='albumImg']");
                                            let hyperLink = clone.find("[data-item*='hyperLink']");
                                            let albumTitle = clone.find("[data-item*='albumTitle']");
                                            let createTime = clone.find("[data-item*='createTime']");
                                            let description = clone.find("[data-item='description']");

                                            clone.attr({
                                                "data-id": itemId
                                            });

                                            albumImg.attr({
                                                "src": coverPath,
                                                "alt": coverAlt
                                            });

                                            hyperLink.attr({
                                                "title": itemTitle,
                                                "href": hostplace + subweburl + "/multimedia?a={0}".format(itemPath)
                                            });

                                            albumTitle.html(itemTitle);
                                            description.html(itemSummary);
                                            description.html(description.text());

                                            switch (style) {
                                                case 1:
                                                    createTime.html(itemTime);
                                                    break;
                                                case 2:
                                                    createTime.html(itemTime);
                                                    break;
                                                case 3:
                                                    itemTime = itemTime.split(" ");
                                                    itemTime[1] = itemTime[1].split(":");
                                                    itemTime[1] = "{0}:{1}".format(itemTime[1][0], itemTime[1][1]);
                                                    itemTime = "{0} {1}".format(itemTime[0], itemTime[1]);
                                                    createTime.html(itemTime);
                                                    break;
                                                default:
                                                    break;
                                            }

                                            clone.removeAttr("data-status")
                                                .find("*")
                                                .removeAttr('data-item');

                                            if ($("label[data-id='{0}']".format(itemId)).length > 0) {
                                                $("label[data-id='{0}']".format(itemId)).after(clone);
                                                $("label[data-id='{0}']".format(itemId)).remove();
                                            } else {
                                                $(".imgListBlock_odd").prepend(clone);
                                            }
                                        });

                                        $("#albumSample").remove();
                                        $("label[data-id]").remove();
                                    } else {
                                        let empty = $(".imgListContent_odd[data-status='empty']").removeAttr("data-status");
                                        target.append(empty);

                                        $("#albumSample").remove();
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }

                        return resolve();

                    } catch (e) {
                        return reject(e);
                    }
                }).then(function () {
                    galleryActive();

                }).catch(function (e) {

                }).finally(function () {
                    console.log("Promise Over!");
                });
            }
        }
    });

}
