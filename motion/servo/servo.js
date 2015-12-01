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
    var checkPin = require("../../extends/check_pin");
    var servoModule =require("jsupm_servo");
    function GroveServo(config) {
        RED.nodes.createNode(this, config);
        this.pwmPin = config.pwmPin;
        var node = this;
        node.pwmPin = node.pwmPin>>>0;
        var key = 'P'+node.pwmPin;
        if (checkPin.getDigitalPinValue(key)==1){
            node.status({fill: "red", shape: "dot", text: "pin repeat"});
            console.log('Servo pwm pin ' + node.pwmPin +' repeat');
            return;
        }
        else if (checkPin.getDigitalPinValue(key)==0){
            checkPin.setDigitalPinValue(key, 1);
            node.status({fill: "blue", shape: "ring", text: "pin check pass"});
            console.log('Servo pwm pin ' + node.pwmPin +' OK');
        }
        else{
            node.status({fill: "blue", shape: "ring", text: "Unknown"});
            console.log('unknown pin' + node.pwmPin + ' key value' + checkPin.getDigitalPinValue(key));
            return;
        }
        var servo = null;
        var angle = null;
        //pwmPin
        if(servo == null){
            if (node.pwmPin) {
                servo = new servoModule.ES08A(node.pwmPin);
                console.log("pin: " + node.pwmPin);
            } else {
                servo = new servoModule.ES08A(3);      
                console.log("defaulting to pin 3");
            }
        }
        this.on('input', function(msg) {
            console.log("input!");
            angle = msg.payload;
            angle = angle>>>0;
            
            servo.setAngle(angle);
            node.status({fill: "red", shape: "dot", text: "Servo move to " + angle});
            console.log("Set Angle to " + angle);

            //send the result
            var msg1 = { payload:angle };
            node.send(msg1);
        });

        //clean up when re-deploying
        this.on('close', function() {
            checkPin.initDigitalPin();  //init pin
        });
    } 
  
    RED.nodes.registerType("Servo", GroveServo);
}
