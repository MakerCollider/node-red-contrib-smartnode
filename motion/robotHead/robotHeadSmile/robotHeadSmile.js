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
    
    function robotHeadSmile(config) {

        RED.nodes.createNode(this, config);
        this.time = config.time;
        var node = this;
        node.log('start RobotHead-Smile');

        node.status({fill: 'red', shape:'dot', text: 'Ready'});

        node.on('input', function(msg) {
            node.log('send #1P1500#2P1500#5P1500#6P1100#7P1500#8P1900T'+node.time);
            node.send({'payload': "#1P1500#2P1500#5P1500#6P1100#7P1500#8P1900T" + node.time + "\r\n"});
            node.status({fill: 'red', shape:'dot', text: 'Sending...'});
            setTimeout(function () {
                node.status({fill: 'red', shape:'dot', text: 'Ready'});
            }, node.time);
        });
        /*sendStat();*/
    }
    RED.nodes.registerType('RobotHead-Smile', robotHeadSmile);
};