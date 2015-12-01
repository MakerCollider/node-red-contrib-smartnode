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

    var jslib = require('jsupm_facedetect');
    function faceDetect(config) {
        var node = this;
        node.log("Face detect initalizing.......");
        RED.nodes.createNode(this, config);
        var facedetect = new jslib.CfaceDetect();
        facedetect.initFaceDetect();

        node.log("Face detect prepared.");
        node.status({fill:"green",shape:"dot",text:"Running"});

        //Handle inputs
        node.on('input', function(msg) {
            if((typeof msg.imagePtr) != "string")
            {
                this.log("Input Error!");
                node.status({fill:"red", shape:"dot", text:"InputError"});
            }
            else
            {
                var faceNumber = facedetect.noderedDetect(msg.imagePtr);
                var msg1 = {payload: faceNumber};
                var msg2 = {imagePtr: facedetect.m_outputString};
                node.send([msg1, msg2]);
            }
        });

        node.on('close', function() {
            node.log("Stop FaceDetect");
        });
    }
    RED.nodes.registerType("FaceDetect", faceDetect);
}
