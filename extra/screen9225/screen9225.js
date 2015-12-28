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

    var jslib = require('jsupm_screenSpi9225');
    var exec = require('child_process').exec; 

    function screenC(config) {
        console.log("ScreenC initalizing.......");
        RED.nodes.createNode(this, config);
	    var node = this;

        var cmd = "echo on > /sys/devices/pci0000\:00/0000\:00\:07.1/power/control";
        exec(cmd, function(err,stdout,stderr) {
            if(err) {
                console.log("enable power control error:"+stderr);
            } else {
                console.log("enable power control ok");
            }
        }); 
    
        var screen = new jslib.ScreenSpi9225(9,14,15);
        screen.ILI9225GclearScreen(0x0000); 
        this.status({fill:"blue",shape:"dot",text:"Initalized"});
        
        //Handle inputs
        this.on('input', function(msg) {
            if((typeof msg.imagePtr) == "string"){
                //screen.ILI9225GclearScreen(0x0000);
                screen.ILI9225GfillRectA(msg.imagePtr);
                this.status({fill:"blue",shape:"dot",text:"Camera"});                
            } else if(msg.payload == 1) {
                //screen.ILI9225GclearScreen(0x0000);
                screen.ILI9225GfillRect(1);
                this.status({fill:"blue",shape:"dot",text:"happy!"});
            } else if (msg.payload == 0) {
                //screen.ILI9225GclearScreen(0x0000);
                screen.ILI9225GfillRect(0);                  
                this.status({fill:"blue",shape:"dot",text:"angry"});
            } else {
                //screen.ILI9225GclearScreen(0x0000);
                screen.ILI9225GfillRect(2);  
                this.status({fill:"blue",shape:"dot",text:"normal"});
            }
        });

        this.on('close', function() {
            console.log("Stop Screen");
            screen.ILI9225GclearScreen(0x0000); 
            delete screen; 
            this.status({fill:"red",shape:"ring",text:"closed"});
        });
    }
    RED.nodes.registerType("ScreenC", screenC);
}

