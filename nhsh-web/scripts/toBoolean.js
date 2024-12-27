// 轉換成boolean

function toBoolean(obj) {
    switch (typeof (obj)) {
        case "number":
            obj = obj > 0 ? true : false;
            break;

        case "string":
            obj = obj == "false" ? false :
                obj == "0" ? false :
                    obj == "" ? false :
                        true;
            break;

        case "boolean":
            obj = obj;
            break;

        case "null":
            obj = false;
            break;

        case "undefined":
            obj = false;
            break;

        case "object":
            obj = true;
            break;

        default:
            obj = true;
            break;
    }

    return obj;
}