/**
 * Created by hc on 15/3/17.
 */

var Box = cc.Node.extend({

    /**
     * 行id
     */
    row: 0,
    /**
     * 列id
     */
    col: 0,

    /**
     * 临时位移的偏移点
     */
    offRow: 0,
    /**
     * 临时位移点偏移点
     */
    offCol: 0,

    /**
     * Circle 对象
     * @type Circle
     */
    cir: null,

    /**
     * 通过 BlockType生成 Block对象
     * @param circle
     * @param blockType
     */
    ctor: function (circle, blockType) {
        this._super();

        this.setContentSize(cc.size(CIR_SIZE, CIR_SIZE));

        this.cir = circle;

        this.addChild(this.cir);

        this.anchorX = 0.5;
        this.anchorY = 0.5;
    },

    /**
     * 原始坐标 X
     */
    originalX: function () {
        var lvData = LevelManager.instance.lvData;
        return lvData.gapHalf() + lvData.boxSpace() * this.col + CIR_SIZE * 0.5;
    },
    /**
     * 原始坐标 Y
     */
    originalY: function () {
        var lvData = LevelManager.instance.lvData;
        return WIN_H - lvData.topSpace() - lvData.boxSpace() * this.row - CIR_SIZE * 0.5;
    },

    /**
     * 约束坐标，x最小值
     * @returns {number}
     */
    minX: function () {
        var lvData = LevelManager.instance.lvData;
        return lvData.gapHalf() + CIR_SIZE * 0.5;
    },
    /**
     * 约束坐标，x最大值
     * @returns {number}
     */
    maxX: function () {
        var lvData = LevelManager.instance.lvData;
        return lvData.gapHalf() + lvData.boxSpace() * (lvData.col - 1) + CIR_SIZE * 0.5;
    },
    /**
     * 约束坐标，y最小值
     * @returns {number}
     */
    minY: function () {
        var lvData = LevelManager.instance.lvData;
        return WIN_H - lvData.topSpace() - lvData.boxSpace() * (lvData.row - 1) - CIR_SIZE * 0.5;
    },
    /**
     * 约束坐标，y最大值
     * @returns {number}
     */
    maxY: function () {
        var lvData = LevelManager.instance.lvData;
        return WIN_H - lvData.topSpace() - CIR_SIZE * 0.5;
    },
    /**
     * 返回用于检测的ROW
     * @returns {number}
     */
    checkRow: function () {
        return this.row + this.offRow;
    },
    /**
     * 返回用于检测点COl
     * @returns {number}
     */
    checkCol: function () {
        return this.col + this.offCol;
    },

    /**
     * 返回原始位置
     */
    backToOriginal: function () {
        this.runAction(cc.moveTo(0.25, this.originalX(), this.originalY()));
        this.offCol = 0;
        this.offRow = 0;
    },

    /**
     * 飞翔预览位置
     */
    flyToPreview: function () {
        var lvData = LevelManager.instance.lvData;
        var move = cc.moveBy(0.125, lvData.boxSpace() * this.offCol, lvData.boxSpace() * this.offRow);
        this.runAction(move);
    }

});