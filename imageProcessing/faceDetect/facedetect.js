/**
 * Copyright 2015, 2015 MakerCollider.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
module.exports = function(RED) {
    'use strict';
    var binary = require('node-pre-gyp');
    var path = require('path');
    var binding_path = binary.find(path.resolve(path.join(__dirname, '../../package.json')));
    var sn_addon = require(binding_path);
    function faceDetect(config) {
        var node = this;
        node.log("FaceDetect initalizing.......");
        RED.nodes.createNode(this, config);

        var facedetect = new sn_addon.FaceDetect();
        facedetect.initFaceDetect(path.resolve(path.join(__dirname,
                                    '../../lib/haarcascade/haarcascade_frontalface_alt.xml')));

        node.log("FaceDetect prepared.");
        node.status({fill:"green",shape:"dot",text:"Running"});

        //Handle inputs
        node.on('input', function(msg) {
            if(msg.topic === "imageStr" && ((typeof msg.payload) != "string"))
            {
                this.log("Input Error!");
                node.status({fill:"red", shape:"dot", text:"InputError"});
            }
            else
            {
                var faceResult = facedetect.detect(msg.payload);
                var msg1 = {topic: "faceNumber", payload: faceResult.result};
                var msg2 = {topic: "imageStr", payload: faceResult.imageStr};
                node.send([msg1, msg2]);
            }
        });

        node.on('close', function() {
            node.log("Stop FaceDetect");
        });
    }
    RED.nodes.registerType("FaceDetect", faceDetect);
}
