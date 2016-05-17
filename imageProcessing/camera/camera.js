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

module.exports = function (RED) {
    'use strict';
    var binary = require('node-pre-gyp');
    var path = require('path');
    var binding_path = binary.find(path.resolve(path.join(__dirname, '../../package.json')));
    var sn_addon = require(binding_path);
    function camera(config) {
        var node = this;
        node.log("Camera initalizing.......");
        RED.nodes.createNode(this, config);
        node.cameraId = Number(config.cameraId);
        node.frameConfig = Number(config.frameConfig);
        node.mode = Number(config.mode);
        node.timerVal = Number(config.timerVal);
        var timer;
        switch (Number(config.frameConfig)) {
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
        node.camera = new sn_addon.Camera(this.cameraId, node.weidth, node.height);
        if (node.mode === 1) {
            node.log("Picture mode!");
            //node.camera.stopCamera();
            if (node.camera.startCamera()) {
                node.status({fill: "blue", shape: "dot", text: "Ready"});
            } else {
                node.log("Cannot open camera!");
                node.status({fill: "red", shape: "dot", text: "Error"});
            }
        }

        function camera_timer() {
            var isVaild = true;
            if (node.camera.isOpened()) {
                var ptrString = node.camera.read();
                if (ptrString === "") {
                    isVaild = false;
                }
                var msg = {imagePtr: ptrString};
                node.send(msg);
            } else {
                isVaild = false;
            }
            if (!isVaild) {
                node.log("Camera unplugged");
                node.log("clear timer");
                clearInterval(node.timer);
                node.status({fill: "red", shape: "dot", text: "Unplugged"});
            }
        }

        node.log("Camera prepared.");
        node.status({fill: "blue", shape: "dot", text: "Initalized"});

        //Handle inputs
        node.on('input', function (msg) {
            if (node.mode === 0) {
                node.log("Video mode!");
                if (Number(msg.payload) == 1) {
                    if (!node.camera.isOpened()) {
                        node.log("Start Camera Timer.");
                        if (node.camera.startCamera()) {
                            node.timer = setInterval(camera_timer, node.timerVal);
                            node.status({fill: "green", shape: "dot", text: "Running"});
                        } else {
                            node.log("Cannot open camera!");
                            node.status({fill: "red", shape: "dot", text: "Error"});
                        }
                    }
                } else {
                    clearInterval(node.timer);
                    node.camera.stopCamera();
                    node.log("Stop Camera Timer.");
                    node.status({fill: "red", shape: "dot", text: "Stop"});
                }
            } else {
                //put write photo code here
                node.status({fill: "green", shape: "dot", text: "Shooting"});
                var isVaild = true;
                if (node.camera.isOpened()) {
                    var ptrString;
                    for (i = 0; i < 5; i += 1) {
                        ptrString = node.camera.shoot();
                    }
                    if (ptrString === "") {
                        isVaild = false;
                    } else {
                        msg = {imagePtr: ptrString};
                        var msg2 = {payload: "/home/root/shoot.png"};
                        node.send([msg, msg2]);
                        node.status({fill: "blue", shape: "dot", text: "Ready"});
                    }
                } else {
                    isVaild = false;
                }
                if (!isVaild) {
                    node.log("Camera unplugged");
                    node.status({fill: "red", shape: "dot", text: "Unplugged"});
                }
            }
        });

        node.on('close', function () {
            node.log("Stop Camera");
            clearInterval(node.timer);
            node.camera.stopCamera();
            node.status({fill: "red", shape: "dot", text: "Stop"});
        });
    }
    RED.nodes.registerType("Camera", camera);
};
