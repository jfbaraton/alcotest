var TAG_SPRITE_FINGER = 1; // finger
var TAG_SPRITE_TARGET = 2; // target
var TAG_LABEL_TITLE = 3; // title label
var TAG_COLOR_LAYER = 4; // color layer

var STATE_SPLASH_SCREEN = 1; // splash screen with explainations
var STATE_USER_DESCRIPTION = 3; // screen asking user's description

var STATE_WAIT_FIRST_FINGER = 10; // waiting for user to put finger on starting zone (circle in the middle of the screen)
var STATE_COUNT_DOWN = 20;        // displaying count down before target appears
var STATE_TARGET_APPEARS = 30;    // target apears, waiting for users move to start
var STATE_USER_MOVE_STARTED = 40; // user started to move (move crossed triggering circle)
var STATE_USER_MOVE_ENDED_SUCCESS = 50; // user move reached the target, application now does the math and decides betwen another testrun or a final score
var STATE_WAIT_FIRST_FINGER_DISPLAY_SCORE = 60; // waiting for user to put finger on starting zone + displaying score from previous attempt
var STATE_DISPLAY_VERDICT = 60; // waiting for user to put finger on starting zone (circle in the middle of the screen)

var state = STATE_WAIT_FIRST_FINGER; // initial state
var helloLabel;
var countDown = 3;

var exerciseStartDate; // when target appeared
var exerciseReactionDate; // when user started to move
var maxReactionTime =0;
var exerciseSuccessDate;  // when user reached target
var maxDistanceToPerfectTrajectory = 0;

var achievedExercises = 0; // amount of successfully achieved exercisesvar 
var unAchievedExercises = 0; // amount of unachieved exercises since last success
var EXERCISE_LIMIT = 3; // amount of exercise to accomplish to validate the test

