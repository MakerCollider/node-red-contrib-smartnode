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
    var LCD = require("jsupm_i2clcd");
    function screen(config) {
        RED.nodes.createNode(this, config);
	    this.R=config.R;
        this.G=config.G;
        this.B=config.B;
        var node = this;
        
        node.R=node.R>>>0;
        node.G=node.G>>>0;
        node.B=node.B>>>0;
		var myLcd = new LCD.Jhd1313m1 (0, 0x3E, 0x62);
		myLcd.setColor(node.R,node.G,node.B); 
        this.on('input', function(msg){
            var inputStr = String(msg.payload);
            if(inputStr.length>16)
            {
                console.log("too long");
                myLcd.setCursor(0,0); 
                myLcd.write(inputStr.slice(0,16));
                console.log(inputStr.slice(0,16));
                if(inputStr.length>32)
                {
                    myLcd.setCursor(1,0);
                    myLcd.write(inputStr.substr(16,16));
                    console.log(inputStr.substr(16,16));
                }
                else {
                    myLcd.setCursor(1,0);
                    console.log("line two"+ inputStr);
                    myLcd.write(inputStr.slice(16));
                    console.log(inputStr.slice(16));
                }
            }
            else
            {
                myLcd.setCursor(0,0);
                myLcd.write(inputStr);
            }
        });
        this.on('close', function() {
            myLcd.clear();
        }); 
    }
    RED.nodes.registerType("Screen", screen);
}
