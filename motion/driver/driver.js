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
    var jslib = require('jsupm_ojl298');

    function driver(config) {
        this.log("Driver initalizing.......");
        RED.nodes.createNode(this, config);
        this.lpwm = 6;
        this.ldir = 7;
        this.rpwm = 5;
        this.rdir = 4;
        this.speed = Number(config.speed);
        this.timeout = Number(config.timeout);
        this.dir = "Stop";
        this.injectType = config.injectType;
        this.forwardsKey = config.forwardsKey;
        this.forwardsValue = config.forwardsValue;
        this.backKey = config.backKey;
        this.backValue = config.backValue;
        this.leftKey = config.leftKey;
        this.leftValue = config.leftValue;
        this.rightKey = config.rightKey;
        this.rightValue = config.rightValue;
        var node = this;

        var lmotor = new jslib.OJL298(node.lpwm, node.ldir);
        var rmotor = new jslib.OJL298(node.rpwm, node.rdir);
        lmotor.speed = node.speed;
        rmotor.speed = node.speed;
        lmotor.timeout = node.timeout;
        rmotor.timeout = node.timeout;

        this.log("Driver prepared.");
        this.log("Driver pwm : " + node.lpwm + " " + node.rpwm);
        this.log("Driver dir : " + node.ldir + " " + node.rdir);
        this.log("Default speed : " + node.speed);
        this.log("Default timeout : " + node.timeout);
        this.status({fill:"blue",shape:"dot",text:"Initalized"});

        //Handle inputs
        this.on('input', function(msg) {
            if(node.speed)
            {
                node.speed = Number(node.speed);
                lmotor.speed = node.speed;
                rmotor.speed = node.speed;
            }

            var output_key = 'payload';
            var direction = 0; //stop
            if (node.injectType == 1){ //Remoter
                if (msg.hasOwnProperty("KEY")){
                    var keys = msg.KEY;
                    for (var k in keys) {
                        if (keys.hasOwnProperty(k)) {
                            if (node.forwardsKey == k && node.forwardsValue == keys[k]){
                                direction = 1;
                                var data = {forwards:direction};
                                msg[output_key] = data;
                                node.send(msg);
                            }
                            if (node.backKey == k && node.backValue == keys[k]){
                                direction = 2;
                                var data = {backwards:direction};
                                msg[output_key] = data;
                                node.send(msg);
                            }
                            if (node.leftKey == k && node.leftValue == keys[k]){
                                direction = 3;
                                var data = {leftwards:direction};
                                msg[output_key] = data;
                                node.send(msg);
                            }
                            if (node.rightKey == k && node.rightValue == keys[k]){
                                direction = 4;
                                var data = {rightwards:direction};
                                msg[output_key] = data;
                                node.send(msg);
                            }
                        }
                    }
                }
            }
            else{ //default
                if (msg.hasOwnProperty("payload")){
                    var re = /^[1-9]+[0-9]*]*$/; //positive integer
                    re.test(msg.payload)? direction = msg.payload : direction = 0;
                    var data = {direction:direction};
                    msg[output_key] = data;
                    node.send(msg);
                }
            }


            if(direction){
                switch(Number(direction)){
                    case 1:
                        node.dir = "Forward";
                        lmotor.direction = 0;
                        rmotor.direction = 1;
                        break;
                    case 2:
                        node.dir = "Backward";
                        lmotor.direction = 1;
                        rmotor.direction = 0;
                        break;
                    case 3:
                        node.dir = "Left";
                        lmotor.direction = 0;
                        rmotor.direction = 0;
                        break;
                    case 4:
                        node.dir = "Right";
                        lmotor.direction = 1;
                        rmotor.direction = 1;
                        break;
                    default:
                        node.dir = "Stop";
                        lmotor.direction = 2;
                        rmotor.direction = 2;
                        break;
                }
            }
            else{
                node.dir = "Stop";
                lmotor.direction = 2;
                rmotor.direction = 2;
            }

            lmotor.setMotion();
            rmotor.setMotion();
            this.status({fill:"green",shape:"dot",text:node.dir});
            this.log("Action: Speed " + node.speed + " Direction " + node.dir);
        });

        this.on('close', function() {
            this.log("Stop Driver");
            lmotor.stop();
            rmotor.stop();
        });
    }
    RED.nodes.registerType("Driver", driver);
}
