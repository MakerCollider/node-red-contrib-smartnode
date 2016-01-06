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
    
    function Wechat(config) {
        RED.nodes.createNode(this,config);
        this.clientid = config.clientid;
        this.prev_clientid = config.prev_clientid;
        var node = this;
        this.on('input', function(msg) {
            msg.payload = msg.payload.toLowerCase();
        });

        createCLient(node);
        
        this.on('close', function() { 

        });	

    }
    RED.nodes.registerType("wechat", Wechat);

    function createCLient(_node){
        if (_node.clientid){
            var settings = {
                keepalive: 100,
                protocolId: 'MQIsdp',
                protocolVersion: 3,
                clientId: 'client-a',
                clean: false
            }

            var mqtt = require('mqtt')
              , host = 'www.makercollider.com';
              client = mqtt.createClient(1883, host, settings);
            client.subscribe(_node.clientid,{qos:1}, function (topic) {
                //console.log('presenced '+_node.clientid);
            });
            client.unsubscribe(_node.prev_clientid, function (topic) {
                //console.log('unpresenced '+_node.prev_clientid);
            });
            
            client.on('message', function(topic, message) {
                console.log(''+message);
                var msg = {payload:''+message}
                _node.send(msg);
            });
        }
    }
}
