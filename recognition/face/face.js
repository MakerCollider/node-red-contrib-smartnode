module.exports = function(RED) {
    "use strict";
    var face = require('./faceApi');
    var client = require('./client');

    function FaceNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        this.on("input",function(msg) {
            if (msg.hasOwnProperty("payload")) {
                if (msg.payload) {
                    var imgPath = msg.payload;
                    var callBackFace = function callBackFace(info) {
                        console.log(info);
                        msg.payload = info;
                        node.send(msg);
                    }
                    client.getFace(imgPath,callBackFace);
                }
            }
        });
    }
    RED.nodes.registerType("face",FaceNode);
}
