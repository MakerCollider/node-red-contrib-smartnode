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
    var checkPin = require("node-red-contrib-smartnode/extends/check_pin");
    var groveSensor = require("jsupm_grove");
    function led(config) {
        RED.nodes.createNode(this, config);
        this.digitalPin = config.digitalPin;
        var node = this;
        
	   var myinterval=null;

        node.digitalPin = node.digitalPin>>>0;
        
        var key = 'P'+node.digitalPin;
        if (checkPin.getDigitalPinValue(key)==1){
            node.status({fill: "red", shape: "dot", text: "pin repeat"});
            console.log('LED digital pin ' + node.digitalPin +' repeat');
            return;
        }
        else if (checkPin.getDigitalPinValue(key)==0){
            checkPin.setDigitalPinValue(key, 1);
            node.status({fill: "blue", shape: "ring", text: "pin check pass"});
            console.log('LED digital pin ' + node.digitalPin +' OK');
        }
        else{
            node.status({fill: "blue", shape: "ring", text: "Unknown"});
            console.log('unknown pin' + node.digitalPin + ' key value' + checkPin.getDigitalPinValue(key));
            return;
        }

        var led = new groveSensor.GroveLed(node.digitalPin);  
        console.log("Init LED on digital pin "+ node.digitalPin);
		this.on('input', function(msg){
			if (msg.payload==1)
			{
                                console.log("LED ON");
				led.on();
			}			
			else if (msg.payload==0)
			{
                                console.log("LED OFF");
				led.off();
			}
		});	
		
        this.on('close', function() {
            led.off();
            checkPin.initDigitalPin();  //init pin
        });	
   
    }


    RED.nodes.registerType("Led", led);
}
