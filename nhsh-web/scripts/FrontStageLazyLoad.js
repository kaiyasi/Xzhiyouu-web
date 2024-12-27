var ShowingDataToLoad_Container = [];
function LoadingDataUsedBookMarkAnnounce(){
    let LoadingAmount = ShowingDataToLoad_Container[0].attr("data-loadingamount") || '';
    let place_id = ShowingDataToLoad_Container[0].attr("data-place_id") || undefined;
    let orderblockno = ShowingDataToLoad_Container[0].attr("data-orderblockno") || undefined;
    let blockid = ShowingDataToLoad_Container[0].attr("data-blockid") || undefined;
    let categorystate = ShowingDataToLoad_Container[0].attr("data-categorystate");
    let currentblocktype = ShowingDataToLoad_Container[0].parent().parent().attr("data-currentblocktype");
    let currentblockid = ShowingDataToLoad_Container[0].parent().parent().attr("data-currentblockid");
    let specialRequirements;

    try {
        specialRequirements = ShowingDataToLoad_Container[0].attr("data-special-requirements");
    } catch (error) {
        specialRequirements = '';
    }

    if (place_id && orderblockno && blockid) {
        LazyLoadNews(blockid, categorystate, orderblockno, currentblocktype, currentblockid, LoadingAmount,specialRequirements);
        ShowingDataToLoad_Container[0].removeAttr("data-lazyloadcontent");
        ShowingDataToLoad_Container = ShowingDataToLoad_Container.slice(1);
    } else {
        ShowingDataToLoad_Container = ShowingDataToLoad_Container.slice(1);
        LoadingAmount = ShowingDataToLoad_Container[0].attr("data-loadingamount") || '';
        place_id = ShowingDataToLoad_Container[0].attr("data-place_id") || undefined;
        orderblockno = ShowingDataToLoad_Container[0].attr("data-orderblockno") || undefined;
        blockid = ShowingDataToLoad_Container[0].attr("data-blockid") || undefined;
        categorystate = ShowingDataToLoad_Container[0].attr("data-categorystate");
        currentblocktype = ShowingDataToLoad_Container[0].parent().parent().attr("data-currentblocktype");
        currentblockid = ShowingDataToLoad_Container[0].parent().parent().attr("data-currentblockid");
        if (place_id && orderblockno && blockid) {
            LazyLoadNews(blockid, categorystate, orderblockno, currentblocktype, currentblockid, LoadingAmount,specialRequirements);
        }
    }
}

//首頁延遲載入新聞
function LazyLoadNews(NodeId, categorystate, contentId, blocktype, blockId, LoadingAmount,specialRequirements) {
    categorystate = typeof (categorystate) == "undefined" ? "all" : categorystate;
    LoadingAmount = LoadingAmount || '';

    if (!$("[data-loading='{0}']".format(document.getElementById(contentId).querySelector("[data-container]").dataset.category)).length){
        if (ShowingDataToLoad_Container.length){
            setTimeout(LoadingDataUsedBookMarkAnnounce,250);
        }
        return 1;
    }

    $.getJSON(hostplace + subweburl + "/lazyloadnews", {
        LoadingAmount: LoadingAmount,
        NodeId: NodeId,
        categorystate: categorystate,
        blocktype: blocktype,
        blockId: blockId,
        CurrentUsers: "",
        SpecialRequirements: specialRequirements
    }, function (data) {
        if (data.res != "success") {
            console.log(data.msg);
        } else {
            if (ShowingDataToLoad_Container.length){
                setTimeout(LoadingDataUsedBookMarkAnnounce,250);
            }
            if (data.blocktype == "26" || data.blocktype == "62") {
                SetDataAndProduceNewsBlockListContainerElement(data.data, document.getElementById(contentId).querySelector("[data-container]"), 0, data.Category, data.blockId);
            } else if (data.blocktype == "31") {
                SetDataAndProduceNewsBlockListContainerElement(data.data, document.getElementById(contentId).querySelector("[data-container]"), data.FileDetail, data.Category, data.blockId);
            } else {
                console.log("Blocktype is not support yet! please contect system manager to get more info");
            }
        }
    })
        .done(function () { })
        .fail(function (jqXHR, textStatus, errorThrown) { console.log('getJSON request failed! ' + textStatus) });
}

