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
    
    function WechatIn(config) {
        RED.nodes.createNode(this,config);
        this.accountid = config.accountid;
        this.prev_accountid = config.prev_accountid;
        var node = this;
        this.on('input', function(msg) {
            //msg.payload = msg.payload.toLowerCase();
        });

        subscribeMqtt(node);
        
        this.on('close', function() { 

        });	
    }

    function subscribeMqtt(_node){
        if (_node.accountid){
            var settings = {
                keepalive: 10000,
                protocolId: 'MQIsdp',
                protocolVersion: 3,
                clientId: 'client-a1',
                clean: false
            }

            var mqtt = require('mqtt')
              , host = 'www.makercollider.com';
            client = mqtt.createClient(1883, host, settings);
            client.subscribe(_node.accountid,{qos:1}, function (topic) {
                console.log('presenced '+_node.accountid);
            });

            if (_node.accountid != _node.prev_accountid){
                client.unsubscribe(_node.prev_accountid, function (topic) {
                    console.log('unpresenced '+_node.prev_accountid);
                });
            }

            client.on('message', function(topic, message) {
                if (topic == _node.accountid){
                    console.log(topic+''+message);
                    var msg = {payload:''+message}
                    _node.send(msg);
                }
            });          
        }
    }


    RED.nodes.registerType("wechat in", WechatIn);

    
    function WechatOut(config) {
        RED.nodes.createNode(this,config);
        this.accountid = config.accountid;
        var node = this;
        this.on('input', function(msg) {
            msg.payload = msg.payload.toLowerCase();
            console.log(msg.payload);
            if (msg.payload){
                publishMqtt(node,msg.payload);
            }
            
        });
        this.on('close', function() { 

        }); 

    }
    RED.nodes.registerType("wechat out", WechatOut);

    function publishMqtt(_node,msg){

        if (_node.accountid){
            
            var settings = {
                keepalive: 10000,
                protocolId: 'MQIsdp',
                protocolVersion: 3,
                clientId: 'client-a3',
                clean: false
            }

            var mqtt = require('mqtt')
              , host = 'www.makercollider.com';
              client = mqtt.createClient(1883, host, settings);
            client.publish(_node.accountid+'mc',msg);
            client.end();
            console.log('published '+_node.accountid+'mc');
        }
    }
}
