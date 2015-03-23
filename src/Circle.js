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
    COLORFUL: 107
}

var Circle = cc.Node.extend({
    /**
     * Circle类型
     */
    _type: CirType.NONE,

    /**
     * 不能走点图片
     * @type cc.Sprite
     */
    sprite_no:null,

    ctor: function () {
        this._super();

        this.setContentSize(cc.size(CIR_SIZE,CIR_SIZE));


    },

    initNo:function(){
        this.sprite_no = new cc.Sprite("#cirs/cir_none.png");
        this.sprite_no.anchorX = 0;
        this.sprite_no.anchorY = 0;
        this.addChild(this.sprite_no);
    },

    /**
     * 获得Cir的type
     * @returns {number}
     */
    getCirType: function () {
        return this._type;
    }
});

/**
 * 根据 cirType生成不同的Circle
 * @param cirType
 * @param ...其他参数
 */
Circle.create = function(cirType){
    if(cirType == CirType.COLOR_ANY){
        cirType = randomInt(CirType.COLOR_RED,CirType.COLOR_YELLOW);
    }

    var cir = null;
    switch (cirType){
        case CirType.COLOR_RED:
        case CirType.COLOR_GREEN:
        case CirType.COLOR_BLUE:
        case CirType.COLOR_PURPLE:
        case CirType.COLOR_YELLOW:
            cir = new ColorCircle(cirType);
            break;
        case CirType.COLOR_BOTH:
            cir = new ColorBothCircle(cirType,arguments[1],arguments[2]);
            break;
        case CirType.CLEAR_LINE:
        case CirType.CLEAR_COL:
        case CirType.CLEAR_BOTH:
            cir = new ClearCircle(cirType,arguments[1]);
            break;
        case CirType.BOB_3X3:
        case CirType.BOB_5X5:
            cir = new BobCircle(cirType);
            break;
        case CirType.COLORFUL:
            cir = new ColorfulCircle();
            break;
        default :
            cir = new Circle();
            cir.initNo();
            break;
    }
    return cir;
};

Circle.checkColorIsSame=function(cir1,cir2){
    var arr1 = Circle.getDotColor(cir1);
    var arr2 = Circle.getDotColor(cir2);

    return isSameElTowArray(arr1, arr2);
};
Circle.getDotColor = function(cir){
    if(cir instanceof ColorCircle){
        return [cir.dotColor];
    }else if(cir instanceof ColorBothCircle){
        return [cir.color1,cir.color2];
    }else if(cir instanceof ClearCircle){
        return [cir.dotColor];
    }else if(cir instanceof ColorfulCircle){
        return [CirType.COLOR_RED,CirType.COLOR_GREEN,CirType.COLOR_BLUE,CirType.COLOR_PURPLE,CirType.COLOR_YELLOW];
    }
    return [];
};


/**
 * ================================= ColorCircle  ==================================
 * ================================= 颜色小点  ==================================
 * ================================= 1-5  ==================================
 */
var ColorCircle = Circle.extend({
    /**
     * 颜色
     */
    dotColor: 1,
    /**
     * 显示的图片
     * @type cc.Sprite
     */
    sprite: null,
    ctor: function (c) {
        this._super();

        this.dotColor = c || CirType.COLOR_RED;

        this.sprite = new cc.Sprite("#cirs/cir_" + this.dotColor + ".png");
        this.sprite.anchorX = 0;
        this.sprite.anchorY = 0;
        this.addChild(this.sprite);
    },
    /**
     * 获得Cir的type，颜色小圆点是总类，所有返回对应的颜色值
     * @returns {number}
     */
    getCirType: function () {
        return this.dotColor;
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
    /**
     * 左边的颜色块
     * @type cc.Sprite
     */
    sprite2: null,
    /**
     * 右边的颜色块
     * @type cc.Sprite
     */
    sprite1: null,
    ctor: function (c1, c2) {
        this._super();

        this._type = CirType.COLOR_BOTH;

        this.color1 = c1 || CirType.COLOR_RED;
        this.color2 = c2 || CirType.COLOR_GREEN;

        this.sprite1 = new cc.Sprite("#cirs/cir_half_" + this.color1 + ".png")
        this.sprite2 = new cc.Sprite("#cirs/cir_half_" + this.color2 + ".png")
        this.sprite1.anchorX = 0;
        this.sprite1.anchorY = 0;
        this.sprite2.anchorX = 1;
        this.sprite2.anchorY = 0;
        this.sprite2.flippedX = true;
        this.addChild(this.sprite1);
        this.addChild(this.sprite2);

    }
});

/**
 * ================================= ClearCircle  ==================================
 * ================================= 清除1行或1列的小圆点  ==================================
 * ================================= 102,103,104  ==================================
 */
var ClearCircle = Circle.extend({
    /**
     * 清除的下面的颜色
     */
    dotColor: 0,
    /**
     * 下面的颜色图片
     * @type cc.Sprite
     */
    sprite: null,
    /**
     * 上面的方向图片
     * @type cc.Sprite
     */
    topSprite: null,
    ctor: function (t, c) {
        this._super();

        this._type = t || CirType.CLEAR_LINE;
        this.dotColor = c || CirType.COLOR_RED;

        this.sprite = new cc.Sprite("#cirs/cir_" + this.dotColor + ".png");
        this.sprite.anchorX = 0;
        this.sprite.anchorY = 0;
        this.addChild(this.sprite);

        var name = "";
        switch (this._type) {
            case CirType.CLEAR_LINE:
                name = "#cirs/cir_clear_col.png";
                break;
            case CirType.CLEAR_COL:
                name = "#cirs/cir_clear_line.png";
                break;
            case CirType.CLEAR_BOTH:
                name = "#cirs/cir_clear_both.png";
                break;
        }
        this.topSprite = new cc.Sprite(name);
        this.topSprite.x = CIR_SIZE * 0.5;
        this.topSprite.y = CIR_SIZE * 0.5;
        this.addChild(this.topSprite, 1);
    }
});

/**
 * ================================= BobCircle  ==================================
 * ================================= 清除1个区域  ==================================
 * ================================= 105,106  ==================================
 */
var BobCircle = Circle.extend({
    /**
     * @type cc.Sprite
     */
    sprite: null,
    ctor: function (c) {
        this._super();

        this._type = c || CirType.BOB_3X3;

        var name = "#cirs/cir_bobx3.png";
        if (this._type == CirType.BOB_5X5) {
            name = "#cirs/cir_bobx5.png";
        }

        this.sprite = new cc.Sprite(name);
        this.sprite.anchorX = 0;
        this.sprite.anchorY = 0;
        this.addChild(this.sprite);
    }
});

/**
 * ================================= DevourCircle  ==================================
 * ================================= 清除1种颜色  ==================================
 * ================================= 107  ==================================
 */
var ColorfulCircle = Circle.extend({
    /**
     * @type cc.Sprite
     */
    sprite: null,
    ctor: function () {
        this._super();

        this._type = CirType.COLORFUL;

        this.sprite = new cc.Sprite("#cirs/cir_colorful.png");
        this.sprite.anchorX = 0;
        this.sprite.anchorY = 0;
        this.addChild(this.sprite);
    }
});
