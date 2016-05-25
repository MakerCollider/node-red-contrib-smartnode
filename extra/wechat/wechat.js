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
    var util = require("util");
    var isUtf8 = require('is-utf8');

    var mqttBoker = require('./mqttboker'); 

    function WechatIn(n) {
        mqttboker = new mqttBoker(); 
        RED.nodes.createNode(this,n);
        this.topic = n.accountid;
        this.brokerConn = mqttboker;
        var node = this;
        if (this.brokerConn) {
            this.status({fill:"red",shape:"ring",text:"common.status.disconnected"});
            if (this.topic) {
                this.brokerConn.subscribe(this.topic,2,function(topic,payload,packet) {
                    if (isUtf8(payload)) { payload = payload.toString(); }
                    var msg = {topic:topic,payload:payload, qos: packet.qos, retain: packet.retain};
                    if ((node.brokerConn.broker === "localhost")||(node.brokerConn.broker === "127.0.0.1")) {
                        msg._topic = topic;
                    }
                    node.send(msg);
                }, this.id);
                if (this.brokerConn.connected) {
                    node.status({fill:"green",shape:"dot",text:"common.status.connected"});
                }
                node.brokerConn.register(this);
            }
            else {
                this.error(RED._("mqtt.errors.not-defined"));
            }
            this.on('close', function() {
                if (node.brokerConn) {
                    node.brokerConn.unsubscribe(node.topic,node.id);
                    node.brokerConn.deregister(node);
                }
            });
        } else {
            this.error(RED._("mqtt.errors.missing-config"));
        }
        
    }

    RED.nodes.registerType("wechat in", WechatIn);

    function WechatOut(n) {
        mqttboker = new mqttBoker(); 
        RED.nodes.createNode(this,n);
        this.topic = n.accountid+'mc';
        this.qos = n.qos || null;
        this.retain = n.retain;
        this.brokerConn = mqttboker;
        var node = this;
        
        if (this.brokerConn) {
            this.status({fill:"red",shape:"ring",text:"common.status.disconnected"});
            this.on("input",function(msg) {
                if (msg.qos) {
                    msg.qos = parseInt(msg.qos);
                    if ((msg.qos !== 0) && (msg.qos !== 1) && (msg.qos !== 2)) {
                        msg.qos = null;
                    }
                }
                msg.qos = Number(node.qos || msg.qos || 0);
                msg.retain = node.retain || msg.retain || false;
                msg.retain = ((msg.retain === true) || (msg.retain === "true")) || false;
                if (node.topic) {
                    msg.topic = node.topic;
                }
                if ( msg.hasOwnProperty("payload")) {
                    if (msg.hasOwnProperty("topic") && (typeof msg.topic === "string") && (msg.topic !== "")) { // topic must exist
                        this.brokerConn.publish(msg);  // send the message
                    }
                    else { node.warn(RED._("mqtt.errors.invalid-topic")); }
                }
            });
            if (this.brokerConn.connected) {
                node.status({fill:"green",shape:"dot",text:"common.status.connected"});
            }
            node.brokerConn.register(node);
            this.on('close', function() {
                node.brokerConn.deregister(node);
            });
        } else {
            this.error(RED._("mqtt.errors.missing-config"));
        }
    }

    RED.nodes.registerType("wechat out", WechatOut);
 
}
