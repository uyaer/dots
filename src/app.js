var Game = cc.Layer.extend({

    ctor: function () {
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.cir_plist, res.cir_png);

        for (var i = 0; i < Row; i++) {
            for (var j = 0; j < Col; j++) {
                var cir = new ColorCircle(randomInt(1, 5));
                cir.x = 120 * j;
                cir.y = 120 * i;
                this.addChild(cir);
            }
        }
    }
});

var GameScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new Game();
        this.addChild(layer);
    }
});

