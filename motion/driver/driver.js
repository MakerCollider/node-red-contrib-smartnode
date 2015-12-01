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
        this.lpwm = Number(config.lpwm);
        this.ldir = Number(config.ldir);
        this.rpwm = Number(config.rpwm);
        this.rdir = Number(config.rdir);
        this.speed = Number(config.speed);
        this.timeout = Number(config.timeout);

        var lmotor = new jslib.OJL298(this.lpwm, this.ldir);
        var rmotor = new jslib.OJL298(this.rpwm, this.rdir);
        lmotor.speed = this.speed;
        rmotor.speed = this.speed;
        lmotor.timeout = this.timeout;
        rmotor.timeout = this.timeout;

        this.log("Driver prepared.");
        this.log("Driver pwm : " + this.lpwm + " " + this.rpwm);
        this.log("Driver dir : " + this.ldir + " " + this.rdir);
        this.log("Default speed : " + this.speed);
        this.log("Default timeout : " + this.timeout);
        this.status({fill:"blue",shape:"dot",text:"Initalized"});

        //Handle inputs
        this.on('input', function(msg) {
            if(msg.speed)
            {
                this.speed = Number(msg.speed);
                lmotor.speed = this.speed;
                rmotor.speed = this.speed;
            }

            if(msg.direction){
                switch(Number(msg.direction)){
                    case 0:
                        this.dir = "Forward";
                        lmotor.direction = 0;
                        rmotor.direction = 1;
                        break;
                    case 1:
                        this.dir = "Backward";
                        lmotor.direction = 1;
                        rmotor.direction = 0;
                        break;
                    case 2:
                        this.dir = "Left";
                        lmotor.direction = 0;
                        rmotor.direction = 0;
                        break;
                    case 3:
                        this.dir = "Right";
                        lmotor.direction = 1;
                        rmotor.direction = 1;
                        break;
                    default:
                        this.dir = "Stop";
                        lmotor.direction = 2;
                        rmotor.direction = 2;
                        break;
                }
            }

            lmotor.setMotion();
            rmotor.setMotion();
            this.status({fill:"green",shape:"dot",text:this.dir});
            this.log("Action: Speed " + this.speed + " Direction " + this.dir);
        });

        this.on('close', function() {
            this.log("Stop Driver");
            lmotor.stop();
            rmotor.stop();
        });
    }
    RED.nodes.registerType("Driver", driver);
}