//產生新聞或檔案列表
function SetDataAndProduceNewsBlockListContainerElement(data, container, Showfile, NodeId, containerId) {
    Showfile = Showfile || 0;
    Showfile = Showfile ? 1 : 0;

    let NewsTimeConfig = BoardBlock.Board_Block_Option.NewsTimeConfig || "Y-M-D";
    let NewsDescription = BoardBlock.Board_Block_Option.NewsDescription || "0";
    let containType = container.nodeName;

    for (var i = container.querySelectorAll("[data-loading]").length-1; i > -1; i--) {
        try {
            container.querySelectorAll("[data-loading]")[i].remove();
        } catch (e) {

        }
    }

    if (data.length <= 0) {
        container = $(container);
        switch (containType) {
            case "TBODY":
                // $("[data-loading='{0}']".format(container.dataset.category)).remove();
                let tr = $(document.createElement("tr"));
                tr.attr("data-style-setmid", "");

                let td = $(document.createElement("td"));
                td.attr("colspan", "5");

                let tbspan = $(document.createElement("span"));
                tbspan.html("還沒有公告或檔案唷");

                td.append(tbspan);
                tr.append(td);
                container.append(tr);
                break;
            case "UL":
                // $("[data-loading='{0}']".format(container.dataset.category)).remove();
                let li = $(document.createElement("li"));

                let blankspan = $(document.createElement("span"));
                let ulspan = $(document.createElement("span"));

                let a = $(document.createElement("a"));
                a.html("還沒有公告或檔案唷");

                ulspan.append(a);
                li.append(blankspan, ulspan);
                container.append(li);
                break;
            case "DIV":
                // $("[data-loading='{0}']".format(container.dataset.category)).remove();
                let empty = $(".imgListContent_odd[data-status='empty']")
                    .clone()
                    .removeAttr("data-status");

                container.append(empty);
                break;

            default:
                break;
        }
    } else {

        for (let i = 0; i < data.length; i++) {
            if (container.nodeName == "TBODY") {
                // $("[data-loading='{0}']".format(container.dataset.category)).remove();
                let coverExist = false;

                $.each(data[i]["AllChildren"], function (index, child) {
                    if (child["FileStatus"] == "55") {
                        coverExist = true;
                        return false;
                    }
                });

                // if (coverExist) {
                //     continue;
                // }

                let trContainer = document.createElement("tr");

                if (data[i]["ActivityInfo"].length > 0) {
                    let activityinfo = {
                        "活動時間": data[i]["ActivityInfo"][0],
                        "活動名稱": data[i]["title"],
                        "活動地點": data[i]["ActivityInfo"][3],
                        "活動對象": data[i]["ActivityInfo"][4],
                        "負責處室": data[i]["ActivityInfo"][2],
                        "活動備註": data[i]["summary"]
                    };

                    $.each(activityinfo, function (key, value) {
                        let td = $(document.createElement("td"))
                            .html(value).attr("data-title", key);

                        $(trContainer).append(td);
                    });
                } else {
                    let td_date = document.createElement("td");
                    td_date.setAttribute("data-title", "日期");
                    for (var j = 0; j < data[i]["releaseStatus"].length; i++) {
                        if (data[i]["releaseStatus"][j][3] == "all") {
                            td_date.appendChild(document.createTextNode(data[i]["releaseStatus"][j][4].split(" ")[0]));
                            break;
                        }
                    }
                    trContainer.appendChild(td_date);

                    let td_title = document.createElement("td");
                    td_title.setAttribute("data-title", "主旨");
                    let titleLinkElement = document.createElement("a");
                    titleLinkElement.setAttribute("title", data[i]["title"]);
                    titleLinkElement.setAttribute("href", String.format("{0}{1}/content?a={2}&c={3}&cat={4}", hostplace, subweburl, data[i]["NodeId"], containerId, NodeId));
                    let SetTopLabel = document.createElement("label");

                    if (data[i]["absoultSetTop"][0] >= 1) {
                        SetTopLabel.setAttribute("class", "absolute");
                        titleLinkElement.appendChild(SetTopLabel);
                        titleLinkElement.appendChild(document.createTextNode(nbsp_str));
                    } else if (data[i]["SetTopStatus"]) {
                        SetTopLabel.setAttribute("class", "ontop");
                        titleLinkElement.appendChild(SetTopLabel);
                        titleLinkElement.appendChild(document.createTextNode(nbsp_str));
                    }

                    try {
                        // Filter Label
                        for (let j = 0; j < data[i]["LableTags"].length; j++) {
                            let LabelTagLabel = document.createElement("label");
                            LabelTagLabel.appendChild(document.createTextNode(data[i]["LableTags"][j]));
                            LabelTagLabel.setAttribute("class", "filterLabel");
                            titleLinkElement.appendChild(LabelTagLabel);
                            titleLinkElement.appendChild(document.createTextNode(nbsp_str));
                        }
                    } catch (e) {
                        console.log(e)
                    }

                    titleLinkElement.appendChild(document.createTextNode(data[i]["title"]));
                    td_title.appendChild(titleLinkElement);
                    trContainer.appendChild(td_title);


                    let td_category = document.createElement("td");
                    td_category.setAttribute("data-title", "公告類別");
                    let Category_span = document.createElement("span");

                    if ("CateMethod" in data[i]) {
                        if (data[i]["CateMethod"] == "level") {
                            if (container.dataset.category == "all" || container.dataset.category == "") {
                                Category_span.appendChild(document.createTextNode(data[i]["ParentNode"][1]));
                            } else {
                                Category_span.appendChild(document.createTextNode(container.dataset.category));
                            }
                        } else {
                            // let CategoryTags = new Array;
                            // for (let j = 0; j < data[i]["CategoryTags"].length; j++) {
                            //     CategoryTags.push(data[i]["CategoryTags"][j][4])
                            // }
                            // CategoryTags = CategoryTags.join("、");
                            // Category_span.appendChild(document.createTextNode(CategoryTags));
                            Category_span.appendChild(document.createTextNode(data[i]["CategoryTags"]));
                        }
                    } else {
                        if (container.dataset.category == "all" || container.dataset.category == "") {
                            Category_span.appendChild(document.createTextNode(data[i]["ParentNode"][1]));
                        } else {
                            Category_span.appendChild(document.createTextNode(container.dataset.category));
                        }
                    }
                    td_category.appendChild(Category_span);
                    trContainer.appendChild(td_category);

                    let td_owner = document.createElement("td");
                    td_owner.setAttribute("data-title", "發布單位");
                    let Owner_span = document.createElement("span");
                    Owner_span.appendChild(document.createTextNode(data[i]["owner"]));
                    td_owner.appendChild(Owner_span);
                    trContainer.appendChild(td_owner);

                }

                container.appendChild(trContainer);
            } else if (container.nodeName == "UL") {
                // $("[data-loading='{0}']".format(container.dataset.category)).remove();
                let coverExist = false;

                $.each(data[i]["AllChildren"], function (index, child) {
                    if (child["FileStatus"] == "55") {
                        coverExist = true;
                        return false;
                    }
                });

                // if (coverExist) {
                //     continue;
                // }

                let liContainer = document.createElement("li");

                if (data[i]["ActivityInfo"].length > 0) {
                    let br = $(document.createElement("br"));

                    let label0 = $(document.createElement("label"))
                        .html(moment(data[i]["ActivityInfo"][0]).format("YYYY-MM-DD HH-mm"));

                    let label1 = $(document.createElement("label"))
                        .html(data[i]["title"]);

                    let label2 = $(document.createElement("label"))
                        .html(data[i]["ActivityInfo"][3]);

                    let label3 = $(document.createElement("label"))
                        .html(data[i]["ActivityInfo"][4]);

                    let label4 = $(document.createElement("label"))
                        .html(data[i]["ActivityInfo"][2]);

                    let label5 = $(document.createElement("label"))
                        .html(data[i]["summary"]);

                    $(liContainer).append([label0, label1, label4, label3, label2, br, label5]);

                } else {

                    let DateSpan = document.createElement("span");
                    let Date_DateSpan = document.createElement("span");
                    let Date_MonthYearSpan = document.createElement("span");

                    for (var j = 0; j < data[i]["releaseStatus"].length; j++) {
                        if (data[i]["releaseStatus"][j][3] == "all") {
                            NewsTimeConfig = NewsTimeConfig || "Y-M-D";
                            let DateData = data[i]["releaseStatus"][j][4].split(" ")[0];

                            switch (NewsTimeConfig) {
                                case "YMD":
                                    DateSpan.appendChild(document.createTextNode(DateData.split("-")[0]));
                                    DateSpan.appendChild(document.createTextNode(DateData.split("-")[1]));
                                    DateSpan.appendChild(document.createTextNode(DateData.split("-")[2]));
                                    break;

                                case "DMY":
                                    Date_DateSpan.appendChild(document.createTextNode(DateData.split("-")[2]));
                                    Date_MonthYearSpan.appendChild(document.createTextNode(DateData.split("-")[1] + "," + nbsp_str + DateData.split("-")[0]));

                                    DateSpan.appendChild(Date_DateSpan);
                                    DateSpan.appendChild(Date_MonthYearSpan);
                                    break;


                                case "Y-M-D":
                                default:
                                    DateSpan.appendChild(document.createTextNode(DateData));
                                    break;
                            }

                            break;
                        }
                    }

                    DateSpan.appendChild(Date_DateSpan);
                    DateSpan.appendChild(Date_MonthYearSpan);
                    liContainer.appendChild(DateSpan);

                    let titleLinkElement = document.createElement("a");
                    titleLinkElement.href = String.format("{0}{1}/content?a={2}&c={3}&cat={4}", hostplace, subweburl, data[i]["NodeId"], containerId, NodeId);

                    let SetTopLabel = document.createElement("label");

                    if (data[i]["absoultSetTop"][0] >= 1) {
                        SetTopLabel.setAttribute("class", "absolute");
                        titleLinkElement.appendChild(SetTopLabel);
                    } else if (data[i]["SetTopStatus"]) {
                        SetTopLabel.setAttribute("class", "ontop");
                        titleLinkElement.appendChild(SetTopLabel);
                    }

                    try {
                        // Filter Label
                        for (let j = 0; j < data[i]["LableTags"].length; j++) {
                            let LabelTagLabel = document.createElement("label");
                            LabelTagLabel.appendChild(document.createTextNode(data[i]["LableTags"][j]));
                            LabelTagLabel.setAttribute("class", "filterLabel");
                            titleLinkElement.appendChild(LabelTagLabel);
                            titleLinkElement.appendChild(document.createTextNode(nbsp_str));
                        }
                    } catch (e) {
                        console.log(e)
                    }

                    titleLinkElement.appendChild(document.createTextNode(data[i]["title"]));
                    let Title_span = document.createElement("span");
                    Title_span.appendChild(titleLinkElement);

                    liContainer.appendChild(Title_span);

                    // editing

                    /* let Public_span = document.createElement("span");
                    $(Public_span).html(data[i]["owner"]);
                    liContainer.appendChild(Public_span); */

                    try {
                        NewsDescription = parseInt(NewsDescription)
                    } catch (e) {

                    }

                    NewsDescription = NewsDescription || 0;

                    if (NewsDescription) {
                        let description_span = document.createElement("span");
                        description_span.className = "textListContentDescription_odd"
                        description_span.innerHTML = data[i].summary.replace(/<[^>]*>/g, "");
                        liContainer.appendChild(description_span);
                    }

                    if (Showfile) {
                        //檔案預覽列表
                        FileUlContainer = document.createElement("ul");

                        for (var j = 0; j < data[i]["Files"].length; j++) {
                            let FileLiDataContainer = document.createElement("li");

                            let FileTitleTagA = document.createElement("a");
                            FileTitleTagA.setAttribute("title", data[i]["Files"][j][0]);
                            FileTitleTagA.appendChild(document.createTextNode(data[i]["Files"][j][0]));
                            FileLiDataContainer.appendChild(FileTitleTagA);

                            let FilePreviewTagA = document.createElement("a");
                            FilePreviewTagA.setAttribute("class", "preview_btn");
                            FilePreviewTagA.setAttribute("target", "_blank");
                            FilePreviewTagA.setAttribute("href", "{0}/pdfpreviewer?a={1}".format(hostplace, data[i]["Files"][j][6]));
                            FilePreviewTagA.setAttribute("title", FrontStageFileAct["preview"] + data[i]["Files"][j][0]);
                            FilePreviewTagA.appendChild(document.createTextNode(FrontStageFileAct["preview"]));
                            FileLiDataContainer.appendChild(FilePreviewTagA);

                            let FileDownloadTagA = document.createElement("a");
                            FileDownloadTagA.setAttribute("class", "download_btn");
                            FileDownloadTagA.setAttribute("href", hostplace + data[i]["Files"][j][1] + data[i]["Files"][j][2]);
                            FileDownloadTagA.setAttribute("title", data[i]["Files"][j][4]);
                            FileDownloadTagA.appendChild(document.createTextNode(FrontStageFileAct["download"]));
                            FileLiDataContainer.appendChild(FileDownloadTagA);

                            FileUlContainer.appendChild(FileLiDataContainer);
                        }

                        liContainer.appendChild(FileUlContainer);
                    }

                    // let Category_span = document.createElement("span");
                    // if (container.dataset.category == "all" || container.dataset.category == ""){
                    //     Category_span.appendChild(document.createTextNode(data[i]["ParentNode"][1]));
                    // }else{
                    //     Category_span.appendChild(document.createTextNode(container.dataset.category));
                    // }
                    // liContainer.appendChild(Category_span);
                    //
                    // let owner_span = document.createElement("span");
                    // owner_span.appendChild(document.createTextNode(data[i]["owner"]));
                    // liContainer.appendChild(owner_span);
                }
                container.appendChild(liContainer);
            } else if (container.nodeName == "DIV") {

                if (typeof(container.dataset.slickBlock) != 'undefined'){
                    // $("[data-loading='{0}']".format(container.dataset.category)).remove();
                    let style = $(container).parents(".imgList_odd").attr("data-style");

                    let loadnoimg = $(container).parents(".imgList_odd").attr("data-loadnoimg") == "1" ? true : false;
                    let itemId = data[i]["NodeId"];
                    let itemTitle = data[i]["title"];
                    let itemSummary = data[i]["summary"];
                    let itemPath = "{0}{1}/content?a={2}&c={3}&cat={4}".format('', '', data[i]["NodeId"], containerId, NodeId);
                    let itemTime, coverPath, coverAlt, coverExist = false;

                    $.each(data[i]["AllChildren"], function (index, child) {
                        if (child["FileStatus"] == "55") {
                            coverPath = hostplace + child["FilePath"] + child["FileName"];
                            coverAlt = child["summary"];
                            coverExist = true;
                            return false;
                        }
                    });

                    if (loadnoimg || coverExist) {
                        $.each(data[i]["releaseStatus"], function (index, releaseStatus) {
                            if (releaseStatus[3] == "all") {
                                itemTime = releaseStatus[4];
                            }
                        });

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
                            "href": hostplace + subweburl + itemPath
                        });

                        albumTitle.html(itemTitle);

                        let temp = $(document.createElement("div"));
                        temp.html(itemSummary);
                        description.text(temp.text());
                        temp.remove();

                        switch (style) {
                            case "1":
                            case "2":
                            case "4":
                                createTime.html(itemTime);
                                break;
                            case "3":
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

                        $(container).append(clone);
                    }
                } else {
                    // $("[data-loading='{0}']".format(container.dataset.category)).remove();
                    let style = $(container).parents(".imgList_odd").attr("data-style");

                    let loadnoimg = $(container).parents(".imgList_odd").attr("data-loadnoimg") == "1" ? true : false;
                    let itemId = data[i]["NodeId"];
                    let itemTitle = data[i]["title"];
                    let itemSummary = data[i]["summary"];
                    let itemPath = "{0}{1}/content?a={2}&c={3}&cat={4}".format('', '', data[i]["NodeId"], containerId, NodeId);
                    let itemTime, coverPath, coverAlt, coverExist = false;

                    $.each(data[i]["AllChildren"], function (index, child) {
                        if (child["FileStatus"] == "55") {
                            coverPath = hostplace + child["FilePath"] + child["FileName"];
                            coverAlt = child["summary"];
                            coverExist = true;
                            return false;
                        }
                    });

                    if (loadnoimg || coverExist) {
                        $.each(data[i]["releaseStatus"], function (index, releaseStatus) {
                            if (releaseStatus[3] == "all") {
                                itemTime = releaseStatus[4];
                            }
                        });

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
                            "href": hostplace + subweburl + itemPath
                        });

                        albumTitle.html(itemTitle);

                        let temp = $(document.createElement("div"));
                        temp.html(itemSummary);
                        description.text(temp.text());
                        temp.remove();

                        switch (style) {
                            case "1":
                            case "2":
                            case "4":
                                createTime.html(itemTime);
                                break;
                            case "3":
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

                        $(container).append(clone);
                    }
                }
            }
        }
    }
}

