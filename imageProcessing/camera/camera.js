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

    var jslib = require('jsupm_camera');
    function camera(config) {
        var node = this;
        node.log("Camera initalizing.......");
        RED.nodes.createNode(this, config);
        node.cameraId = Number(config.cameraId);
        node.frameConfig = Number(config.frameConfig);
        node.timerVal = Number(config.timerVal);
        var timer;
        switch (Number(config.frameConfig)){
            case 0:
                node.weidth = 320;
                node.height = 240;
                break;
            case 2:
                node.weidth = 1024;
                node.height = 768;
                break;
            default:
                node.weidth = 640;
                node.height = 480;
        }
        var camera = new jslib.Camera(node.cameraId, node.weidth, node.height);

        function camera_timer(){
        	var ptrString = camera.read();
            var msg =  {imagePtr:ptrString};
            node.send(msg);
        }

        node.log("Camera prepared.");
        node.status({fill:"blue",shape:"dot",text:"Initalized"});

        //Handle inputs
        node.on('input', function(msg) {
            if(Number(msg.payload) == 1)
            {
                node.log("Start Camera Timer.");
                if(camera.startCamera())
                {
                    node.timer = setInterval(camera_timer, node.timerVal);
                    node.status({fill:"green",shape:"dot",text:"Running"});
                }
                else
                {
                    node.log("Cannot open camera!");
                    node.status({fill:"red",shape:"dot",text:"Error"});
                }
            }
            else
            {
            	clearInterval(node.timer);
		camera.stopCamera();
                node.log("Stop Camera Timer.");
                node.status({fill:"red",shape:"dot",text:"Stop"});
            }
        });

        node.on('close', function() {
            node.log("Stop Camera");
	    clearInterval(node.timer);
            camera.stopCamera();
        });
    }
    RED.nodes.registerType("Camera", camera);
}
