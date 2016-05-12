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
    "use strict";
    function Combine(n) {
        RED.nodes.createNode(this, n);
        var node = this;

        this.rules = [];
        this.receivedNumber = 0;
        this.lastReceiveNumber = 0;
        for (var i=0; i<n.rules.length; i+=1) {
            if(n.rules[i].hasOwnProperty("name")){
                if(n.rules[i].name.length > 0){
                    var r = {name:n.rules[i].name, recv: false};
                    this.rules.push(r);
                    this.log("Topic " + this.rules.length + ": " + this.rules[i].name);
                }
            }
        }

        this.timeout = n.timeout * 1000;
        this.log("Timeout: " + this.timeout + "ms");
        this.timer = null;
        this.sendAll = null;

        var status = node.receivedNumber + "/" + node.rules.length + "  Waitting";
        this.status({fill:"green",shape:"dot",text:status});

        function sendMsg(){
            var msgSend = {};
            for (var i=0; i<node.rules.length; i+=1) {
                if(node.rules[i].recv == true){
                    node.rules[i].recv = false;
                    msgSend[node.rules[i].name] = node.rules[i].value;
                }
            }

            var stat = "";
            if(node.receivedNumber != node.rules.length){
                stat = "Timeout !  Send";
            }
            else{
                stat = "Send";
            }
            node.log(stat);

            node.send(msgSend);
            node.receivedNumber = 0;
            node.lastReceiveNumber = 0;

            var status = node.receivedNumber + "/" + node.rules.length + "  " + stat;
            node.status({fill:"green",shape:"dot",text:status});

            node.timer = setTimeout(changeStatus, 1000);
        }

        function changeStatus()
        {
            var status = node.receivedNumber + "/" + node.rules.length + "  Waitting";
            node.status({fill:"green",shape:"dot",text:status});
        }

        this.on('input', function (msg) {
            for (var i=0; i<node.rules.length; i+=1) {
                if(msg[node.rules[i].name] != null){
                    node.rules[i].value = msg[node.rules[i].name];
                    if(node.rules[i].recv == false){
                        node.rules[i].recv = true;
                        node.receivedNumber += 1;
                    }
                }
            }

            if(node.receivedNumber == node.rules.length){
                sendMsg();
            }
            else if(node.lastReceiveNumber != node.receivedNumber) {
                var status = node.receivedNumber + "/" + node.rules.length + "  Waitting";
                node.status({fill:"green",shape:"dot",text:status});
                if(this.timeout > 0){
                    clearTimeout(node.sendAll);
                    node.sendAll = setTimeout(sendMsg, this.timeout);
                }
                node.lastReceiveNumber = node.receivedNumber;
            }
        });

        node.on('close', function() {
            clearTimeout(node.timer);
            clearTimeout(node.sendAll);
        });
    }
    RED.nodes.registerType("Combine", Combine);
}
