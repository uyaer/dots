function trace(str) {
    var log = "";
    for (var i = 0; i < arguments.length; i++) {
        log += arguments[i]+",";
    }
    cc.log(log);
}

function int(val) {
    return parseInt(val);
}

/**
 * 产生包含min,max的整数
 * @param min
 * @param max
 * @returns {*}
 */
function randomInt(min, max) {
    return min + Math.ceil(Math.random() * (max - min));
}