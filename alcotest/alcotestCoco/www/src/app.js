var TAG_SPRITE_FINGER = 1; // finger
var TAG_SPRITE_TARGET = 2; // target
var TAG_LABEL_TITLE = 3; // title label

var STATE_WAIT_FIRST_FINGER = 10; // waiting for user to put finger on starting zone (circle in the middle of the screen)
var STATE_COUNT_DOWN = 20;        // displaying count down before target appears
var STATE_TARGET_APPEARS = 30;    // target apears, waiting for users move to start
var STATE_USER_MOVE_STARTED = 40; // user started to move (move crossed triggering circle)
var STATE_USER_MOVE_ENDED_SUCCESS = 50; // user move reached the target, application now does the math and decides betwen another testrun or a final score
var STATE_WAIT_FIRST_FINGER_DISPLAY_SCORE = 60; // waiting for user to put finger on starting zone + displaying score from previous attempt
var STATE_DISPLAY_VERDICT = 60; // waiting for user to put finger on starting zone (circle in the middle of the screen)

var state = STATE_WAIT_FIRST_FINGER; // initial state
var helloLabel;
/* globals cc, asset */
var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        
        if(window.sideIndexBar){
            window.sideIndexBar.changeTest(0, 4);
        }
        //////////////////////////////
        // 1. super init first
        this._super();

        this.init();
        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;

        // add a "close" icon to exit the progassets. it's an autorelease object
        var closeItem = new cc.MenuItemImage(
            asset.CloseNormal_png,
            asset.CloseSelected_png,
            function () {
                cc.log("Menu is clicked!");
            }, this);
        closeItem.attr({
            x: size.width - 20,
            y: 20,
            anchorX: 0.5,
            anchorY: 0.5
        });

        var menu = new cc.Menu(closeItem);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu, 1);

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        helloLabel = new cc.LabelTTF("To start, leave your finger\n in the circle", "Arial", 38);
        // position the label on the center of the screen
        helloLabel.x = size.width / 2;
        helloLabel.y = 0;
        // add the label as a child to this layer
        this.addChild(helloLabel, 5, TAG_LABEL_TITLE);

        // add "HelloWorld" splash screen"
        //this.sprite = new cc.Sprite(asset.HelloWorld_png);
        //this.sprite.attr({
        //    x: size.width / 2,
        //    y: size.height / 2,
        //    scale: 0.5,
        //    rotation: 180
        //});
        //this.addChild(this.sprite, 0);

        //this.sprite.runAction(
        //    cc.sequence(
        //        cc.rotateTo(2, 0),
        //        cc.scaleTo(2, 1, 1)
        //    )
        //);
        helloLabel.runAction(
            cc.spawn(
                cc.moveBy(2.5, cc.p(0, size.height - 40)),
                cc.tintTo(2.5,255,125,0)
            )
        );
        // end of 3
        
        if( 'touches' in cc.sys.capabilities ){
            cc.eventManager.addListener(cc.EventListener.create({
                event: cc.EventListener.TOUCH_ALL_AT_ONCE,
                onTouchBegan:function (touches, event) {
                    // write label
                    helloLabel.setString("pressed down");
                    if (touches.length <= 0)
                        return;
                    event.getCurrentTarget().moveFinger(touches[0].getLocation());
                },
                onTouchesMoved :function (touches, event) {
                    // write label
                    helloLabel.setString("pressed moved");
                    if (touches.length <= 0)
                        return;
                    event.getCurrentTarget().moveFinger(touches[0].getLocation());
                },
                onTouchesEnded :function (touches, event) {
                    // write label
                    helloLabel.setString("pressed ended");
                    if (touches.length <= 0)
                        return;
                    event.getCurrentTarget().releaseFinger(touches[0].getLocation());
                }
            }), this);
        }else if ('mouse' in cc.sys.capabilities ){
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseDown: function (event) {
                    // write label
                    helloLabel.setString("mouse ended");
                    event.getCurrentTarget().moveFinger(event.getLocation());
                },
                onMouseMove: function (event) {
                    // write label
                    helloLabel.setString("mouse moved");
                    event.getCurrentTarget().moveFinger(event.getLocation());
                },
                onMouseUp: function (event) {
                    // write label
                    helloLabel.setString("mouse down");
                    event.getCurrentTarget().releaseFinger(event.getLocation());
                }
            }, this);
        }
        var sprite = new cc.Sprite("asset/target2.png");
        
        var layer = new cc.LayerColor(cc.color(130, 130, 0, 100));
        this.addChild(layer, -1);
        
        this.addChild(sprite, 0, TAG_SPRITE_FINGER);
        sprite.x = size.width / 2;
	    sprite.y = size.height / 2;

        //sprite.runAction(cc.jumpTo(4, cc.p(300, 48), 100, 4));
        
        var fadeIn = cc.fadeIn(1);
        var fadeOut = cc.fadeOut(1);
        var forever = cc.sequence(fadeIn, fadeOut).repeatForever();
        layer.runAction(forever);
        return true;
    },
    moveSprite:function(position) {
        var sprite = this.getChildByTag(TAG_SPRITE_FINGER);
        sprite.stopAllActions();
        sprite.runAction(cc.moveTo(1, position));
        var o = position.x - sprite.x;
        var a = position.y - sprite.y;
        var at = Math.atan(o / a) * 57.29577951;  // radians to degrees

        if (a < 0) {
            if (o < 0)
                at = 180 + Math.abs(at);
            else
                at = 180 - Math.abs(at);
        }

        sprite.runAction(cc.rotateTo(1, at));
    },
    moveFinger:function(position) {
        switch(state) {
            case STATE_WAIT_FIRST_FINGER://
                // test if finger moved to the initial circle
                // start count down animation
                // goto STATE_COUNT_DOWN
                break;
            case STATE_COUNT_DOWN://
                // test if finger moved OUT OF the initial circle
                // it's too early, back to STATE_WAIT_FIRST_FINGER
                
                // this state normally ends by itself when the count down (+ random time) is over 
                break;
            case STATE_TARGET_APPEARS://
                // test if finger moved OUT OF the Move detection trigger circle
                // record reaction time
                // goto STATE_USER_MOVE_STARTED
                
                // update cursor position anyway
                var sprite = this.getChildByTag(TAG_SPRITE_FINGER);
                sprite.x = position.x;
                sprite.y = position.y;
                
                break;
            case STATE_USER_MOVE_STARTED://
                // the actual move already started dince STATE_TARGET_APPEARS
                // test if move ended (collision with target)
                // record exercise time
                
                // if amount exercise done == maximum (series of exercises is finished)
                // goto STATE_DISPLAY_VERDICT
                
                // esle (of if amount exercise done == maximum (series of exercises is finished))
                // increment amount exercise done
                // goto STATE_USER_MOVE_ENDED_SUCCESS
                
                //update cursor position anyway
                var sprite = this.getChildByTag(TAG_SPRITE_FINGER);
                sprite.x = position.x;
                sprite.y = position.y;
                break;
            case STATE_USER_MOVE_ENDED_SUCCESS://
                // no cursor here (TODO : can make it disappear)
                break;
            case STATE_WAIT_FIRST_FINGER_DISPLAY_SCORE://
                // test if finger moved to the initial circle
                // start count down animation
                // goto STATE_COUNT_DOWN
                break;
            case STATE_DISPLAY_VERDICT:
                // no cursor here
                break;
            default:
                // do nothing
        }
    },
    releaseFinger:function(position) {
        switch(state) {
            case STATE_WAIT_FIRST_FINGER:
                // no thing to do, keep waiting
                break;
            case STATE_COUNT_DOWN://
                // cancel count down
                
                // back to STATE_WAIT_FIRST_FINGER
                state = STATE_WAIT_FIRST_FINGER;
                break;
            case STATE_TARGET_APPEARS://
                // cancel target
                // forget start time
                
                // reset cursor position
                var sprite = this.getChildByTag(TAG_SPRITE_FINGER);
                sprite.x = size.width / 2;
	            sprite.y = size.height / 2;
                break;
            case STATE_USER_MOVE_STARTED://
                // cancel target
                // forget start time
                // forget reaction time
                
                // reset cursor position
                var sprite = this.getChildByTag(TAG_SPRITE_FINGER);
                sprite.x = size.width / 2;
	            sprite.y = size.height / 2;
                break;
            case STATE_USER_MOVE_ENDED_SUCCESS:
                // no cursor here (TODO : can make it disappear)
                break;
            case STATE_WAIT_FIRST_FINGER_DISPLAY_SCORE:
                // no cursor here (TODO : can make it disappear)
                break;
            case STATE_DISPLAY_VERDICT:
                // no cursor here (TODO : can make it disappear)
                break;
            default:
                // do nothing
        }
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});