var targetPosition = 4; // random target position 1=top left, 2 = top right, 3 = bottom left, 4 = bottom right
var JFbuffer = 0;
var now = new Date();
var sessionID = "appSession"+Sha1.hash(now.toISOString());
var serieID = "appSerie"+Sha1.hash(now.toISOString());
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

        // add a "close" icon to go to next exercise. it's an autorelease object
        var closeItem = new cc.MenuItemImage(
            asset.CloseNormal_png,
            asset.CloseSelected_png,
            function () {
                cc.log("Next exercise is clicked!");
                state =STATE_WAIT_FIRST_FINGER;
                
                var target = this.getChildByTag(TAG_SPRITE_TARGET);
                target.runAction(cc.hide());
                
                var colorLayer = this.getChildByTag(TAG_COLOR_LAYER);
                colorLayer.init(cc.color(130, 130, 0, 100));
                maxDistanceToPerfectTrajectory = 0;
                
                helloLabel.setString("Leave your finger\n in the circle");
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
        
        // add a "next user" icon to go to next user. it's an autorelease object
        var nextUserItem = new cc.MenuItemImage(
            asset.Group30_png,
            asset.Group30Selected_png,
            function () {
                cc.log("Next User is clicked!");
                now = new Date();
                serieID = "appSerie"+Sha1.hash(now.toISOString());
                sessionID = "appSession"+Sha1.hash(now.toISOString());
                
                achievedExercises = 0;
                maxReactionTime = 0;
                
                state =STATE_WAIT_FIRST_FINGER;
                
                var target = this.getChildByTag(TAG_SPRITE_TARGET);
                target.runAction(cc.hide());
                
                var colorLayer = this.getChildByTag(TAG_COLOR_LAYER);
                colorLayer.init(cc.color(130, 130, 0, 100));
                maxDistanceToPerfectTrajectory = 0;
                
                
                helloLabel.setString("Leave your finger\n in the circle");
            }, this);
        nextUserItem.attr({
            x: size.width/2,
            y: 20,
            anchorX: 0.5,
            anchorY: 0.5
        });

        var nextUserMenu = new cc.Menu(nextUserItem);
        nextUserMenu.x = 0;
        nextUserMenu.y = 0;
        this.addChild(nextUserMenu, 1);

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
                onTouchesBegan:function (touches, event) {
                    // write label
                    //helloLabel.setString("pressed down");
                    if (touches.length <= 0)
                        return;
                    event.getCurrentTarget().moveFinger(touches[0].getLocation());
                },
                onTouchesMoved :function (touches, event) {
                    // write label
                    //var squareDistance = Math.pow(touches[0].getLocation().x-size.width / 2,2)+Math.pow(touches[0].getLocation().y-size.height / 2,2);
                    //helloLabel.setString("pressed moved");
                    if (touches.length <= 0)
                        return;
                    event.getCurrentTarget().moveFinger(touches[0].getLocation());
                },
                onTouchesEnded :function (touches, event) {
                    // write label
                    //helloLabel.setString("pressed ended");
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
                    //helloLabel.setString("mouse ended");
                    event.getCurrentTarget().moveFinger(event.getLocation());
                },
                onMouseMove: function (event) {
                    // write label
                    //helloLabel.setString("mouse moved");
                    event.getCurrentTarget().moveFinger(event.getLocation());
                },
                onMouseUp: function (event) {
                    // write label
                    //helloLabel.setString("mouse down");
                    event.getCurrentTarget().releaseFinger(event.getLocation());
                }
            }, this);
        }
        
        // finger tracker circle
        var sprite = new cc.Sprite(asset.Cursor_png);
        
        var layer = new cc.LayerColor(cc.color(130, 130, 0, 100));
        this.addChild(layer, -1,TAG_COLOR_LAYER);
        
        this.addChild(sprite, 0, TAG_SPRITE_FINGER);
        sprite.x = size.width / 2;
        sprite.y = size.height / 2;
        
        // target
        var target = new cc.Sprite(asset.Target_png);
    
        
        targetPosition = Math.floor((Math.random() * 4) + 1); // random target position 1=top left, 2 = top right, 3 = bottom left, 4 = bottom right
        this.addChild(target, 0, TAG_SPRITE_TARGET);
        if(targetPosition %2 ===0){
            target.x = 40; // left
        }else{
            target.x = size.width-40; // right
        }
        if(targetPosition >2){
            target.y = size.height-100; // top
        }else{
            target.y = 100; // bottom
        }
        
        target.runAction(cc.hide());

        //sprite.runAction(cc.jumpTo(4, cc.p(300, 48), 100, 4));
        
        var fadeIn = cc.fadeIn(1);
        var fadeOut = cc.fadeOut(1);
        var forever = cc.sequence(fadeIn, fadeOut).repeatForever();
        layer.runAction(forever);
        
        
        // timer
        var oneSecUpdateRate = 1.0;
        this.schedule(this.updateCountDown, oneSecUpdateRate);
        
        // end of init
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
        
        var size = cc.winSize;
                
        var squareDistanceToOrigin = Math.pow(position.x-size.width / 2,2)+Math.pow(position.y-size.height / 2,2);
        var sprite = this.getChildByTag(TAG_SPRITE_FINGER);
        //sprite.x = position.x;
        //sprite.y = position.y;
        //var label = this.getChildByTag(TAG_LABEL_TITLE);
        //helloLabel.setString("squareDistance "+squareDistanceToOrigin);
        switch(state) {
            case STATE_WAIT_FIRST_FINGER://
                // test if finger moved to the initial circle
                if( squareDistanceToOrigin< 15*15){
                    // hide target
                    var target = this.getChildByTag(TAG_SPRITE_TARGET);
                    target.runAction(cc.hide());
                    
                    // start count down animation
                    helloLabel.setString("COUNT DOWN");
                    // goto STATE_COUNT_DOWN
                    state = STATE_COUNT_DOWN;
                }else{
                    //helloLabel.setString("squareDistance "+squareDistanceToOrigin/1);
                }
                break;
            case STATE_COUNT_DOWN://
                // test if finger moved OUT OF the initial circle
                if( squareDistanceToOrigin> 15*15){
                    
                    // it's too early, back to STATE_WAIT_FIRST_FINGER
                    //helloLabel.setString("BACK TO START");
                    unAchievedExercises ++;
                    state = STATE_WAIT_FIRST_FINGER;
                }
                
                // this state normally ends by itself when the count down (+ random time) is over 
                break;
            case STATE_TARGET_APPEARS://
                // test if finger moved OUT OF the Move detection trigger circle
                if( squareDistanceToOrigin> 15*15){
                    // it's too early, back to STATE_WAIT_FIRST_FINGER
                    
                    // record reaction time
                    exerciseReactionDate = new Date();
                    var reactionTime = Math.round((exerciseReactionDate.getTime()-exerciseStartDate.getTime())/10)/100.0;
                    if(maxReactionTime< reactionTime){
                        maxReactionTime = reactionTime;
                    }
                    helloLabel.setString("REACTION TIME \n"+reactionTime);
                    // goto STATE_USER_MOVE_STARTED
                    state = STATE_USER_MOVE_STARTED;
                }
                
                // update cursor position anyway
                sprite.x = position.x;
                sprite.y = position.y;
                
                break;
            case STATE_USER_MOVE_STARTED://
                var targetSprite = this.getChildByTag(TAG_SPRITE_TARGET);
                var squareDistanceToTarget = Math.pow(position.x-targetSprite.x,2)+Math.pow(position.y-targetSprite.y,2);
                
                // compute distance between finger position and line (shortest path) as an accuracy metric.
                // formula of distance between
                // a line defined by two points (A,B) and (C,D)
                // (in our case (size.width / 2,size.height / 2) and (targetSprite.x,targetSprite.y) )
                // and
                // a point (E,F)
                // (in our case (position.x,position.y) )
                // is
                //
                //        |(F-D)A - (E-C)B + ED-FC |
                //dist = ----------------------------
                //          sqrt((F-D)²+(E-C)²)
                //
                //
                var fractionUpperPart = Math.abs(
                    (position.y-targetSprite.y)*size.width / 2 - 
                    (position.x-targetSprite.x)*size.height / 2 +
                    position.x * targetSprite.y -
                    position.y * targetSprite.x
                ) ;
                var fractionLowerPart = Math.sqrt(
                    Math.pow((position.y-targetSprite.y),2)+
                    Math.pow((position.x-targetSprite.x),2)
                );
                
                var distanceToPerfectTrajectory = fractionUpperPart/fractionLowerPart;
                // the actual move already started since STATE_TARGET_APPEARS
                // test if move ended (collision with target)
                
                if(maxDistanceToPerfectTrajectory < distanceToPerfectTrajectory){
                    maxDistanceToPerfectTrajectory = distanceToPerfectTrajectory;
                }
                
                if(squareDistanceToTarget <= 15*15){
                    
                    helloLabel.setString("BRAVO !");
                    // record exercise time
                    exerciseSuccessDate = new Date();
                    var reactionSpeed = Math.round((exerciseReactionDate-exerciseStartDate)/10)/100.0;
                    var sucessSpeed = Math.round((exerciseSuccessDate-exerciseStartDate)/10)/100.0;
                    
                    //var recordURL = "http://iweb.inceptive.se:8282/alcotest/?sessionId=sessionId&originPointX=51&originPointY=51&targetPointX=52&targetPointY=52&startDate=2016-02-10T11:03:14.067Z&reactionDate=2016-02-10T11:03:15.068Z&sucessTime=2016-02-10T11:03:17.068Z&maxDistanceToTrajectory=11&minimumAssumedAlcoholInBlood=1.4&maximumAssumedAlcoholInBlood=1.6&serieId=serieId&amountOfFails=15";
                    var exerciseStartDateAsString = exerciseStartDate.toISOString();
                    var exerciseReactionDateAsString = exerciseReactionDate.toISOString();
                    var exerciseSuccessDateAsString = exerciseSuccessDate.toISOString();
                    
                    var exerciseStartDateAsStringWithoutZ = exerciseStartDateAsString.substring(0,exerciseStartDateAsString.length-1);
                    var exerciseReactionDateAsStringWithoutZ = exerciseReactionDateAsString.substring(0,exerciseReactionDateAsString.length-1);
                    var exerciseSuccessDateAsStringWithoutZ = exerciseSuccessDateAsString.substring(0,exerciseSuccessDateAsString.length-1);
                    
                    
                    var recordURL = "http://iweb.inceptive.se:8282/alcotest/?sessionId="+sessionID+
                        "&originPointX="+size.width / 2+
                        "&originPointY="+size.height / 2+
                        "&targetPointX="+targetSprite.x+
                        "&targetPointY="+targetSprite.y+
                        "&startDate="+exerciseStartDateAsStringWithoutZ+//"yyyy-MM-ddTHH:mm:ss.SSSZ"
                        "&reactionDate="+exerciseReactionDateAsStringWithoutZ+
                        "&sucessTime="+exerciseSuccessDateAsStringWithoutZ+
                        "&maxDistanceToTrajectory="+maxDistanceToPerfectTrajectory+
                        "&minimumAssumedAlcoholInBlood="+1.4+
                        "&maximumAssumedAlcoholInBlood="+1.6+
                        "&serieId="+serieID+
                        "&amountOfFails="+unAchievedExercises;
                    this.callHTPGet(recordURL);
                    
                    // increment amount exercise done
                    achievedExercises ++;
                    
                    if(achievedExercises >= 3){
                        // if amount exercise done == maximum (series of exercises is finished)
                        
                        // send result
                        
                        // change background according to verdict
                        
                        var colorLayer = this.getChildByTag(TAG_COLOR_LAYER);
                        if(maxReactionTime < 1.0){
                            colorLayer.init(cc.color(0, 130, 130, 100));
                            helloLabel.setString("SUCCESS ! "+reactionSpeed+"s-"+sucessSpeed+"s  ("+maxDistanceToPerfectTrajectory+")\n");
                        }else{
                            colorLayer.init(cc.color(200, 0, 0, 100));
                            helloLabel.setString("BE CAREFUL ! "+reactionSpeed+"s-"+sucessSpeed+"s ("+maxDistanceToPerfectTrajectory+")\n");
                        }
                        
                        // goto STATE_DISPLAY_VERDICT
                        state = STATE_DISPLAY_VERDICT;
                        
                        achievedExercises = 0;
                        maxReactionTime = 0;
                        maxDistanceToPerfectTrajectory = 0;
                        
                        now = new Date();
                        serieID = "appSerie"+Sha1.hash(now.toISOString());
                    }else{
                        // esle (of if amount exercise done == maximum (series of exercises is finished))
                        
                        // send result
                        
                        
                        // goto STATE_USER_MOVE_ENDED_SUCCESS
                        state = STATE_USER_MOVE_ENDED_SUCCESS;
                        helloLabel.setString("BRAVO ! "+reactionSpeed+"s-"+sucessSpeed+"s ("+maxDistanceToPerfectTrajectory+")\n");
                        maxDistanceToPerfectTrajectory = 0;
                    }
                    
                    unAchievedExercises = 0;
                    
                    sprite.x = size.width / 2;
                    sprite.y = size.height / 2;
                }else{
                    //update cursor position
                    sprite.x = position.x;
                    sprite.y = position.y;
                }
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
        var size = cc.winSize;
        switch(state) {
            case STATE_WAIT_FIRST_FINGER:
                // no thing to do, keep waiting
                break;
            case STATE_COUNT_DOWN://
                // cancel count down
                
                helloLabel.setString("Don't release your\nfinger, try again");
                unAchievedExercises++;
                // back to STATE_WAIT_FIRST_FINGER
                
                state = STATE_WAIT_FIRST_FINGER;
                break;
            case STATE_TARGET_APPEARS://
                // cancel target
                var target = this.getChildByTag(TAG_SPRITE_TARGET);
                target.runAction(cc.hide()); 
                
                // forget start time
                
                // reset cursor position
                var sprite = this.getChildByTag(TAG_SPRITE_FINGER);
                sprite.x = size.width / 2;
                sprite.y = size.height / 2;
                
                // back to STATE_WAIT_FIRST_FINGER
                helloLabel.setString("Don't release your\nfinger, try again");
                unAchievedExercises++;
                state = STATE_WAIT_FIRST_FINGER;
                break;
            case STATE_USER_MOVE_STARTED://
                // cancel target
                var targetSprite = this.getChildByTag(TAG_SPRITE_TARGET);
                targetSprite.runAction(cc.hide()); 
                // forget start time
                // forget reaction time
                
                // reset cursor position
                var fingerSprite = this.getChildByTag(TAG_SPRITE_FINGER);
                fingerSprite.x = size.width / 2;
                fingerSprite.y = size.height / 2;
                
                // back to STATE_WAIT_FIRST_FINGER
                helloLabel.setString("Don't release your\nfinger, try again");
                unAchievedExercises++;
                state = STATE_WAIT_FIRST_FINGER;
                break;
            case STATE_USER_MOVE_ENDED_SUCCESS:
                // no cursor here (TODO : can make it disappear)
                break;
            case STATE_WAIT_FIRST_FINGER_DISPLAY_SCORE:
                // no cursor here (TODO : can make it disappear)
                
                // hide target
                var targetSpriteToHide = this.getChildByTag(TAG_SPRITE_TARGET);
                targetSpriteToHide.runAction(cc.hide());
                break;
            case STATE_DISPLAY_VERDICT:
                // no cursor here (TODO : can make it disappear)
                
                // hide target
                var toHideTargetSprite = this.getChildByTag(TAG_SPRITE_TARGET);
                toHideTargetSprite.runAction(cc.hide());
                break;
            default:
                // do nothing
        }
    },
    updateCountDown : function (){// start timing exercise
        
        if(state == STATE_COUNT_DOWN){
            var size = cc.winSize;
            helloLabel.setString("TARGET COMING 3...2...1...");
            countDown --;
            if(countDown <= 0){ // when count down is over
                countDown = 3; // reset countdown for next time

                // start timing exercise
                exerciseStartDate = new Date();

                var target = this.getChildByTag(TAG_SPRITE_TARGET);
                targetPosition = Math.floor((Math.random() * 4) + 1); // random target position 1=top left, 2 = top right, 3 = bottom left, 4 = bottom right
                if(targetPosition %2 ===0){
                    target.x = 40; // left
                }else{
                    target.x = size.width-40; // right
                }
                if(targetPosition >2){
                   target.y = size.height-100; // top
                }else{
                   target.y = 100; // bottom
                }

                target.runAction(cc.show()); // display target
                state = STATE_TARGET_APPEARS; // go to state where target is visible and we wait for user to move toward it
                helloLabel.setString("Slide to the taget!");
            }
        }else{
            countDown = 3;
        }
    },
    callHTPGet : function(theUrl){
        helloLabel.setString("HTTP new");
        var xmlHttp = new XMLHttpRequest();
        helloLabel.setString("HTTP open");
        xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
        helloLabel.setString("HTTP send");
        xmlHttp.send( null );
        var response = xmlHttp.responseText;
        helloLabel.setString("HTTPr "+response.substring(JFbuffer, JFbuffer+30));
        JFbuffer = JFbuffer+30;
        return response;
    }/*,
    loadTweets : function() {
        var request = new XMLHttpRequest();
        request.open("GET", "http://search.twitter.com/search.json?q=phonegap", true);
        request.onreadystatechange = function() {//Call a function when the state changes.
           
        };
        console.log("asking for tweets");
        request.send();

        var response = xmlHttp.responseText;
        helloLabel.setString("HTTPr "+response.substring(JFbuffer, JFbuffer+30));
        JFbuffer = JFbuffer+30;
    }*/
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});
