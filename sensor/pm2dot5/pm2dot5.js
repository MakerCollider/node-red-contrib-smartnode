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

    var mraa = require('mraa');
    var Buffer = require('Buffer');

    function pm2_5(config) {
        node = this;
        this.log("Edison serial initalizing.......");
        RED.nodes.createNode(this, config);

        this.serialport = config.serialport;
        this.serialbaud = 9600;
        this.databits = 8;
        this.parity = 0;
        this.stopbits = 1;

        this.log("Port : " + config.serialport);
        this.log("Baud : " + this.serialbaud);
        this.log("Databits : " + this.databits);
        this.log("Parity : " + this.parity);
        this.log("Stopbits : " + this.stopbits);

        var serial;

        var msg1PM0_1;
        var msg2PM2_5;
        var msg3PM10;
        var buf = new Buffer(32);
        var length = 0; 
        function serialTimer(){
            if(serial.dataAvailable()){
                var temp = serial.readStr(200);
                buf.fill(0);
                length = buf.write(temp);
                node.log("Receive Message: " + buf);
                node.log("length = "+ length);
                if(checkValue())
                {
                    msg1PM0_1 = {payload:buf.readUInt16BE(4)};
                    msg2PM2_5 = {payload:buf.readUInt16BE(6)}; 
                    msg3PM10 = {payload:buf.readUInt16BE(8)}; 
                    node.send([msg1PM0_1, msg2PM2_5, msg3PM10]);
                } else {
                    node.log("Receive Error Msg!");
                }
            }
        }

        function checkValue(){
            var checksum = 0;
            var checksumExp = 0;
            var i;
            //for test
 //           return 1;
            if(buf[0] != 0x42 || buf[1] != 0x4d)
                return 0;
            if(length < 32)
                return 0;
            for(i = 0; i < 32; i++)                            
            {                                                            
                //node.log("0x"+buf.toString("HEX",i,i+1)); 
                node.log(buf[i]);   
            } 
            //var length = buf.readUInt16BE(2);
            var checksumExp = buf.readUInt16BE(length-2);
            for(i = 0; i < buf.length-2; i++)
            {
                //node.log(buf[i]);
                checksum += buf[i];
            }
            checksum = checksum & 0x0000ffff;
            node.log("checksumExp = "+ checksumExp + "; checksum = " + checksum);
            if(checksum !== checksumExp)
                return 0;
            else
                return 1;
        }
        
        this.status({fill:"blue",shape:"dot",text:"Initalized"});
        var timer = null;
        //Handle inputs
        this.on('input', function(msg) {
            if(msg.payload == 1)
            {
                serial = new mraa.Uart(0);               
                                                     
                serial.setBaudRate(this.serialbaud);         
                serial.setMode(this.databits, this.parity, this.stopbits);
                timer = setInterval(serialTimer, 10); 
                this.status({fill:"blue",shape:"dot",text:"Reading PM2.5 data..."});
            } else {
                clearInterval(timer); 
                delete serial;
                this.status({fill:"green",shape:"ring",text:"PM2.5 Sensor closed..."}); 
            }
        });

        this.on('close', function() {
            clearInterval(timer);
	    delete serial;
            this.status({fill:"green",shape:"ring",text:"PM2.5 Sensor closed..."}); 
            this.log("Stop Serial");
        });
    }
    RED.nodes.registerType("PM2.5", pm2_5);
}
