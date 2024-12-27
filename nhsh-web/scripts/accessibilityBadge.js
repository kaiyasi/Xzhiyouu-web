// 無障礙徽章

const AccessibilityLib = {
    "taivs": ["20200605144845", "AA", '2.0', 'right'],
    "nhsh": ["20240305131929", "AA", '2.1', 'center']
    // 單位domain關鍵字（縮寫）: [認證編號, 認證等級, 版本, 位置(置左[left]、置中[center]或置右[right])]
}

$(function () {
    let badge = false;
    let customer;
    let objBadge = $(".accessibilityBadge");
    // 加入class="accessibilityBadge"的容器中

    for (let key in AccessibilityLib) {
        if (location.href.indexOf(key) >= 0) {
            badge = true;
            customer = key;
            break;
        }
    }
    if (badge) {
        let imgTag = $('<img>');

        objBadge.attr({
            "target": "_blank",
            "href": "https://accessibility.moda.gov.tw/Applications/Detail?category={0}".format(AccessibilityLib[customer][0]),
            "title": langData["title"]["accessibilityBadge"]
        }).removeClass("accessibilityBadge");

        switch (AccessibilityLib[customer][3]) {
            case 'left':
                objBadge.css('text-align', 'left');
                break;

            case 'center':
                objBadge.css('padding-top', '1em');
                break;

            default:
                objBadge.css('text-align', 'right');
                break;
        }

        imgTag.attr({
            "src": "/oddi_src/img/accessibility/{1}/{0}.png".format(AccessibilityLib[customer][1], AccessibilityLib[customer][2]),
            "alt": langData["default-alt"]["accessibilityBadge"].format(AccessibilityLib[customer][1]),
            "style": "width:10em; height:auto"
        });

        objBadge.append(imgTag);
    } else {
        objBadge.remove();
    }
});
