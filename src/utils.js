function trace(str) {
    var log = "";
    for (var i = 0; i < arguments.length; i++) {
        log += arguments[i] + ",";
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

/**
 * 约束val范围值
 * @param val
 * @param min
 * @param max
 * @returns {number}
 */
function limit(val, min, max) {
    return Math.min(max, Math.max(val, min));
}