//----------------------------------------------------------------------------------------
function ContentPageListLazyLoad(){
    var dataForm = new FormData();

    dataForm.append("csrf_token", Oddi_csrftoken);
    dataForm.append("dataCondition", articleslistCondition);

    $.ajax({
        type: "POST",
        mimeType: "multipart/form-data",
        url: hostplace + subweburl +  "/contentlistpagegetlist",
        data: dataForm,
        contentType: false,
        processData: false,
        cache: false,
        dataType: 'json',
        success: function (data) {
            if (data.res == "success") {
                let dataContainerTag = $("[data-loading='ListPage']")[0].parentNode;

                if (data.data.length){
                    for (item in data.data){
                        item = data.data[item]
                        // console.log(item);
                        if (CategoryCoverListSW){//封面式
                            switch (CurrentPageNodeType) {
                                case '47'://檔案庫列表
                                    //pass
                                    break;

                                case '61'://活動列表
                                    //pass
                                    break;

                                case '10'://新聞列表
                                    let divContainerTag = document.createElement("div");
                                    divContainerTag.className = 'imgListContent_odd';

                                    let aTag = document.createElement("a");
                                    aTag.href = hostplace + "/content?=" + item['NodeId'];
                                    aTag.title = item['title'];

                                    if (dataC){
                                        aTag.href += "&c=" + dataC;
                                    }

                                    if (dataCat){
                                        aTag.href += "&cat=" + dataCat;
                                    }

                                    CoverPath = '/oddi_src/img/temp.png';

                                    for (var i = 0; i < item['Files'].length; i++) {
                                        if (item['Files'][i][5] == '55'){
                                            CoverPath = hostplace + item['Files'][i][1] + item['Files'][i][2]
                                            break;
                                        }
                                    }

                                    switch (ImgDataShowerType) {
                                        case '0':
                                            imgTag = document.createElement("img");
                                            imgTag.src = '/oddi_src/img/temp.png';
                                            imgTag.dataset.src = CoverPath;
                                            imgTag.alt = item['title'] + '封面圖片';
                                            imgTag.style = 'filter: brightness(80%); transition: all 200ms linear 0s;';
                                            aTag.appendChild(imgTag);

                                            lableTag = document.createElement("lable");
                                            lableTag.appendChild(document.createTextNode(item['title']));
                                            aTag.appendChild(lableTag);
                                            divContainerTag.appendChild(aTag);
                                            break;
                                        default:
                                            divTag = document.createElement("div");
                                            divTag.className = 'img';
                                            divTag.style = 'filter: brightness(80%); transition: all 200ms linear 0s;';
                                            imgTag = document.createElement("img");
                                            imgTag.src = '/oddi_src/img/temp.png';
                                            imgTag.dataset.src = CoverPath;
                                            imgTag.alt = item['title'] + '封面圖片';
                                            divTag.appendChild(imgTag);
                                            divContainerTag.appendChild(divTag);

                                            aTag.appendChild(document.createTextNode(item['title']));

                                            divTag = document.createElement("div");
                                            divTag.className = 'text';
                                            divTag.appendChild(aTag);
                                            divContainerTag.appendChild(divTag);

                                    }

                                    dataContainerTag.appendChild(divContainerTag);
                                    break;
                                default:
                                    console.log('CurrentPageNodeType is not supported! {0}'.format(CurrentPageNodeType));
                                    // jQalert('本頁面目前無法正常顯示列表內容，請聯絡網站管理員協助處理');
                                    return 0;
                            }
                        } else {
                            switch (DataListStyleType) {
                                case '1'://清單式

                                    liContainerTag = document.createElement("li");

                                    switch (CurrentPageNodeType) {
                                        case '47'://檔案庫列表

                                            spanContainerTag = document.createElement('span');
                                            spanTag = document.createElement('span');
                                            for (var i = 0; i < item['releaseStatus'].length; i++) {
                                                if (item['releaseStatus'][i][3] == 'all'){
                                                    spanTag.appendChild(document.createTextNode(item['releaseStatus'][i][4].split(' ')[0]))
                                                    break;
                                                }
                                            }
                                            spanContainerTag.appendChild(spanTag);
                                            liContainerTag.appendChild(spanContainerTag);

                                            spanTag = document.createElement('span');

                                            aTag = document.createElement('a');
                                            aTag.title = item['title'];
                                            aTag.href = hostplace + '/content?a=' + item['NodeId'];
                                            aTag.appendChild(document.createTextNode(item['title']));
                                            aTag.href += item['NodeId']

                                            if (dataC){
                                                aTag.href += "&c=" + dataC;
                                            }

                                            if (dataCat){
                                                aTag.href += "&cat=" + dataCat;
                                            }
                                            spanTag.appendChild(aTag);

                                            ulTag = document.createElement('ul');
                                            ulTag.dataset.liststyleNone = '';

                                            for (var i = 0; i < item['AllChildren'].length; i++) {
                                                liTag = document.createElement('li');

                                                aTag = document.createElement('a');
                                                aTag.title = item['AllChildren'][i]['summary']
                                                aTag.appendChild(document.createTextNode(item['AllChildren'][i]['title']))
                                                liTag.appendChild(aTag);

                                                aTag = document.createElement('a');
                                                aTag.className = 'preview_btn';
                                                aTag.href = hostplace + '/pdfpreviewer?a=' + item['AllChildren'][i]['NodeId']
                                                aTag.target='_blank';
                                                aTag.title = '預覽' + item['AllChildren'][i]['title'];
                                                aTag.appendChild(document.createTextNode('預覽'));
                                                liTag.appendChild(aTag);

                                                aTag = document.createElement('a');
                                                aTag.className = 'download_btn';
                                                aTag.href = hostplace + item['AllChildren'][i]['FilePath'] + item['AllChildren'][i]['FileName'];
                                                aTag.download = item['AllChildren'][i]['title'];
                                                aTag.title = '下載' + item['AllChildren'][i]['title'];
                                                aTag.appendChild(document.createTextNode('下載'));
                                                liTag.appendChild(aTag);

                                                ulTag.appendChild(liTag);
                                            }

                                            spanTag.appendChild(ulTag);
                                            liContainerTag.appendChild(spanTag);

                                            break;

                                        case '61'://活動列表

                                            spanContainerTag = document.createElement('span');
                                            spanTag = document.createElement('span');
                                            spanTag.appendChild(document.createTextNode(item['ActivityInfo'][0].split(' ')[0]))
                                            spanContainerTag.appendChild(spanTag);
                                            liContainerTag.appendChild(spanContainerTag);

                                            spanTag = document.createElement('span');
                                            aTag = document.createElement('a');
                                            aTag.title = item["title"];
                                            aTag.appendChild(document.createTextNode(item['title']));
                                            aTag.href = hostplace + '/content?a=' + item['NodeId'];

                                            if (dataC){
                                                aTag.href += "&c=" + dataC;
                                            }

                                            if (dataCat){
                                                aTag.href += "&cat=" + dataCat;
                                            }

                                            spanTag.appendChild(aTag);
                                            liContainerTag.appendChild(spanTag);

                                            break;

                                        case '10'://新聞列表

                                            spanContainerTag = document.createElement('span');
                                            spanTag = document.createElement('span');
                                            for (var i = 0; i < item['releaseStatus'].length; i++) {
                                                if (item['releaseStatus'][i][3] == 'all'){
                                                    spanTag.appendChild(document.createTextNode(item['releaseStatus'][i][4].split(' ')[0]))
                                                    break;
                                                }
                                            }
                                            spanContainerTag.appendChild(spanTag);
                                            liContainerTag.appendChild(spanContainerTag);

                                            spanTag = document.createElement('span');

                                            aTag = document.createElement('a');
                                            aTag.title = item['title'];
                                            aTag.href = hostplace + '/content?a=' + item['NodeId'];

                                            labelTag = document.createElement('label');

                                            if (item['absoultSetTop'].length){
                                                if (item['absoultSetTop'][0]){
                                                    labelTag.className = 'absolute';
                                                }
                                            }

                                            if (!labelTag.className){
                                                if (item['SetTop'][0] < moment().format('YYYY-MM-DD HH:mm:ss') && moment().format('YYYY-MM-DD HH:mm:ss') < item['SetTop'][1]){
                                                    labelTag.className = 'ontop';
                                                }
                                            }

                                            if (labelTag.className){
                                                aTag.appendChild(labelTag);
                                            }

                                            for (var i = 0; i < item['LableTags'].length; i++) {
                                                labelTag = document.createElement('label');
                                                labelTag.className = 'filterLabel'
                                                labelTag.appendChild(document.createTextNode(item['LableTags'][i]))
                                                aTag.appendChild(labelTag);
                                            }

                                            aTag.appendChild(document.createTextNode(item['title']));
                                            aTag.href += item['NodeId']

                                            if (dataC){
                                                aTag.href += "&c=" + dataC;
                                            }

                                            if (dataCat){
                                                aTag.href += "&cat=" + dataCat;
                                            }
                                            spanTag.appendChild(aTag);
                                            liContainerTag.appendChild(spanTag);

                                            break;
                                        default:
                                            console.log('CurrentPageNodeType is not supported! {0}'.format(CurrentPageNodeType));
                                            // jQalert('本頁面目前無法正常顯示列表內容，請聯絡網站管理員協助處理');
                                            return 0;
                                    }
                                    dataContainerTag.appendChild(liContainerTag);

                                    break;
                                case '2'://表格式

                                    trTag = document.createElement('tr');

                                    switch (CurrentPageNodeType) {
                                        case '47'://檔案庫列表

                                            tdTag = document.createElement('td');
                                            tdTag.headers = 'all d';
                                            spanTag = document.createElement('span');
                                            for (var i = 0; i < item['releaseStatus'].length; i++) {
                                                if (item['releaseStatus'][i][3] == 'all'){
                                                    spanTag.appendChild(document.createTextNode(item['releaseStatus'][i][4].split(' ')[0]))
                                                    break;
                                                }
                                            }
                                            tdTag.appendChild(spanTag);
                                            trTag.appendChild(tdTag);

                                            tdTag = document.createElement('td');
                                            tdTag.headers = 'all s';
                                            spanTag = document.createElement('span');

                                            aTag = document.createElement('a');
                                            aTag.title = item['title'];
                                            aTag.href = hostplace + '/content?a=' + item['NodeId'];
                                            aTag.appendChild(document.createTextNode(item['title']));
                                            aTag.href += item['NodeId']

                                            if (dataC){
                                                aTag.href += "&c=" + dataC;
                                            }

                                            if (dataCat){
                                                aTag.href += "&cat=" + dataCat;
                                            }
                                            spanTag.appendChild(aTag);

                                            ulTag = document.createElement('ul');
                                            ulTag.dataset.liststyleNone = '';

                                            for (var i = 0; i < item['AllChildren'].length; i++) {
                                                liTag = document.createElement('li');

                                                aTag = document.createElement('a');
                                                aTag.title = item['AllChildren'][i]['summary']
                                                aTag.appendChild(document.createTextNode(item['AllChildren'][i]['title']))
                                                liTag.appendChild(aTag);

                                                aTag = document.createElement('a');
                                                aTag.className = 'preview_btn';
                                                aTag.href = hostplace + '/pdfpreviewer?a=' + item['AllChildren'][i]['NodeId']
                                                aTag.target='_blank';
                                                aTag.title = '預覽' + item['AllChildren'][i]['title'];
                                                aTag.appendChild(document.createTextNode('預覽'));
                                                liTag.appendChild(aTag);

                                                aTag = document.createElement('a');
                                                aTag.className = 'download_btn';
                                                aTag.href = hostplace + item['AllChildren'][i]['FilePath'] + item['AllChildren'][i]['FileName'];
                                                aTag.download = item['AllChildren'][i]['title'];
                                                aTag.title = '下載' + item['AllChildren'][i]['title'];
                                                aTag.appendChild(document.createTextNode('下載'));
                                                liTag.appendChild(aTag);

                                                ulTag.appendChild(liTag);
                                            }

                                            spanTag.appendChild(ulTag);
                                            tdTag.appendChild(spanTag);
                                            trTag.appendChild(tdTag);

                                            tdTag = document.createElement('td');
                                            tdTag.headers = 'all r';
                                            spanTag = document.createElement('span');
                                            spanTag.appendChild(document.createTextNode(item['owner']));
                                            tdTag.appendChild(spanTag);
                                            trTag.appendChild(tdTag);

                                            break;

                                        case '61'://活動列表

                                            tdTag = document.createElement('td');
                                            tdTag.headers = 'all a';
                                            tdTag.appendChild(document.createTextNode(item['ActivityInfo'][0]));
                                            trTag.appendChild(tdTag);

                                            tdTag = document.createElement('td');
                                            tdTag.headers = 'all b';
                                            tdTag.innerHTML = item['title'];
                                            trTag.appendChild(tdTag);

                                            tdTag = document.createElement('td');
                                            tdTag.headers = 'all c';
                                            tdTag.appendChild(document.createTextNode(item['ActivityInfo'][3]));
                                            trTag.appendChild(tdTag);

                                            tdTag = document.createElement('td');
                                            tdTag.headers = 'all d';
                                            tdTag.appendChild(document.createTextNode(item['ActivityInfo'][4]));
                                            trTag.appendChild(tdTag);

                                            tdTag = document.createElement('td');
                                            tdTag.headers = 'all e';
                                            tdTag.appendChild(document.createTextNode(item['ActivityInfo'][2]));
                                            trTag.appendChild(tdTag);

                                            tdTag = document.createElement('td');
                                            tdTag.headers = 'all f';
                                            tdTag.innerHTML = item['summary'];
                                            trTag.appendChild(tdTag);

                                            break;

                                        case '10'://新聞列表

                                            tdTag = document.createElement('td');
                                            tdTag.headers = 'all d';
                                            spanTag = document.createElement('span');
                                            for (var i = 0; i < item['releaseStatus'].length; i++) {
                                                if (item['releaseStatus'][i][3] == 'all'){
                                                    spanTag.appendChild(document.createTextNode(item['releaseStatus'][i][4].split(' ')[0]))
                                                    break;
                                                }
                                            }
                                            tdTag.appendChild(spanTag);
                                            trTag.appendChild(tdTag);

                                            tdTag = document.createElement('td');
                                            tdTag.headers = 'all s';
                                            spanTag = document.createElement('span');

                                            aTag = document.createElement('a');
                                            aTag.title = item['title'];
                                            aTag.href = hostplace + '/content?a=' + item['NodeId'];

                                            labelTag = document.createElement('label');

                                            if (item['absoultSetTop'].length){
                                                if (item['absoultSetTop'][0]){
                                                    labelTag.className = 'absolute';
                                                }
                                            }

                                            if (!labelTag.className){
                                                if (item['SetTop'][0] < moment().format('YYYY-MM-DD HH:mm:ss') && moment().format('YYYY-MM-DD HH:mm:ss') < item['SetTop'][1]){
                                                    labelTag.className = 'ontop';
                                                }
                                            }

                                            if (labelTag.className){
                                                aTag.appendChild(labelTag);
                                            }

                                            for (var i = 0; i < item['LableTags'].length; i++) {
                                                labelTag = document.createElement('label');
                                                labelTag.className = 'filterLabel'
                                                labelTag.appendChild(document.createTextNode(item['LableTags'][i]))
                                                aTag.appendChild(labelTag);
                                            }

                                            aTag.appendChild(document.createTextNode(item['title']));
                                            aTag.href += item['NodeId']

                                            if (dataC){
                                                aTag.href += "&c=" + dataC;
                                            }

                                            if (dataCat){
                                                aTag.href += "&cat=" + dataCat;
                                            }
                                            spanTag.appendChild(aTag);
                                            tdTag.appendChild(spanTag);
                                            trTag.appendChild(tdTag);

                                            tdTag = document.createElement('td');
                                            tdTag.headers = 'all r';
                                            spanTag = document.createElement('span');
                                            spanTag.appendChild(document.createTextNode(item['owner']));
                                            tdTag.appendChild(spanTag);
                                            trTag.appendChild(tdTag);

                                            break;

                                        default:
                                            console.log('CurrentPageNodeType is not supported! {0}'.format(CurrentPageNodeType));
                                            // jQalert('本頁面目前無法正常顯示列表內容，請聯絡網站管理員協助處理');
                                            return 0;
                                    }
                                    dataContainerTag.appendChild(trTag);

                                    break;
                                default:

                            }
                        }
                    }
                } else { //沒有內容的部分
                    if (CategoryCoverListSW){//封面式
                        let divContainerTag = document.createElement("div");
                        divContainerTag.className = 'imgListContent_odd';

                        let aTag = document.createElement("a");
                        aTag.href = "javascript:void(0);"
                        aTag.title = LangPack_NoContentMsg['title'];

                        switch (ImgDataShowerType) {
                            case '0':
                                imgTag = document.createElement("img");
                                imgTag.src = '/oddi_src/img/temp.png';
                                imgTag.alt = LangPack_NoContentMsg['title'] + '圖示';
                                aTag.appendChild(imgTag);

                                lableTag = document.createElement("lable");
                                lableTag.appendChild(document.createTextNode(LangPack_NoContentMsg['text']))
                                aTag.appendChild(lableTag);
                                divContainerTag.appendChild(aTag);
                                break;
                            default:
                                divTag = document.createElement("div");
                                divTag.className = 'img';
                                imgTag = document.createElement("img");
                                imgTag.src = '/oddi_src/img/temp.png';
                                imgTag.alt = LangPack_NoContentMsg['title'] + '圖示';
                                divTag.appendChild(imgTag);
                                divContainerTag.appendChild(divTag);

                                aTag.appendChild(document.createTextNode(LangPack_NoContentMsg['text']));

                                divTag = document.createElement("div");
                                divTag.className = 'text';
                                divTag.appendChild(aTag);
                                divContainerTag.appendChild(divTag);

                        }

                        dataContainerTag.appendChild(divContainerTag);

                    } else {
                        switch (DataListStyleType) {
                            case '1'://清單式
                                let liTag = document.createElement("li");

                                let spanTag = document.createElement("span");
                                liTag.appendChild(spanTag);

                                spanTag = document.createElement("span");
                                let aTag = document.createElement("a");
                                aTag.appendChild(document.createTextNode(LangPack_NoContentMsg['text']));
                                spanTag.appendChild(aTag);
                                liTag.appendChild(spanTag);

                                dataContainerTag.appendChild(liTag);
                                break;
                            case '2'://表格式
                                let trTag = document.createElement("tr");

                                let tdTag = document.createElement("td");
                                tdTag.headers = 'all a b c d e f s r';
                                tdTag.dataset.m = '';
                                tdTag.appendChild(document.createTextNode(LangPack_NoContentMsg['text']));
                                trTag.appendChild(tdTag);

                                if (CurrentPageNodeType == '61'){
                                    tdTag.setAttribute('colspan','5');
                                } else {
                                    tdTag.setAttribute('colspan','2');
                                }

                                dataContainerTag.appendChild(trTag);

                                break;
                            default:

                        }
                    }
                }

                $("[data-loading='ListPage']").remove();

            } else if (data.res = "fail") {
                jQalert(data.msg);
            }
        },
        error: function () {
            jQalert(Oddi_Msg_Error_TryLater);
        }
    });
}
