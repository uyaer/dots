var __failCount = 0;

var AssetsManagerLoaderScene = cc.Scene.extend({
    /**
     * @type jsb.AssetsManager
     */
    _am: null,
    /**
     * @type cc.LabelTTF
     */
    _progress: null,
    _percent: 0,
    _percentByFile: 0,
    run: function () {
        this.loadGame();
        return;
        if (!cc.sys.isNative) {
            this.loadGame();
            return;
        }


        var layer = new cc.Layer();
        this.addChild(layer);
        this._progress = new cc.LabelTTF("0%", "Arial", 48);
        this._progress.x = cc.winSize.width / 2;
        this._progress.y = cc.winSize.height / 2 + 50;
        layer.addChild(this._progress);

        // android: /data/data/com.huanle.magic/files/
        var storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "./");
//        jsb.fileUtils.addSearchPath(storagePath,true);
        cc.log("storagePath: " + storagePath);
        cc.log("====++=="+jsb.fileUtils.getSearchPaths());

        this._am = new jsb.AssetsManager("res/project.manifest", storagePath);
        this._am.retain();


        if (!this._am.getLocalManifest().isLoaded()) {
            cc.log("Fail to update assets, step skipped.");
            this.loadGame();
        }
        else {
            cc.log("local version: " + this._am.getLocalManifest().getVersion());
            cc.log("remote version:" + this._am.getRemoteManifest().getVersion());
            var that = this;
            var listener = new jsb.EventListenerAssetsManager(this._am, function (event) {
                switch (event.getEventCode()) {
                    case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                        cc.log("No local manifest file found, skip assets update.");
                        that.loadGame();
                        break;
                    case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                        that._percent = event.getPercent();
                        that._percentByFile = event.getPercentByFile();
                        cc.log(that._percent + "%");

                        var msg = event.getMessage();
                        if (msg) {
                            cc.log(msg);
                        }
                        break;
                    case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                    case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                        cc.log("Fail to download manifest file, update skipped.");
                        that.loadGame();
                        break;
                    case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                    case jsb.EventAssetsManager.UPDATE_FINISHED:
                        cc.log("Update finished.");
                        that.loadGame();
//                        cc.game.restart();
                        break;
                    case jsb.EventAssetsManager.UPDATE_FAILED:
                        cc.log("Update failed. " + event.getMessage());

                        __failCount++;
                        if (__failCount < 5) {
                            that._am.downloadFailedAssets();
                        }
                        else {
                            cc.log("Reach maximum fail count, exit update process");
                            __failCount = 0;
                            that.loadGame();
                        }
                        break;
                    case jsb.EventAssetsManager.ERROR_UPDATING:
                        cc.log("Asset update error: " + event.getAssetId() + ", " + event.getMessage());
                        that.loadGame();
                        break;
                    case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                        cc.log(event.getMessage());
                        that.loadGame();
                        break;
                    default:
                        break;
                }
            });

            cc.eventManager.addListener(listener, 1);
            this._am.update();
            cc.director.runScene(this);
        }

        this.schedule(this.updateProgress, 0.5);
    },
    loadGame: function () {
        cc.loader.loadJs(["src/files.js"], function (err) {
            cc.loader.loadJs(jsFiles, function (err) {
                cc.director.runScene(new HelloWorldScene());
            });
        });
    },
    updateProgress: function (dt) {
        this._progress.string = this._percent + "%";
    },
    onExit: function () {
        cc.log("AssetsManager::onExit");

        this._am.release();
        this._super();
    }
});