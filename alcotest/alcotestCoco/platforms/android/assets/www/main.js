/**
 * A brief explanation for "project.json":
 * Here is the content of project.json file, this is the global configuration for your game, you can modify it to customize some behavior.
 * The detail of each field is under it.
 {
    "project_type": "javascript",
    // "project_type" indicate the program language of your project, you can ignore this field

    "debugMode"     : 1,
    // "debugMode" possible values :
    //      0 - No message will be printed.
    //      1 - cc.error, cc.assert, cc.warn, cc.log will print in console.
    //      2 - cc.error, cc.assert, cc.warn will print in console.
    //      3 - cc.error, cc.assert will print in console.
    //      4 - cc.error, cc.assert, cc.warn, cc.log will print on canvas, available only on web.
    //      5 - cc.error, cc.assert, cc.warn will print on canvas, available only on web.
    //      6 - cc.error, cc.assert will print on canvas, available only on web.

    "showFPS"       : true,
    // Left bottom corner fps information will show when "showFPS" equals true, otherwise it will be hide.

    "frameRate"     : 60,
    // "frameRate" set the wanted frame rate for your game, but the real fps depends on your game implementation and the running environment.

    "id"            : "gameCanvas",
    // "gameCanvas" sets the id of your canvas element on the web page, it's useful only on web.

    "renderMode"    : 0,
    // "renderMode" sets the renderer type, only useful on web :
    //      0 - Automatically chosen by engine
    //      1 - Forced to use canvas renderer
    //      2 - Forced to use WebGL renderer, but this will be ignored on mobile browsers

    "engineDir"     : "frameworks/cocos2d-html5/",
    // In debug mode, if you use the whole engine to develop your game, you should specify its relative path with "engineDir",
    // but if you are using a single engine file, you can ignore it.

    "modules"       : ["cocos2d"],
    // "modules" defines which modules you will need in your game, it's useful only on web,
    // using this can greatly reduce your game's resource size, and the cocos console tool can package your game with only the modules you set.
    // For details about modules definitions, you can refer to "frameworks/cocos2d-html5/modulesConfig.json".

    "jsList"        : [
    ]
    // "jsList" sets the list of js files in your game.
 }
 *
 */
/* globals cc, g_resources, HelloWorldScene */
cc.game.onStart = function(){
    /**
     * Sets whether the engine modify the "viewport" meta in your web page.
     * It's enabled by default, we strongly suggest you not to disable it.
     * And even when it's enabled, you can still set your own "viewport" meta, it won't be overridden
     */
    cc.view.adjustViewPort(true);
    /**
     * Sets the resolution policy with designed view size in points.
     * The resolution policy include: 
     * [1] EXACT_FIT       Fill screen by stretch-to-fit: if the design resolution ratio of width to height is different from the screen resolution ratio, your game view will be stretched.
     * [2] NO_BORDER       Full screen without black border: if the design resolution ratio of width to height is different from the screen resolution ratio, two areas of your game view will be cut.
     * [3] SHOW_ALL        Full screen with black border: if the design resolution ratio of width to height is different from the screen resolution ratio, two black borders will be shown.
     * [4] FIXED_HEIGHT    Scale the content's height to screen's height and proportionally scale its width
     * [5] FIXED_WIDTH     Scale the content's width to screen's width and proportionally scale its height
     * See [official documentation](https://github.com/chukong/cocos-docs/blob/master/manual/framework/html5/v2/resolution-policy-design/en.md) for details
     */
    cc.view.setDesignResolutionSize(480, 800, cc.ResolutionPolicy.SHOW_ALL);
    /**
     * Sets whether resize canvas automatically when browser's size changed.
     */
    cc.view.resizeWithBrowserSize(true);
    
    // load resources defined in g_resources
    // see g_resources definition in www/src/resource
    cc.LoaderScene.preload(g_resources, function () {
        // load and run the HelloWorldScene
        // see www/src/app.js for definition
        cc.director.runScene(new HelloWorldScene());
    }, this);
};
cc.game.run();
