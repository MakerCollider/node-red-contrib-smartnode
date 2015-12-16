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
    var m = require('mraa');
    function breathLed(config) {
        RED.nodes.createNode(this, config);
        this.pwmPin = config.pwmPin;
        this.interval = config.interval;
        var node = this;
        
        var myinterval=null;
        var is_on = 0;
        node.pwmPin = node.pwmPin>>>0;
        var key = 'P'+node.pwmPin;
        if (checkPin.getDigitalPinValue(key)==1){
            node.status({fill: "red", shape: "dot", text: "pin repeat"});
            console.log('LED breathing pwm pin ' + node.pwmPin +' repeat');
            return;
        }
        else if (checkPin.getDigitalPinValue(key)==0){
            checkPin.setDigitalPinValue(key, 1);
            node.status({fill: "blue", shape: "ring", text: "pin check pass"});
            console.log('LED breathing pwm pin ' + node.pwmPin +' OK');
        }
        else{
            node.status({fill: "blue", shape: "ring", text: "Unknown"});
            console.log('unknown pin' + node.pwmPin + ' key value' + checkPin.getDigitalPinValue(key));
            return;
        }
		var pwm = new m.Pwm(node.pwmPin);
		pwm.enable(true);
		this.on('input', function(msg){
			if (msg.payload==1)
			{
			    var i = 0;
			    myinterval = setInterval(function() {
               if(i>=1) is_on = 1;        
               if(i<0)  is_on = 0;
               if(is_on) 
                      i=i-0.01;
               else   
                      i=i+0.01;
               pwm.write(i);
			    },node.interval/100);
			}
			else if (msg.payload==0)
			{
               pwm.write(0);
				clearInterval(myinterval);
			}
		});	
		
        this.on('close', function() {
                clearInterval(myinterval);
              checkPin.initDigitalPin();  //init pin
        });	
   
    }


    RED.nodes.registerType("BreathLed", breathLed);
}

