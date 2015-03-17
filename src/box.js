/**
 * Created by hc on 15/3/17.
 */

var Box = cc.Node.extend({
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

        this.setContentSize(cc.size(CIR_SIZE,CIR_SIZE));

        this.cir = circle;

        this.addChild(this.cir);
    }



});