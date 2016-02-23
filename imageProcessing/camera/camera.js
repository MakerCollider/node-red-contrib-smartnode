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
    var domain = require('domain');

    var d = domain.create();

    d.on('error', function(e) {
        console.log("error in camera:", e);
    });
    var jslib = require('jsupm_camera');
    function camera(config) {
        var node = this;
        node.log("Camera initalizing.......");
        RED.nodes.createNode(this, config);
        node.cameraId = Number(config.cameraId);
        node.frameConfig = Number(config.frameConfig);
        node.mode = Number(config.mode);
        node.timerVal = Number(config.timerVal);
        var timer;
        switch (Number(config.frameConfig)){
            case 0:
                node.weidth = 160;
                node.height = 120;
                break;
            case 1:
                node.weidth = 320;
                node.height = 240;
                break;
            case 2:
                node.weidth = 640;
                node.height = 480;
                break;
            default:
                node.weidth = 160;
                node.height = 120;
        }
        var camera = new jslib.Camera(node.cameraId, node.weidth, node.height);
        if(node.mode == 1)
        {
            node.log("Picture mode!");
            camera.stopCamera();
            if(camera.startCamera())
            {
                node.status({fill:"blue",shape:"dot",text:"Ready"});
            }
            else
            {
                node.log("Cannot open camera!");
                node.status({fill:"red",shape:"dot",text:"Error"});
            }
        }

        function camera_timer(){
            var isVaild = true;
            if(camera.m_running){
                var ptrString = camera.read();
                if(ptrString == ""){
                    isVaild = false;
                }
                var msg =  {imagePtr:ptrString};
                node.send(msg);
            }
            else{
                isVaild = false;
            }
            
            if(!isVaild){
                node.log("Camera unplugged");
                clearInterval(node.timer);
                node.status({fill:"red", shape:"dot", text:"Unplugged"});
            }
        }

        node.log("Camera prepared.");
        node.status({fill:"blue",shape:"dot",text:"Initalized"});

        //Handle inputs
        node.on('input', function(msg) {
            d.run(function () {
                process.nextTick(function () {
                    if(node.mode == 0)
                    {
                        node.log("Video mode!");
                        if(Number(msg.payload) == 1)
                        {
                            node.log("Start Camera Timer.");
                            if(camera.startCamera())
                            {
                                setTimeout(function(){}, 500);
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
                        //throw new Error("exception in nextTick callback");
                    }
                    else
                    {
                        //put write photo code here
                        node.status({fill:"green",shape:"dot",text:"Shooting"});
                        var isVaild = true;
                        if(camera.m_running)
                        {
                            var ptrString;
                            for(i = 0; i< 5; i++)
                            {
                                ptrString = camera.shoot();
                            }
                            
                            if(ptrString == "")
                            {
                                isVaild = false;
                            }
                            else
                            {
                                msg =  {imagePtr:ptrString};
                                var msg2 = {payload:"/home/root/shoot.png"};
                                node.send([msg, msg2]);
                                node.status({fill:"blue",shape:"dot",text:"Ready"});
                            }
                        }
                        else
                        {
                            isVaild = false;
                        }
                        if(!isVaild)
                        {
                            node.log("Camera unplugged");
                            node.status({fill:"red", shape:"dot", text:"Unplugged"});
                        }
                    }
                });
            });
            
        });

        node.on('close', function() {
//            d.run(function () {
//                process.nextTick(function () {
                    //throw new Error("exception in nextTick callback");
                    node.log("Stop Camera");
                    clearInterval(node.timer);
                    camera.stopCamera();
                    node.status({fill:"red",shape:"dot",text:"Stop"});
//                });
//            });
        });
    }
    RED.nodes.registerType("Camera", camera);
}
