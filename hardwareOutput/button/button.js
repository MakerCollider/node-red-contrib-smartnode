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

module.exports = function (RED) {
    "use strict";
    //var checkPin = require("node-red-contrib-smartnode/extends/check_pin");
    var ArduinoFirmata = require('arduino-firmata');

    function button(config) {
        RED.nodes.createNode(this, config);
        this.digitalPin = config.digitalPin;
        this.impulse = config.impulse;
        var node = this;
        var flow = this.context().flow;

        if (!(flow.get('arduino') || 0)) {
            node.log('haha');
            node.arduino = new ArduinoFirmata().connect();
            flow.set('arduino', node.arduino);
            flow.set('arduinoCount', 1);
        } else {
            node.log('arduino exists');
            flow.set('arduinoCount', flow.get('arduinoCount') + 1);
            node.arduino = flow.get('arduino');
        }

        node.arduino.on('connect', function () {
            node.log("Connected to " + node.arduino.serialport_name);
            node.log("board version: " + node.arduino.boardVersion);

            node.status({fill: "blue", shape: "dot", text: "Ready"});

            node.arduino.pinMode(node.digitalPin, ArduinoFirmata.INPUT);

            node.arduino.on('digitalChange', function (arg) {
                node.log(node.digitalPin + ": " + arg.pin);
                if (Number(arg.pin) === Number(node.digitalPin)) {
                    if (Number(arg.value) === 1) {
                        node.status({fill: "green", shape: "dot", text: "turn on"});
                    } else {
                        node.status({fill: "red", shape: "dot", text: "turn off"});
                    }
                    var msg = {payload: Number(arg.value)};
                    node.send(msg);
                }
            });
        });

        this.on('close', function () {
            node.log('close');
            if (flow.get('arduinoCount') === 1) {
                node.log('ArduinoCount: all clear');
                node.arduino.reset();
                node.arduino.close();
                delete node.arduino;
                flow.set('arduino', 0);
            } else {
                flow.set('arduinoCount', flow.get('arduinoCount') - 1);
            }
        });
    }
    RED.nodes.registerType("Button", button);
};
