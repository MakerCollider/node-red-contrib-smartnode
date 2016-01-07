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
    var m = require("mraa-makercollider");
    function pwmLed(config) {
      RED.nodes.createNode(this, config);
      this.pwmPin = config.pwmPin;
      var node = this;
      node.pwmPin = node.pwmPin>>>0;
      var key = 'P'+node.pwmPin;

        if (checkPin.getDigitalPinValue(key)==1){
            node.status({fill: "red", shape: "dot", text: "pin repeat"});
            console.log('PwmLED  pwm pin ' + node.pwmPin +' repeat');
            return;
        }
        else if (checkPin.getDigitalPinValue(key)==0){
            checkPin.setDigitalPinValue(key, 1);
            node.status({fill: "blue", shape: "ring", text: "pin check pass"});
        }
        else{
            node.status({fill: "blue", shape: "ring", text: "Unknown"});
            console.log('unknown pin' + node.pwmPin + ' key value' + checkPin.getDigitalPinValue(key));
            return;
        }

        var pwm;
        function setPwmto0(pin) {                                                                      
            var mraa =require("mraa-makercollider");                                                                 
            var exec = require('child_process').exec;                                                  
            var gpio = new mraa.Gpio(pin);                                                             
            var cmd1 = "echo " + pin + " > /sys/class/gpio/unexport";                                  
            var cmd2 = "echo " + pin + " > /sys/class/gpio/export";                                    
            gpio.dir(mraa.DIR_OUT);                                                                    
            exec(cmd1,0);                                                                              
            gpio.write(0);                                                                             
            exec(cmd2,0);                                                                            
        }
        this.on('input', function(msg){
          var pwmValue = parseInt(msg.payload);
          if (pwmValue>0)
          {
            if(pwmValue>255)
              pwmValue = 255;
            pwm = new m.Pwm(node.pwmPin);
            pwm.enable(true);
            pwm.write(pwmValue/255);
            console.log("pwm value is: "+pwmValue/255);
          }
          else if (pwmValue<=0)
          { 
            //pwm.write(0);
            setPwmto0(node.pwmPin);
          }
        });	
        this.on('close', function() {
            checkPin.initDigitalPin();  //init pin
            //pwm.write(0);
            setPwmto0(node.pwmPin);
        });	
      }
    RED.nodes.registerType("PwmLed", pwmLed);
}









