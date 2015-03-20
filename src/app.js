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
    selectBox: null,
    /**
     * 轴线判断，等于1是x轴，2是y轴
     */
    _axis: 0,
    /**
     * 临时兑换位置的Box
     * @type Box
     */
    _tempBox: null,
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
                var cir = Circle.create(randomInt(0, 5));
                var box = new Box(cir);
                box.row = i;
                box.col = j;
                box.x = box.originalX();
                box.y = box.originalY();
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

    _onTouchBegan: function (touch, event) {
        event = event || touch;
        var that = event.getCurrentTarget();

        that._axis = 0;

        var pos = touch.getLocation();
        var box = that._touchCir(pos);
        that.selectBox = box;
        if (box && !box.isCantMove()) {
            box.setLocalZOrder(1);
            return true;
        }
        return false;
    },
    _onTouchMoved: function (touch, event) {
        event = event || touch;
        var that = event.getCurrentTarget();

        var box = that.selectBox;
        var oldx = box.originalX();
        var oldy = box.originalY();
        var space = that.lvData.boxSpace();
        var delta = touch.getDelta();
        box.x = limit(box.x + delta.x, oldx - space, oldx + space);
        box.y = limit(box.y + delta.y, oldy - space, oldy + space);
        box.x = limit(box.x, box.minX(), box.maxX());
        box.y = limit(box.y, box.minY(), box.maxY());

        //判断轴线
        var D = Math.max(30, that.lvData.boxSpace() * 0.3);
        if (that._axis == 0) {
            if (Math.abs(box.x - oldx) > D) {
                that._axis = 1;
            } else if (Math.abs(box.y - oldy) > D) {
                that._axis = 2;
            }
        }

        //根据轴线重置某个方向不移动
        if (that._axis == 1) {
            box.y = oldy;
        } else if (that._axis == 2) {
            box.x = oldx;
        }

        //实时监测临时预览交换对象
        that._checkTempExchange();
    },
    _onTouchEnded: function (touch, event) {
        event = event || touch;
        var that = event.getCurrentTarget();

        that.selectBox.setLocalZOrder(0);

        //判断是否可以移动，如果可以，则交换位置，如果不行，就还原位置
        if(that._checkCanMove()){
            that.selectBox.flyToPreview();
            that._tempBox.flyToPreview();

            that._exchangeBox(that.selectBox,that._tempBox);
        }else{
            that.selectBox.backToOriginal();
            that._tempBox && that._tempBox.backToOriginal();
        }

        that.selectBox = null;
    },
    /**
     * 交换2个box的位置
     * @param box1 {Box}
     * @param box2 {Box}
     * @private
     */
    _exchangeBox:function(box1,box2){
        this.boxesArr[box1.row][box1.col] = box2;
        this.boxesArr[box2.row][box2.col] = box1;
        box1.row = box1.checkRow();
        box1.col = box1.checkCol();
        box2.row = box2.checkRow();
        box2.col = box2.checkCol();
        box1.offCol = box1.offRow = 0;
        box2.offCol = box2.offRow = 0;
    },

    /**
     * 判断是否可以移动到想要移动到位置
     * @private
     */
    _checkCanMove:function(){
        //如果没有找到tempBox，直接表示不能移动
        if(!this._tempBox)return false;

        //如果为炸弹或者泯灭颜色到小球，表示可以任意移动
        var box = this.selectBox;
        var CAN_MOVE_ARR = [
            CirType.BOB_3X3,
            CirType.BOB_5X5,
            CirType.COLORFUL
        ];
        if(isElinArray(box.cir.getCirType(),CAN_MOVE_ARR)){
            return true;
        }
        //检测当前控制小球周围是否可以保持
        box.offCol = -this._tempBox.offCol;
        box.offRow = -this._tempBox.offRow;

        if(this._chcekTwoColorBoxCanMove(box,this._tempBox)){
            return true;
        }
        if(this._chcekTwoColorBoxCanMove(this._tempBox,box)){
            return true;
        }
        return false;
    },

    /**
     * 分别检测2个box是否可以形成大于3的连线
     * @param box {Box}
     * @param box2 {Box}
     * @private
     */
    _chcekTwoColorBoxCanMove:function(box,box2){
        var i;
        var cbox;
        var axisXCount = 0; //x轴向的可消除的相同颜色 如果判断到>＝3，立即返回进行相关消除效果
        //检测 －x
        for(i = box.checkCol() - 1; i >= 0 ; i--){
            cbox = this.boxesArr[box.checkRow()][i];
            if(cbox == box) cbox = box2;
            if(Circle.checkColorIsSame(box.cir,cbox.cir)){
                axisXCount ++;
                if(axisXCount>=2)return true;
            }else{
                break;
            }
        }
        //检测 +x
        for(i = box.checkCol() + 1; i < this.lvData.col ; i++){
            cbox = this.boxesArr[box.checkRow()][i];
            if(cbox == box) cbox = box2;
            if(Circle.checkColorIsSame(box.cir,cbox.cir)){
                axisXCount ++;
                if(axisXCount>=2)return true;
            }else{
                break;
            }
        }

        var axisYCount = 0; //y轴向的可消除的相同颜色 如果判断到>＝3，立即返回进行相关消除效果
        //检测 －y
        for(i = box.checkRow() - 1; i >= 0 ; i--){
            cbox = this.boxesArr[i][box.checkCol()];
            if(cbox == box) cbox = box2;
            if(Circle.checkColorIsSame(box.cir,cbox.cir)){
                axisYCount ++;
                if(axisYCount>=2)return true;
            }else{
                break;
            }
        }
        //检测 +y
        for(i = box.checkRow() + 1; i < this.lvData.row ; i++){
            cbox = this.boxesArr[i][box.checkCol()];
            if(cbox == box) cbox = box2;
            if(Circle.checkColorIsSame(box.cir,cbox.cir)){
                axisYCount ++;
                if(axisYCount>=2)return true;
            }else{
                break;
            }
        }
    },

    /**
     * 检测是否可以临时交换
     * @private
     */
    _checkTempExchange:function(){
        var temp;
        if(this._axis == 1){
            if(this.selectBox.x - this.selectBox.originalX() < -(this.lvData.boxSpaceHalf()-CIR_SIZE*0.5)){ //向左移动
                temp = this.boxesArr[this.selectBox.row][this.selectBox.col-1];
                temp.offCol = 1;
            } else if(this.selectBox.x - this.selectBox.originalX() > this.lvData.boxSpaceHalf()-CIR_SIZE*0.5){//向右移动
                temp = this.boxesArr[this.selectBox.row][this.selectBox.col+1];
                temp.offCol = -1;
            }
        }else if(this._axis == 2){
            if(this.selectBox.y - this.selectBox.originalY() < -(this.lvData.boxSpaceHalf()-CIR_SIZE*0.5)){ //向下移动
                temp = this.boxesArr[this.selectBox.row+1][this.selectBox.col];
                temp.offRow = -1;
            } else if(this.selectBox.y - this.selectBox.originalY() > this.lvData.boxSpaceHalf()-CIR_SIZE*0.5){//向上移动
                temp = this.boxesArr[this.selectBox.row-1][this.selectBox.col];
                temp.offRow = 1;
            }
        }

        //判断寻找到到temp是否可走
        if(temp && temp.isCantMove()){
            temp.offCol = temp.offRow = 0;
            return;
        }

        //如果存在和以前不同大临时交换box，那么，表示找到列新到box
        if(temp && temp != this._tempBox){
            if(this._tempBox){
                this._tempBox.backToOriginal();
            }
            this._tempBox = temp;
            this._tempBox.flyToPreview();
        }
        //如果没有过界，并且已经有临时移动点点时候，让临时移动点还原
        if(!temp && this._tempBox){
            this._tempBox.backToOriginal();
            this._tempBox = null;
        }
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
                var rect = cc.rect(box.x - lvData.boxSpaceHalf(), box.y - lvData.boxSpaceHalf(), lvData.boxSpace(), lvData.boxSpace());
                if (cc.rectContainsPoint(rect, pos)) {
                    return box;
                }
            }
        }
        return null;
    },

    debug:function(){
        for(var i = 0 ; i < this.lvData.row; i ++){
            var str = "";
            for(var j = 0 ; j < this.lvData.col; j ++){
                var box = this.boxesArr[i][j];
                str += box.row +"_"+box.col + "  |  ";
            }
            trace(str);
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