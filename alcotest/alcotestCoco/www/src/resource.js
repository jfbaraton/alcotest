var asset = {
    HelloWorld_png : "asset/HelloWorld.jpg",
    Group30_png : "asset/group30.png",
    Group30Selected_png : "asset/group30Selected.png",
    Target_png : "asset/target3.png",
    Cursor_png : "asset/target2.png",
    CloseNormal_png : "asset/CloseNormal.png",
    CloseSelected_png : "asset/CloseSelected.png"
};

var g_resources = [];
for (var i in asset) {
    g_resources.push(asset[i]);
}
