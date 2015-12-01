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
module.exports = function(RED){ 
    var checkPin = require("../../extends/check_pin");
    var groveSensor = require("jsupm_grove");
    function brightness(config) {
        RED.nodes.createNode(this, config);
        this.analogPin = config.analogPin;
        this.interval = config.interval;
        var node = this;
        node.analogPin = node.analogPin>>>0;
        
        var key = 'P'+node.analogPin;
        if (checkPin.getAnalogPinValue(key)==1){
            node.status({fill: "red", shape: "dot", text: "pin repeat"});
            console.log('Light sensor analog pin ' + node.analogPin +' repeat');
            return;
        }
        else if (checkPin.getAnalogPinValue(key)==0){
            checkPin.setAnalogPinValue(key, 1);
            node.status({fill: "blue", shape: "ring", text: "pin check pass"});
            console.log('Light sensor analog pin ' + node.analogPin +' OK');
        }
        else{
            node.status({fill: "blue", shape: "ring", text: "Unknown"});
            console.log('unknown pin' + node.analogPin + ' key value' + checkPin.getAnalogPinValue(key));
            return;
        }

        var is_on = false;
        var waiting;
        var light = new groveSensor.GroveLight(node.analogPin);
        this.on('input', function(msg) {
            //use 'injector' node and pass string to control virtual node
            var payload = msg.payload>>>0;
            console.log("recv msg: " + payload);
            if (payload) {
                //switch on
                if (is_on == false) {
                    is_on = true;
                    waiting = setInterval(readlightvalue,node.interval);
                }
            }//switch off
            else {
                if (is_on == true) {
                    is_on = false;
                    node.status({fill: "red", shape: "ring", text: "no signal"});
                    clearInterval(waiting);
                }
            }
        });
        this.on('close', function() {
                clearInterval(waiting);
            checkPin.initAnalogPin();  //init pin
        });
    	function readlightvalue()
    	{
    		var celLight = light.value();
                node.status({fill: "red", shape: "dot", text: "light value is " + celLight + " lux"});
                console.log("light value is " + celLight);
    		var msg = { payload:celLight };
    		node.send(msg);
    	}
    }
    RED.nodes.registerType("Brightness", brightness);
}
