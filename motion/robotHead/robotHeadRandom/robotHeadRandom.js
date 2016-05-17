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

    function robotHeadRandom(config) {

        RED.nodes.createNode(this, config);
        this.time = config.time;
        var node = this;
        node.log('start RobotHead-Random');

        var wait = null;
        node.status({fill: 'red', shape:'dot', text: 'Ready'});

        node.on('input', function(msg) {
            function interval () {
                node.status({fill: 'red', shape:'dot', text: 'Random...'});
                var rand = Math.round(Math.random()*700) - 350;
                node.log('send #3P' + rand + '#4P' + rand + 'T'+node.time);
                node.send({'payload': "#3P" + rand + "#4P" + rand + "T" + node.time + "\r\n"});
            }
            if(msg.payload == 1)
            {
                if(wait == null)
                {
                    wait = setInterval(interval, node.time);
                }
            } else {
                if(wait != null)
                {
                    clearInterval(wait);
                    node.log("Receive msg 0");
                    node.status({fill: 'red', shape:'dot', text: 'Ready'});
                }
            }
        });
        /*sendStat();*/
    }
    RED.nodes.registerType('RobotHead-Random', robotHeadRandom);
};