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
    var sensorModule = require('jsupm_ttp223');
    function touch(config) {
        RED.nodes.createNode(this, config);
        this.digitalPin = config.digitalPin;
        this.impulse = config.impulse;
        var node = this;
        var touchValue = null;
        node.digitalPin = node.digitalPin>>>0;
        var key = 'P'+node.digitalPin;
        if (checkPin.getDigitalPinValue(key)==1){
            node.status({fill: "red", shape: "dot", text: "pin repeat"});
            console.log('Touch digital pin ' + node.digitalPin +' repeat');
            return;
        }
        else if (checkPin.getDigitalPinValue(key)==0){
            checkPin.setDigitalPinValue(key, 1);
            node.status({fill: "blue", shape: "ring", text: "pin check pass"});
            console.log('Touch digital pin ' + node.digitalPin +' OK');
        }
        else{
            node.status({fill: "blue", shape: "ring", text: "Unknown"});
            console.log('unknown pin' + node.digitalPin + ' key value' + checkPin.getDigitalPinValue(key));
            return;
        }
        var touch = new sensorModule.TTP223(node.digitalPin);                 
	var myinterval = setInterval(readTouchValue,100);
        this.on('close', function() {
                clearInterval(myinterval);
            onOffStatus = 0;                                          
                var msg = { payload:0 };                                  
                //send the result                                         
                node.status({fill: "red", shape: "ring", text: "turn off"});
                node.send(msg);
                checkPin.initDigitalPin();  //init pin
        });	
    var count = 0;
    var onOffStatus = 0;
    function buttonDelay(inputValue){                                                     
        if(inputValue == 0)                                                              
        {                                                                                
            count = 0;                                                                   
            return 0;                                                                    
        }                                                                                
        else if(inputValue == 1 )                                                        
        {                                                                                
            count ++ ;                                                                   
        }                                                                                
        if(count == (node.impulse/100))                                                                  
            return 1;                                                                    
        else                                                                             
            return 0;                                                                    
    }     
    function readTouchValue(){
	touchValue = touch.isPressed();
        //hard code the interval to 100ms, count the configed times to trigger the button
        var val = buttonDelay(touchValue);
        if(val == 1)                             
        { 
            if(onOffStatus == 0)                                                                   
            {                                                                                      
                onOffStatus = 1;                                                                   
                var msg = { payload:1 };         
                //send the result                         
                node.status({fill: "red", shape: "dot", text: "turn on"}); 
                node.send(msg);                                                                           
            }                                                                                      
            else                                                                                   
            {                                                                                      
                onOffStatus = 0;                                                                   
                var msg = { payload:0 };                                                 
                //send the result
                node.status({fill: "red", shape: "ring", text: "turn off"});                  
                node.send(msg);                                                                         
            }    
        }
    }
    }
    RED.nodes.registerType("Touch", touch);
}
