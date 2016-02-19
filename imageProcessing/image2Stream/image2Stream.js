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

    var jslib = require('jsupm_img2base64');
    function image2Stream(config) {
        var node = this;
        node.log("image2Stream initalizing.......");
        RED.nodes.createNode(this, config);
        var image2Stream = new jslib.Cimg2Base64();

        node.log("image2Stream prepared.");
        node.status({fill:"green",shape:"dot",text:"Running"});

        //Handle inputs
        node.on('input', function(msg) {
            if((typeof msg.imagePtr) != "string")
            {
                this.log("Input Error! Wrong Topic");
                node.status({fill:"red", shape:"dot", text:"InputError"});
            }
            else
            {
                var result = image2Stream.noderedBase64(msg.imagePtr);
                if(result == -1)
                {
                    this.log("Input Error! Wrong String Format");
                    node.status({fill:"red", shape:"dot", text:"WrongFormat"});                   
                }
                var msg1 = {payload: image2Stream.m_outputString};
                node.send(msg1);
            }
        });

        node.on('close', function() {
            node.log("Stop image2Stream");
        });
    }
    RED.nodes.registerType("Image2Stream", image2Stream);
}