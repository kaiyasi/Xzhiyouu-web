//解析影片url用之函數
function getvideocode(url, type, alt, title) {
    type = type || "";
    alt = alt || "";
    title = title || "";
    /*
    This function is get from summernote src="http://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.6/summernote.js".
    From line7119 to line7209.
    Summernote distributed is under the MIT license.
    From http://summernote.org/
    @modify by chunlin @20171226,20200514
    attention! this function need to include JS String format plugin.
    type:
    1:only iframe part
    2:with div part(but need another css part to change size on template with RWD)
    */
    //video url patterns(youtube, instagram, vimeo, dailymotion, youku, mp4, ogg, webm)
    var ytRegExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    var ytMatch = url.match(ytRegExp);

    var ytliRegExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    var ytliMatch = url.match(ytliRegExp);

    var igRegExp = /(?:www\.|\/\/)instagram\.com\/p\/(.[a-zA-Z0-9_-]*)/;
    var igMatch = url.match(igRegExp);

    var vRegExp = /\/\/vine\.co\/v\/([a-zA-Z0-9]+)/;
    var vMatch = url.match(vRegExp);

    var vimRegExp = /\/\/(player\.)?vimeo\.com\/([a-z]*\/)*(\d+)[?]?.*/;
    var vimMatch = url.match(vimRegExp);

    var dmRegExp = /.+dailymotion.com\/(video|hub)\/([^_]+)[^#]*(#video=([^_&]+))?/;
    var dmMatch = url.match(dmRegExp);

    var youkuRegExp = /\/\/v\.youku\.com\/v_show\/id_(\w+)=*\.html/;
    var youkuMatch = url.match(youkuRegExp);

    var qqRegExp = /\/\/v\.qq\.com.*?vid=(.+)/;
    var qqMatch = url.match(qqRegExp);

    var qqRegExp2 = /\/\/v\.qq\.com\/x?\/?(page|cover).*?\/([^\/]+)\.html\??.*/;
    var qqMatch2 = url.match(qqRegExp2);

    var mp4RegExp = /^.+.(mp4|m4v)$/;
    var mp4Match = url.match(mp4RegExp);

    var oggRegExp = /^.+.(ogg|ogv)$/;
    var oggMatch = url.match(oggRegExp);

    var webmRegExp = /^.+.(webm)$/;
    var webmMatch = url.match(webmRegExp);

    var videocode = "{0}{1}{2}{3}{4}";
    var videocodedivhead = '<div class="video-container">';
    var videocodeiframehead = String.format('<iframe alt="{0}" title="{1}" mozallowfullscreen allowfullscreen frameborder="0" width="560" height="315" ', alt, title);
    var videocodeiframetail = ' scrolling="no" allowtransparency="true"></iframe>';
    var videocodedivtail = '</div>';
    var videoId = "";
    if (ytMatch && ytMatch[1].length === 11) {
        videoId = ytMatch[1];
        videocodemid = 'src="https://www.youtube.com/embed/' + videoId + '"';
    } else if (igMatch && igMatch[0].length) {
        videoId = igMatch[1];
        videocodemid = 'src="https://instagram.com/p/' + videoId + '/embed/"';
    } else if (vMatch && vMatch[0].length) {
        videoId = vMatch[0];
        videocodemid = 'src="', videoId + '/embed/simple"';
    } else if (vimMatch && vimMatch[3].length) {
        videoId = vimMatch[3];
        videocodemid = 'src="https://player.vimeo.com/video/' + videoId + '"';
    } else if (dmMatch && dmMatch[2].length) {
        videoId = dmMatch[2];
        videocodemid = 'src="https://www.dailymotion.com/embed/video/' + videoId + '"';
    } else if (youkuMatch && youkuMatch[1].length) {
        videoId = youkuMatch[1];
        videocodemid = 'src="https://player.youku.com/embed/' + videoId + '"';
    } else if ((qqMatch && qqMatch[1].length) || (qqMatch2 && qqMatch2[2].length)) {
        videoId = ((qqMatch && qqMatch[1].length) ? qqMatch[1] : qqMatch2[2]);
        videocodemid = 'src="http://v.qq.com/iframe/player.html?vid=' + videoId + '&amp;auto=0"';
    } else if (mp4Match || oggMatch || webmMatch) {
        videocodemid = '<video controls  width="560" height="315"><source src="' + url + '"type="video/mp4" ></video controls>';
    } else {
        // this is not a known video link.
        return meansError;
    }
    switch (type) {
        case 1:
            videocode = String.format(videocode, "", videocodeiframehead, videocodemid, videocodeiframetail, "");
            break;
        case 2:
            videocode = String.format(videocode, videocodedivhead, videocodeiframehead, videocodemid, videocodeiframetail, videocodedivtail);
            break;
        case 3:
            videocode = videocodeiframehead + videocodemid + videocodeiframetail;
            let TempDiv = document.createElement("div");
            TempDiv.innerHTML = videocode;
            videocode = TempDiv.getElementsByTagName("iframe")[0].src;
            break;
        default:
            return meansError;
    }
    return {
        "videocode": videocode,
        "videoId": videoId
    }
}