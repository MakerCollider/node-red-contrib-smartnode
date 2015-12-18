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
    function lineTrack(config) {
        RED.nodes.createNode(this, config);
        this.digitalPin = config.digitalPin;
        this.interval = config.interval;
        var node = this;
        
        var myinterval=null;
        var is_on = 0;
        node.digitalPin = node.digitalPin>>>0;
        var key = 'P'+node.digitalPin;
        if (checkPin.getDigitalPinValue(key)==1){
            node.status({fill: "red", shape: "dot", text: "pin repeat"});
            console.log('Line Tracking digital pin ' + node.digitalPin +' repeat');
            return;
        }
        else if (checkPin.getDigitalPinValue(key)==0){
            checkPin.setDigitalPinValue(key, 1);
            node.status({fill: "blue", shape: "ring", text: "pin check pass"});
            console.log('Line Tracking digital pin ' + node.digitalPin +' OK');
        }
        else{
            node.status({fill: "blue", shape: "ring", text: "Unknown"});
            console.log('unknown pin' + node.digitalPin + ' key value' + checkPin.getDigitalPinValue(key));
            return;
        }
		var gpio = new m.Gpio(node.digitalPin);
		gpio.dir(m.DIR_IN);
		this.on('input', function(msg){
			if (msg.payload==1)
			{
			    myinterval = setInterval(function() {
                               var myDigitalValue =  gpio.read();
                               node.status({fill: "green", shape: "dot", text: "Line Tracking return "+ myDigitalValue});     
                               msg = {payload: myDigitalValue};
                               node.send(msg);
			    },node.interval);
			}
			else if (msg.payload==0)
			{
		            clearInterval(myinterval);
			}
		});	
		
        this.on('close', function() {
                clearInterval(myinterval);
              checkPin.initDigitalPin();  //init pin
        });	
   
    }


    RED.nodes.registerType("LineTrack", lineTrack);
}

