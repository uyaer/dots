var Game = cc.Layer.extend({
    /**
     * @type Array
     */
    boxesArr: [],
    /**
     * 关卡数据
     * @type LevelData
     */
    lvData: null,
    /**
     * 选中的box
     * @type Box
     */
    selectBox:null,
    ctor: function () {
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.cir_plist, res.cir_png);

        var lvData = new LevelData();
        LevelManager.instance.lvData = lvData;
        this.lvData = lvData;

        this.boxesArr = [];
        for (var i = 0; i < lvData.row; i++) {
            var line = [];
            this.boxesArr.push(line);
            for (var j = 0; j < lvData.col; j++) {
                var cir = new ColorCircle(randomInt(1, 5));
                var box = new Box(cir);
                box.x = lvData.gapHalf() + lvData.boxSpace() * j;
                box.y = WIN_H - lvData.topSpace() - lvData.boxSpace() * i;
                this.addChild(box);
                line.push(box);
            }
        }
    },

    onEnter: function () {
        this._super();

        //add listener
        var that = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this._onTouchBegan,
            onTouchMoved: this._onTouchMoved,
            onTouchEnded: this._onTouchEnded
        }, this);
    },

    onExit: function () {
        this._super();

        cc.eventManager.removeListeners(this);
    },

    _onTouchBegan:function (touch, event) {
        event = event || touch;
        var that = event.getCurrentTarget();

        var pos = touch.getLocation();
        var box = that._touchCir(pos);
        this.selectBox = box;
        if (box) {
            return true;
        }
        return false;
    },
    _onTouchMoved:function (touch, event) {
        trace("1@!!!!!!!",this.selectBox.cir.getCirType());
    },
    _onTouchEnded:function(touch,event){
        trace("touch end");
    },

    /**
     * 返回当前选中的box
     * @param pos
     * @returns {*}
     * @private
     */
    _touchCir: function (pos) {
        var lvData = this.lvData;
        for (var i = 0; i < lvData.row; i++) {
            for (var j = 0; j < lvData.col; j++) {
                var box = this.boxesArr[i][j];
                var rect = cc.rect(box.x, box.y, box.width, box.height);
                if (cc.rectContainsPoint(rect, pos)) {
                    return box;
                }
            }
        }
        return null;
    }
});

var GameScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new Game();
        this.addChild(layer);
    }
});