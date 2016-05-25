/**
 * Copyright 2014, 2015 IBM Corp.
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

function mqttBoker() { 
    var mqtt = require("mqtt");

    // Config node state
    //this.brokerurl="mqtt://www.makercollider.com:1883";
    this.brokerurl="mqtt://mqtt.smartnode.io:1883";
    this.connected = false;
    this.connecting = false;
    this.options = {};
    this.queue = [];
    this.subscriptions = {};


    // Define functions called by MQTT in and out nodes
    var node = this;
    this.users = {};


    this.register = function(mqttNode){
        node.users[mqttNode.id] = mqttNode;
        if (Object.keys(node.users).length === 1) {
            node.connect();
        }
    };
    this.deregister = function(mqttNode){
        delete node.users[mqttNode.id];
        if (Object.keys(node.users).length === 0) {
            node.client.end();
        }
    };

    this.connect = function () {
        if (!node.connected && !node.connecting) {
            node.connecting = true;
            node.client = mqtt.connect(node.brokerurl ,node.options);
            node.client.setMaxListeners(0);
            // Register successful connect or reconnect handler
            node.client.on('connect', function () {
                node.connecting = false;
                node.connected = true;
                //node.log(RED._("mqtt.state.connected",{broker:(node.clientid?node.clientid+"@":"")+node.brokerurl}));
                for (var id in node.users) {
                    if (node.users.hasOwnProperty(id)) {
                        node.users[id].status({fill:"green",shape:"dot",text:"common.status.connected"});
                    }
                }
                // Remove any existing listeners before resubscribing to avoid duplicates in the event of a re-connection
                node.client.removeAllListeners('message');

                // Re-subscribe to stored topics
                for (var s in node.subscriptions) {
                    var topic = s;
                    var qos = 0;
                    for (var r in node.subscriptions[s]) {
                        qos = Math.max(qos,node.subscriptions[s][r].qos);
                        node.client.on('message',node.subscriptions[s][r].handler);
                    }
                    var options = {qos: qos};
                    node.client.subscribe(topic, options);
                }


                // Send any queued messages
                while(node.queue.length) {
                    var msg = node.queue.shift();
                    //console.log(msg);
                    node.publish(msg);
                }
            });

            // Register disconnect handlers
            node.client.on('close', function () {
                if (node.connected) {
                    node.connected = false;
                    //node.log(RED._("mqtt.state.disconnected",{broker:(node.clientid?node.clientid+"@":"")+node.brokerurl}));
                    for (var id in node.users) {
                        if (node.users.hasOwnProperty(id)) {
                            node.users[id].status({fill:"red",shape:"ring",text:"common.status.disconnected"});
                        }
                    }
                } else if (node.connecting) {
                    //node.log(RED._("mqtt.state.connect-failed",{broker:(node.clientid?node.clientid+"@":"")+node.brokerurl}));
                }
            });

            // Register connect error handler
            node.client.on('error', function (error) {
                if (node.connecting) {
                    node.client.end();
                    node.connecting = false;
                }
            });
        }
    };
            this.subscribe = function (topic,qos,callback,ref) {
            ref = ref||0;
            node.subscriptions[topic] = node.subscriptions[topic]||{};
            var sub = {
                topic:topic,
                qos:qos,
                handler:function(mtopic,mpayload, mpacket) {
                    if (node.matchTopic(topic,mtopic)) {
                        callback(mtopic,mpayload, mpacket);
                    }
                },
                ref: ref
            };
            node.subscriptions[topic][ref] = sub;
            if (node.connected) {
                node.client.on('message',sub.handler);
                var options = {};
                options.qos = qos;
                node.client.subscribe(topic, options);
            }
        };

        this.unsubscribe = function (topic, ref) {
            ref = ref||0;
            var sub = node.subscriptions[topic];
            if (sub) {
                if (sub[ref]) {
                    node.client.removeListener('message',sub[ref].handler);
                    delete sub[ref];
                }
                if (Object.keys(sub).length == 0) {
                    delete node.subscriptions[topic];
                    if (node.connected){
                        node.client.unsubscribe(topic);
                    }
                }
            }
        };

        this.publish = function (msg) {
            if (node.connected) {
                if (!Buffer.isBuffer(msg.payload)) {
                    if (typeof msg.payload === "object") {
                        msg.payload = JSON.stringify(msg.payload);
                    } else if (typeof msg.payload !== "string") {
                        msg.payload = "" + msg.payload;
                    }
                }

                var options = {
                    qos: msg.qos || 0,
                    retain: msg.retain || false
                };
                node.client.publish(msg.topic, msg.payload, options, function (err){return});
            } else {
                if (!node.connecting) {
                    node.connect();
                }
                node.queue.push(msg);
            }
        };
    this.matchTopic = function(ts,t) {
        if (ts == "#") {
            return true;
        }
        var re = new RegExp("^"+ts.replace(/([\[\]\?\(\)\\\\$\^\*\.|])/g,"\\$1").replace(/\+/g,"[^/]+").replace(/\/#$/,"(\/.*)?")+"$");
        return re.test(t);
    };

}; 
module.exports = mqttBoker;
