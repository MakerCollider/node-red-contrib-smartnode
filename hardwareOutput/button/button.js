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
    function button(config) {
        RED.nodes.createNode(this, config);
        this.digitalPin = config.digitalPin;
        this.impulse = config.impulse;
        var node = this;
        var buttonValue = null;
        node.digitalPin = node.digitalPin>>>0;
        var key = 'P'+node.digitalPin;
        if (checkPin.getDigitalPinValue(key)==1){
            node.status({fill: "red", shape: "dot", text: "pin repeat"});
            console.log('Button digital pin ' + node.digitalPin +' repeat');
            return;
        }
        else if (checkPin.getDigitalPinValue(key)==0){
            checkPin.setDigitalPinValue(key, 1); 
            node.status({fill: "blue", shape: "ring", text: "pin check pass"});
            console.log('Button digital pin ' + node.digitalPin +' OK');
        }
        else{
            node.status({fill: "blue", shape: "ring", text: "Unknown"});  
            console.log('unknown pin' + node.digitalPin + ' key value' + checkPin.getDigitalPinValue(key));   
            return; 
        }        

        var button = new groveSensor.GroveButton(node.digitalPin);                 
	var myinterval = setInterval(readButtonValue,100);
        this.on('close', function() {
                clearInterval(myinterval);
            onOffStatus = 0;                                          
                var msg = { payload:0 };                                  
                //send the result                                         
                node.status({fill: "red", shape: "ring", text: "turn off"});
                node.send(msg);
            checkPin.initDigitalPin();  //init pin 
        });	
    var count;
    var lastStatus = 0;
    function readButtonValue(){
	buttonValue = button.value();
        if(1 == buttonValue){
            count++;
        }else {
            count = 0;
            if(lastStatus != 0)
            {                  
                var msg = { payload:0 };            
                //send the result  
                node.status({fill: "red", shape: "ring", text: "turn off"});                 
                node.send(msg);                        
                lastStatus = 0;
            }
        }
        if(count >= (config.impulse/100))
        {
            if(lastStatus != 1)
            {
                var msg = { payload:1 };            
                //send the result  
                node.status({fill: "red", shape: "dot", text: "turn on"}); 
                node.send(msg);                     
                lastStatus = 1;
            }
        }
    }
    }
    RED.nodes.registerType("Button", button);
}
