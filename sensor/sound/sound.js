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

module.exports = function init(RED) {
    'use strict';
    var serialport = require('serialport');
    var five = require('johnny-five');
    function Sound(n) {
        RED.nodes.createNode(this, n);
        this.nodebot = RED.nodes.getNode(n.board);
        if (typeof this.nodebot === "object") {
            var node = this;

            node.status({fill: "red", shape: "ring", text: "connecting"});

            node.nodebot.on('ioready', function () {
                node.status({fill: "green", shape: "dot", text: "connected"});
            });
            node.nodebot.on('networkReady', function () {
                node.status({fill: "yellow", shape: "ring", text: "connecting..."});
            });
            node.nodebot.on('networkError', function () {
                node.status({fill: "red", shape: "dot", text: "disconnected"});
            });
            node.nodebot.on('ioError', function (err) {
                node.status({fill: "red", shape: "dot", text: "error"});
                node.warn(err);
            });

            node.nodebot.on("ioready", function () {
                five.Board.cache.push(node.nodebot.board);

                /*******************Edit*******************/
                var asoundSensor = new five.Sensor({
                    pin: "A" + n.analogPin
                });

                asoundSensor.on("change", function(value) {
                    var msg = {payload: value};
                    node.send(msg);
                });
                /*******************Edit*******************/

                node.on("close", function () {
                    five.Board.cache.pop();
                });
            });
        } else {
            this.warn("nodebot not configured");
        }
    }
    RED.nodes.registerType("Sound", Sound);

    function listArduinoPorts(callback) {
        return serialport.list(function (err, ports) {
            if (err) {
                return callback(err);
            }
            var devices = [];
            var i;
            for (i = 0; i < ports.length; i += 1) {
                if (/usb|acm|com\d+/i.test(ports[i].comName)) {
                    devices.push(ports[i].comName);
                }
            }
            return callback(null, devices);
        });
    }

    //routes
    RED.httpAdmin.get("/gpioserialports", RED.auth.needsPermission("arduino.read"), function (req, res) {
        listArduinoPorts(function (err, ports) {
            res.json(ports);
        });
    });
};
