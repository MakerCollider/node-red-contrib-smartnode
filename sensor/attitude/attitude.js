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
    var sensorObj = require("jsupm_mpu9150");
    function attitude(config) {
        RED.nodes.createNode(this, config);
        this.interval = config.interval;
        var node = this;
        var is_on = false;
        var waiting;
        var sensor = new sensorObj.MPU60X0();
        sensor.init();                                       
        var x = new sensorObj.new_floatp();                  
        var y = new sensorObj.new_floatp();                  
        var z = new sensorObj.new_floatp();                  
        var x1 = new sensorObj.new_floatp();                 
        var y1 = new sensorObj.new_floatp();
        var z1 = new sensorObj.new_floatp();
        console.log("init done\n");
        this.on('input', function(msg) {
            //use 'injector' node and pass string to control virtual node
            var payload = msg.payload>>>0;
            console.log("recv msg: " + payload);
            if (payload) {
                //switch on
                if (is_on == false) {
                    is_on = true;
                    waiting = setInterval(readMpu6050Value,node.interval);
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
            node.status({fill: "red", shape: "ring", text: "no signal"});
            clearInterval(waiting);
        });
        function readMpu6050Value()
        {
            sensor.update();
            sensor.getAccelerometer(x, y, z);
            sensor.getGyroscope(x1, y1, z1);
            var tempe = sensor.getTemperature();
            var X = Math.floor(sensorObj.floatp_value(x));
            var Y = Math.floor(sensorObj.floatp_value(y)); 
            var Z = Math.floor(sensorObj.floatp_value(z)); 
            var X1 = Math.floor(sensorObj.floatp_value(x1)); 
            var Y1 = Math.floor(sensorObj.floatp_value(y1)); 
            var Z1 = Math.floor(sensorObj.floatp_value(z1)); 
            console.log("A("+X+","+Y+","+Z+"), G("+X1+","+Y1+","+Z1+"), T("+tempe+")");
            node.status({fill: "red", shape: "dot", text: "A("+X+","+Y+","+Z+"), G("+X1+","+Y1+","+Z1+"), T("+tempe+")"});
            var msg = { payload:X+","+Y+","+Z };
            var msg1 = { payload:X1+","+Y1+","+Z1 };
            var msg2 = { payload:tempe };
            node.send([msg, msg1, msg2]);
        }
    }
    RED.nodes.registerType("Attitude", attitude);
}
