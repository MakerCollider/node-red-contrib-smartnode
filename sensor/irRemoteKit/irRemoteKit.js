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
    var irm = require("jsupm_irRemote");
    function irRemoteKit(config) {
        RED.nodes.createNode(this, config);
        this.digitalPin = config.digitalPin;
        var node = this;
        node.digitalPin = node.digitalPin>>>0;
        var key = 'P'+node.digitalPin;
        if (checkPin.getDigitalPinValue(key)==1){
            node.status({fill: "red", shape: "dot", text: "pin repeat"});
            console.log('IrRemoteKit digital pin ' + node.digitalPin +' repeat');
            return;
        }
        else if (checkPin.getDigitalPinValue(key)==0){
            checkPin.setDigitalPinValue(key, 1);
            node.status({fill: "blue", shape: "ring", text: "pin check pass"});
            console.log('IrRemoteKit digital pin ' + node.digitalPin +' OK');
        }
        else{
            node.status({fill: "blue", shape: "ring", text: "Unknown"});
            console.log('unknown pin' + node.digitalPin + ' key value' + checkPin.getDigitalPinValue(key));
            return;
        }
        var is_on = false;
        var waiting;
        var ir = new irm.IrRemote(node.digitalPin);
        waiting = setInterval(readIrRemoteValue,10);

        this.on('close', function() {
            node.status({fill: "red", shape: "ring", text: "no signal"});
            clearInterval(waiting);
            checkPin.initDigitalPin();  //init pin
            ir.stopIrRemote();
        });
        var old_value = 0;
        var readCount = 0;
        function readIrRemoteValue()
        {
            var msg;
            var cmd;
            var value = ir.getIrCode();
            readCount++;
            switch(value)
            {
                case 0x0000:
                    return;

                case 0xff00:
                    cmd = "SHUTDOWN";
                    break;
                case 0xfe01:
                    cmd = "VOL+";
                    break;
                case 0xfd02:
                    cmd = "STOP";
                    break;
                case 0xfb04:
                    cmd = "LT";
                    break;
                case 0xfa05:
                    cmd = "PAUSE";
                    break;
                case 0xf906:
                    cmd = "RT";
                    break;
                case 0xf708:
                    cmd = "DOWN";
                    break;
                case 0xf609:
                    cmd = "VOL-";
                    break;
                case 0xf50a:
                    cmd = "UP";
                    break;
                case 0xf30c:
                    cmd = "0";
                    break;
                case 0xf20d:
                    cmd = "EQ";
                    break;
                case 0xf10e:
                    cmd = "ST/REPT";
                    break;
                case 0xef10:
                    cmd = "1";
                    break;
                case 0xee11:
                    cmd = "2";
                    break;
                case 0xed12:
                    cmd = "3";
                    break;
                case 0xeb14:
                    cmd = "4";
                    break;
                case 0xea15:
                    cmd = "5";
                    break;
                case 0xe916:
                    cmd = "6";
                    break;
                case 0xe718:
                    cmd = "7";
                    break;
                case 0xe619:
                    cmd = "8";
                    break;
                case 0xe51a:
                    cmd = "9";
                    break;
                default:
                    return;
            }
            if(old_value == value && readCount <=30)
            {
                console.log("repeat signal!");
                console.log(readCount);
            } else {
                old_value = value;
                readCount = 0;
                console.log("Received: "+ cmd);
                node.status({fill: "red", shape: "dot", text: "Received: " + cmd});
                msg = {payload: cmd};
                node.send(msg);
            }
            
        }
    }
    RED.nodes.registerType("IrRemoteKit", irRemoteKit);
}
