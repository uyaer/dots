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
    return min + Math.round(Math.random() * (max - min));
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

/**
 * 判断元素是否在数组中
 * @param el {*}
 * @param arr {Array}
 * @returns {boolean}
 */
function isElinArray(el,arr){
    return arr.indexOf(el) !=-1;
}

/**
 * 2个数组中是否有相同元素
 * @param arr1
 * @param arr2
 * @returns {boolean}
 */
function isSameElTowArray(arr1,arr2){
    for(var i = 0 ; i < arr1.length ; i++){
        var flag = isElinArray(arr1[i], arr2);
        if(flag)return true;
    }
    return false;
}