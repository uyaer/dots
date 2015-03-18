/**
 * Created by hc on 15/3/17.
 */

function LevelData() {
    /**
     * 关卡id
     */
    this.levelId = 1;
    /**
     * 几行
     */
    this.row = 4;
    /**
     * 几列
     */
    this.col = 4;
    /**
     * 允许出现的颜色
     */
    this.colors = [1, 2, 3, 4, 5];
    /**
     * 地图数据
     * @type Array
     */
    this.map = null;

    /**
     * 每个box之间的距离
     * @returns {number}
     */
    this.gap = function () {
        var space = WIN_W - this.col * CIR_SIZE;
        return int(space / this.col);
    };
    /**
     * 左边距
     * @returns {number}
     */
    this.gapHalf = function () {
        return int(this.gap() * 0.5);
    };
    /**
     * 每个box起点之间的距离
     * @returns {number}
     */
    this.boxSpace = function () {
        return this.gap() + CIR_SIZE;
    };

    this.boxSpaceHalf = function(){
        return int(this.boxSpace() * 0.5);
    }
    /**
     * 顶部的距离
     */
    this.topSpace = function () {
        var contentH = this.boxSpace() * (this.row - 1) + CIR_SIZE;
        var half = (WIN_H - contentH) * 0.5;
        return Math.max(100, half);
    };
}

var LevelManager = function(){
    /**
     * 当前的关卡数据
     * @type {LevelData}
     */
    this.lvData = null;
}
LevelManager.instance = new LevelData();