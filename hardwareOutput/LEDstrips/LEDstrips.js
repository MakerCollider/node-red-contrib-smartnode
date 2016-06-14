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
    RED.nodes.registerType("LEDstrips", LEDstrips);
    var mraa = require("mraa");

    function LEDstrips(config) {
        RED.nodes.createNode(this, config);
	    this.mode=config.mode;
        var node = this;
       
        uart = new mraa.Uart(0);
        uart.setBaudRate(115200);
        uart.setMode(8,0,1);
        var intervalID;
        var color;
        var count = 0;
        var is_on = false;
        this.on('input', function(msg) {
            switch(node.mode>>>0){
                case 0: flash(msg);
                    break;
                case 1: controllable(msg);
                    break;
                default:break;
            }
        });
        this.on('close', function() {
            clearInterval(intervalID);
        });
        function controllable(msg){
            var buf = new Buffer(3);
            buf[0]=1;
            buf[1]=Number(msg.which);
            buf[2]=Number(msg.payload);
            uart.write(buf);
        }
        function flash(msg) {
            if ((msg.payload > 0)){     
                color = Number(msg.payload);
                if(!is_on) {
                    is_on = true; 
                    console.log("turn on");
                    node.status({fill:"green",shape:"dot",text:"turn on"});
                    intervalID = setInterval(flashMode,200);
                }     
            }
            else {
                if(is_on){
                    is_on = false;
                    clearInterval(intervalID);
                    for(var i=0;i<16;i++)
                    {
                        var buf = new Buffer(3);
                        buf[0]=1;
                        buf[1]=i;
                        buf[2]=0;
                        uart.write(buf);
                        }
                    console.log("turn off");
                    node.status({fill: "red",shape: "dot",text: "turn off"});        
                }
            }      
        }
        var count =0;
        function flashMode()
        {
            
            var buf = new Buffer(3);
            if(count==0){
                buf[0]=1;buf[1]=7;buf[2]=0;
            }
            else{
                buf[0]=1;buf[1]=count-1;buf[2]=0;
            }
            uart.write(buf);
            buf[0]=1;
            buf[1]=count;
            buf[2]=color;
            uart.write(buf);
            if (count<7) count++;
            else          count=0;
        }
    }
    
}
