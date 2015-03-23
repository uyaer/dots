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
    /**
     * 清除块列表
     * @type Array
     */
    clearList: null,
    ctor: function () {
        this._super();

        var bg = new cc.Sprite(res.bg);
        bg.anchorX = 0;
        bg.anchorY = 0;
        bg.scale = 4;
        this.addChild(bg);

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
                if (i == 2 && j == 2) {
                    cir = Circle.create(CirType.CLEAR_COL);
                }
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
        var resultArr = that._checkCanMove();
        if (resultArr[0]) {
            that.selectBox.flyToPreview();
            that._tempBox.flyToPreview();

            //交换位置
            that._exchangeBox(that.selectBox, that._tempBox);
            //消除块
            that.clearList = [];
            var mainBox = resultArr[1];
            if (mainBox == that.selectBox) {
                that.clearList.push(that.selectBox);
                that._clearBox(that.selectBox, that._tempBox);
            } else {
                that.clearList.push(that._tempBox);
                that._clearBox(that._tempBox, that.selectBox);
            }
            that._clearBoxAnim();
        } else {
            that.selectBox.backToOriginal();
            that._tempBox && that._tempBox.backToOriginal();
        }

        that.selectBox = null;
    },

    /**
     * 清除clearList列表里的动画
     * @private
     */
    _clearBoxAnim: function () {
        for (var i = 0; i < this.clearList.length; i++) {
            var box = this.clearList[i];
            box.runAction(cc.scaleTo(0.25 + i * 0.05, 0));
        }
    },

    /**
     * 清除对应的块，
     * @param selBox {Box} 当前选中的块
     * @param tempBox {Box} 和选中块对应的块，如果递归时，可能为null
     * @private
     */
    _clearBox: function (selBox, tempBox) {
        var type = selBox.cir.getCirType();
        if (type === CirType.COLORFUL) {
            this._clearColorfulCircle(tempBox)
        } else if (type === CirType.BOB_5X5 || type === CirType.BOB_3X3) {
            this._clearBobCircle(selBox);
        } else if (type === CirType.CLEAR_LINE || type === CirType.CLEAR_COL || type === CirType.CLEAR_BOTH) {
            this._clearColorCircle(selBox);
            this._clearClearCircle(selBox);
        } else {
            if (tempBox) { //如果tempBox不为空，表示第一手，并且为颜色的
                if (type === CirType.COLOR_BOTH || type === CirType.COLOR_RED || type === CirType.COLOR_GREEN || type === CirType.COLOR_BLUE || type === CirType.COLOR_PURPLE || type === CirType.COLOR_YELLOW) {
                    this._clearColorCircle(selBox);
                }
            }
        }
    },

    /**
     * 清除相关颜色的小球
     * @param box
     * @private
     */
    _clearColorCircle: function (box) {
        this.__getColorBoxLine(box);
    },

    /**
     * 获取颜色box连成的线
     * @param box {Box}
     * @private
     */
    __getColorBoxLine: function (box) {
        var i;
        var cbox;
        var axisXBoxArr = []; //x轴向的可消除的相同颜色 如果判断到>＝3，表示可以消除
        //检测 －x
        for (i = box.checkCol() - 1; i >= 0; i--) {
            cbox = this.boxesArr[box.checkRow()][i];
            if (cbox == box) cbox = this.boxesArr[box.row - box.offRow][box.col - box.offCol];
            if (Circle.checkColorIsSame(box.cir, cbox.cir)) {
                axisXBoxArr.push(cbox);
            } else {
                break;
            }
        }
        //检测 +x
        for (i = box.checkCol() + 1; i < this.lvData.col; i++) {
            cbox = this.boxesArr[box.checkRow()][i];
            if (cbox == box) cbox = this.boxesArr[box.row - box.offRow][box.col - box.offCol];
            if (Circle.checkColorIsSame(box.cir, cbox.cir)) {
                axisXBoxArr.push(cbox);
            } else {
                break;
            }
        }

        var axisYBoxArr = []; //y轴向的可消除的相同颜色 如果判断到>＝3，表示可以消除
        //检测 －y
        for (i = box.checkRow() - 1; i >= 0; i--) {
            cbox = this.boxesArr[i][box.checkCol()];
            if (cbox == box) cbox = this.boxesArr[box.row - box.offRow][box.col - box.offCol];
            if (Circle.checkColorIsSame(box.cir, cbox.cir)) {
                axisYBoxArr.push(cbox);
            } else {
                break;
            }
        }
        //检测 +y
        for (i = box.checkRow() + 1; i < this.lvData.row; i++) {
            cbox = this.boxesArr[i][box.checkCol()];
            if (cbox == box) cbox = this.boxesArr[box.row - box.offRow][box.col - box.offCol];
            if (Circle.checkColorIsSame(box.cir, cbox.cir)) {
                axisYBoxArr.push(cbox);
            } else {
                break;
            }
        }

        //融合
        if (axisXBoxArr.length >= 2)
            for (i = 0; i < axisXBoxArr.length; i++) {
                var cbox = axisXBoxArr[i];
                if (!cbox)continue;
                if (!isElinArray(cbox, this.clearList)) {
                    this.clearList.push(cbox);
                    //递归调用，判断是否可以消除其他
                    this._clearBox(cbox, null);
                }
            }
        for (axisYBoxArr.length >= 2, i = 0; i < axisYBoxArr.length; i++) {
            var cbox = axisYBoxArr[i];
            if (!cbox)continue;
            if (!isElinArray(cbox, this.clearList)) {
                this.clearList.push(cbox);
                //递归调用，判断是否可以消除其他
                this._clearBox(cbox, null);
            }
        }

        //断定新生成规则
        if (axisXBoxArr.length == 6 || axisYBoxArr.length == 6) {
            //生成CirType.Colorful
        } else if (axisXBoxArr.length == 5 || axisYBoxArr.length == 5) {
            //生成CirType.Clear_Both
        } else if (axisXBoxArr.length == 4 || axisYBoxArr.length == 4) {
            //生成CirType.clear_line || clear_row
        } else if (axisXBoxArr.length >= 3 && axisYBoxArr.length >= 3) {
            //生成CirType.bob x 5
        } else if (axisXBoxArr.length >= 2 && axisYBoxArr.length >= 2) {
            //生成CirType.bob x 3
        } else if (axisXBoxArr.length >= 3 || axisYBoxArr.length >= 3) {
            //生成CirType.color_both
        }
    },

    /**
     * 清除 clear  类型的
     * @param box
     * @private
     */
    _clearClearCircle: function (box) {
        var type = box.cir.getCirType();
        if (type == CirType.CLEAR_COL || type == CirType.CLEAR_BOTH) {
            for (var i = 0; i < this.lvData.col; i++) {
                var cbox = this.boxesArr[box.row][i];
                if (!cbox)continue;
                if (!isElinArray(cbox, this.clearList)) {
                    this.clearList.push(cbox);
                    //递归调用，判断是否可以消除其他
                    this._clearBox(cbox, null);
                }
            }
        }
        if (type == CirType.CLEAR_LINE || type == CirType.CLEAR_BOTH) {
            for (var i = 0; i < this.lvData.row; i++) {
                var cbox = this.boxesArr[i][box.col];
                if (!cbox)continue;
                if (!isElinArray(cbox, this.clearList)) {
                    this.clearList.push(cbox);
                    //递归调用，判断是否可以消除其他
                    this._clearBox(cbox, null);
                }
            }
        }
    },

    /**
     * 清除爆炸类型
     * @param box {Box}
     * @private
     */
    _clearBobCircle: function (box) {
        var type = box.cir.getCirType();
        var offset;
        if (type == CirType.BOB_3X3) {
            offset = 1;
        } else if (type == CirType.BOB_5X5) {
            offset = 2;
        }
        for (var i = box.row - offset; i <= box.row + offset; i++) {
            for (var j = box.col - offset; j <= box.col + offset; j++) {
                var row = limit(i, 0, this.lvData.row - 1);
                var col = limit(j, 0, this.lvData.col - 1);
                var cbox = this.boxesArr[row][col];
                if (!cbox)continue;
                if (!isElinArray(cbox, this.clearList)) {
                    this.clearList.push(cbox);
                    //递归调用，判断是否可以消除其他
                    this._clearBox(cbox, null);
                }
            }
        }
    },

    /**
     * 清除所有颜色为 box的 的颜色
     * @param box
     * @private
     */
    _clearColorfulCircle: function (box) {
        var cArr = [randomInt(1, 5)];
        if (box) {
            var arr = Circle.getDotColor(box.cir);
            if (arr.length > 0) { //如果时2个颜色的那种，会消除2种颜色
                cArr = arr;
            }
        }

        //循环所有元素，判断颜色是否能够被消除
        for (var i = 0; i < this.lvData.row; i++) {
            for (var j = 0; j < this.lvData.col; j++) {
                var cbox = this.boxesArr[i][j];
                if (!cbox)continue;
                var arr = Circle.getDotColor(cbox.cir);
                if (isSameElTowArray(arr, cArr) && !isElinArray(cbox, this.clearList)) { //如果颜色相同，并且没有添加到过clearList中，那么就添加
                    this.clearList.push(cbox);
                    //递归调用，判断是否可以消除其他
                    this._clearBox(cbox, null);
                }
            }
        }
    },

    /**
     * 交换2个box的位置
     * @param box1 {Box}
     * @param box2 {Box}
     * @private
     */
    _exchangeBox: function (box1, box2) {
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
     * @returns [bool,box]
     */
    _checkCanMove: function () {
        //如果没有找到tempBox，直接表示不能移动
        if (!this._tempBox)return [false, null];

        var box = this.selectBox;

        //TODO 现在是全部都会对调，以后会变为按照实际情况判断
        box.offCol = -this._tempBox.offCol;
        box.offRow = -this._tempBox.offRow;

        //如果为炸弹或者泯灭颜色到小球，表示可以任意移动
        var CAN_MOVE_ARR = [
            CirType.BOB_3X3,
            CirType.BOB_5X5,
            CirType.COLORFUL
        ];
        if (isElinArray(box.cir.getCirType(), CAN_MOVE_ARR)) {
            return [true, box];
        }
        //检测当前控制小球周围是否可以保持


        if (this._chcekTwoColorBoxCanMove(box, this._tempBox)) {
            return [true, box];
        }
        if (this._chcekTwoColorBoxCanMove(this._tempBox, box)) {
            return [true, this._tempBox];
        }
        return [false, null];
    },

    /**
     * 分别检测2个box是否可以形成大于3的连线
     * @param box {Box}
     * @param box2 {Box}
     * @private
     */
    _chcekTwoColorBoxCanMove: function (box, box2) {
        var i;
        var cbox;
        var axisXCount = 0; //x轴向的可消除的相同颜色 如果判断到>＝3，立即返回进行相关消除效果
        //检测 －x
        for (i = box.checkCol() - 1; i >= 0; i--) {
            cbox = this.boxesArr[box.checkRow()][i];
            if (cbox == box) cbox = box2;
            if (Circle.checkColorIsSame(box.cir, cbox.cir)) {
                axisXCount++;
                if (axisXCount >= 2)return true;
            } else {
                break;
            }
        }
        //检测 +x
        for (i = box.checkCol() + 1; i < this.lvData.col; i++) {
            cbox = this.boxesArr[box.checkRow()][i];
            if (cbox == box) cbox = box2;
            if (Circle.checkColorIsSame(box.cir, cbox.cir)) {
                axisXCount++;
                if (axisXCount >= 2)return true;
            } else {
                break;
            }
        }

        var axisYCount = 0; //y轴向的可消除的相同颜色 如果判断到>＝3，立即返回进行相关消除效果
        //检测 －y
        for (i = box.checkRow() - 1; i >= 0; i--) {
            cbox = this.boxesArr[i][box.checkCol()];
            if (cbox == box) cbox = box2;
            if (Circle.checkColorIsSame(box.cir, cbox.cir)) {
                axisYCount++;
                if (axisYCount >= 2)return true;
            } else {
                break;
            }
        }
        //检测 +y
        for (i = box.checkRow() + 1; i < this.lvData.row; i++) {
            cbox = this.boxesArr[i][box.checkCol()];
            if (cbox == box) cbox = box2;
            if (Circle.checkColorIsSame(box.cir, cbox.cir)) {
                axisYCount++;
                if (axisYCount >= 2)return true;
            } else {
                break;
            }
        }
    },

    /**
     * 检测是否可以临时交换
     * @private
     */
    _checkTempExchange: function () {
        var temp;
        if (this._axis == 1) {
            if (this.selectBox.x - this.selectBox.originalX() < -(this.lvData.boxSpaceHalf() - CIR_SIZE * 0.5)) { //向左移动
                temp = this.boxesArr[this.selectBox.row][this.selectBox.col - 1];
                temp.offCol = 1;
            } else if (this.selectBox.x - this.selectBox.originalX() > this.lvData.boxSpaceHalf() - CIR_SIZE * 0.5) {//向右移动
                temp = this.boxesArr[this.selectBox.row][this.selectBox.col + 1];
                temp.offCol = -1;
            }
        } else if (this._axis == 2) {
            if (this.selectBox.y - this.selectBox.originalY() < -(this.lvData.boxSpaceHalf() - CIR_SIZE * 0.5)) { //向下移动
                temp = this.boxesArr[this.selectBox.row + 1][this.selectBox.col];
                temp.offRow = -1;
            } else if (this.selectBox.y - this.selectBox.originalY() > this.lvData.boxSpaceHalf() - CIR_SIZE * 0.5) {//向上移动
                temp = this.boxesArr[this.selectBox.row - 1][this.selectBox.col];
                temp.offRow = 1;
            }
        }

        //判断寻找到到temp是否可走
        if (temp && temp.isCantMove()) {
            temp.offCol = temp.offRow = 0;
            return;
        }

        //如果存在和以前不同大临时交换box，那么，表示找到列新到box
        if (temp && temp != this._tempBox) {
            if (this._tempBox) {
                this._tempBox.backToOriginal();
            }
            this._tempBox = temp;
            this._tempBox.flyToPreview();
        }
        //如果没有过界，并且已经有临时移动点点时候，让临时移动点还原
        if (!temp && this._tempBox) {
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

    debug: function () {
        for (var i = 0; i < this.lvData.row; i++) {
            var str = "";
            for (var j = 0; j < this.lvData.col; j++) {
                var box = this.boxesArr[i][j];
                str += box.row + "_" + box.col + "  |  ";
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