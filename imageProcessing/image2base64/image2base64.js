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
    function image2base64(config) {
        var node = this;
        node.log("Geometry detect initalizing.......");
        RED.nodes.createNode(this, config);

        var img2base64 = new sn_addon.Image2base64();

        node.log("Geometry detect prepared.");
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
                var base64Str = img2base64.encode(msg.payload);
                var msg = {topic: "base64", payload: base64Str};
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("Image2base64", image2base64);
}
