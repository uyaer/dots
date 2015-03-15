/**
 * Created by hc on 15/3/15.
 */

var CirType = {
    /**
     * 代表不能行走点
     */
    NONE: -1,
    /**
     * 颜色不定啦
     */
    COLOR_ANY: 0,
    //颜色，红绿蓝黄紫
    COLOR_RED: 1,
    COLOR_GREEN: 2,
    COLOR_BLUE: 3,
    COLOR_PURPLE: 4,
    COLOR_YELLOW: 5,

    /**
     * 由4个产生，可以匹配2种任意颜色
     */
    COLOR_BOTH: 101,
    /**
     * 由5个产生，可以消灭一行
     */
    CLEAR_LINE: 102,
    /**
     * 由5个产生，可以消灭一列
     */
    CLEAR_COL: 103,
    /**
     * 由6个产生，可以消灭十字
     */
    CLEAR_BOTH: 104,
    /**
     * 由横竖都是三个以上的产生，可以消灭3x3的范围
     */
    BOB_3X3: 105,
    /**
     * 由横竖都是四个以上的产生，可以消灭5x5的范围
     */
    BOB_5X5: 106,
    /**
     * 由7个产生，可以消灭指定的颜色块的所有点
     */
    DEVOUR_ONE_COLOR: 107
}

var Circle = cc.Node.extend({
    /**
     * Circle类型
     */
    _type: CirType.NONE
    /**
     * 获得Cir的type
     * @returns {number}
     */
    getCirType: function () {
        return this._type;
    }
});


/**
 * ================================= ColorCircle  ==================================
 * ================================= 颜色小点  ==================================
 * ================================= 1-5  ==================================
 */
var ColorCircle = Circle.extend({
    /**
     * 颜色
     */
    color: 1,
    ctor: function (c) {
        this._super();

        this.color = c || CirType.COLOR_RED;
    },
    /**
     * 获得Cir的type，颜色小圆点是总类，所有返回对应的颜色值
     * @returns {number}
     */
    getCirType: function () {
        this.color;
    }
});

/**
 * ================================= ColorBothCircle  ==================================
 * ================================= 2种颜色合并为1个小点  ==================================
 * ================================= 101  ==================================
 */
var ColorBothCircle = Circle.extend({
    /**
     * 颜色1
     */
    color1: 1,
    /**
     * 颜色2
     */
    color2: 2,
    ctor: function (c1, c2) {
        this._super();

        this._type = CirType.COLOR_BOTH;

        this.color1 = c1 || CirType.COLOR_RED;
        this.color2 = c2 || CirType.COLOR_GREEN;
    }
});

/**
 * ================================= ClearCircle  ==================================
 * ================================= 清除1行或1列的小圆点  ==================================
 * ================================= 102,103,104  ==================================
 */
var ClearCircle = Circle.extend({

    ctor: function (c) {
        this._super();

        this._type = c || CirType.CLEAR_LINE;
    }
});

/**
 * ================================= BobCircle  ==================================
 * ================================= 清除1个区域  ==================================
 * ================================= 105,106  ==================================
 */
var BobCircle = Circle.extend({

    ctor: function (c) {
        this._super();

        this._type = c || CirType.BOB_3X3;
    }
});

/**
 * ================================= DevourCircle  ==================================
 * ================================= 清除1种颜色  ==================================
 * ================================= 107  ==================================
 */
var DevourCircle = Circle.extend({

    ctor: function () {
        this._super();

        this._type = CirType.DEVOUR_ONE_COLOR;
    }
});
