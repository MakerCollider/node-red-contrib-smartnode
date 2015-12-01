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
    var groveSensor = require("jsupm_th02");
    function temperatureHumidity(config) {
        RED.nodes.createNode(this, config);
        this.interval = config.interval;
        var node = this;
        var is_on = false;
        var waiting;
        var th02 = new groveSensor.TH02(0, 0x40);
        this.on('input', function(msg) {
            //use 'injector' node and pass string to control virtual node
            var payload = msg.payload>>>0;
            console.log("recv msg: " + payload);
            if (payload) {
                //switch on
                if (is_on == false) {
                    is_on = true;
                    waiting = setInterval(readvalue,node.interval);
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
        });
    	function readvalue()
    	{
            var temperature = th02.getTemperature();
            var humidity = th02.getHumidity();
            node.status({fill: "red", shape: "dot", text: "temperature is " + temperature + ", humidity is " + humidity});
    		var msg = { payload:temperature };
            var msg1 = { payload:humidity };
    		node.send([msg, msg1]);
    	}
    }
    RED.nodes.registerType("TemperatureHumidity", temperatureHumidity);
}
