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
    var mraa = require("mraa");
    function irSwitch(config) {
        RED.nodes.createNode(this, config);
        this.digitalPin = config.digitalPin;
        this.interval = config.interval;
        var node = this;

        node.digitalPin = node.digitalPin>>>0;
        var key = 'P'+node.digitalPin;
        if (checkPin.getDigitalPinValue(key)==1){
            node.status({fill: "red", shape: "dot", text: "pin repeat"});
            console.log('digital pin ' + node.digitalPin +' repeat');
            return;
        }
        else if (checkPin.getDigitalPinValue(key)==0){
            checkPin.setDigitalPinValue(key, 1);
            node.status({fill: "blue", shape: "ring", text: "pin check pass"});
            console.log('IrSwitch digital pin ' + node.digitalPin +' OK');
        }
        else{
            node.status({fill: "blue", shape: "ring", text: "Unknown"});
            console.log('unknown pin' + node.digitalPin + ' key value' + checkPin.getDigitalPinValue(key));
            return;
        }
        var is_on = false;
        var waiting;
        var irf = new mraa.Gpio(node.digitalPin);
        irf.dir(mraa.DIR_IN);
        this.on('input', function(msg) {
            //use 'injector' node and pass string to control virtual node
            var payload = msg.payload>>>0;
            console.log("recv msg: " + payload);
            if (payload) {
                //switch on
                if (is_on == false) {
                    is_on = true;
                    waiting = setInterval(readirvalue,node.interval);
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
            checkPin.initDigitalPin();  //init pin 
        });
    	function readirvalue()
    	{
            var value = irf.read();
            node.status({fill: "red", shape: "dot", text: "IR Switch value is " + value});
            console.log("Ir Switch value is " + value);
    		var msg = { payload:value };
    		node.send(msg);
    	}
    }
    RED.nodes.registerType("IrSwitch", irSwitch);
}
