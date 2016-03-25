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
    function CToggle(n) {
        RED.nodes.createNode(this, n);
        var node = this;

        this.rules = [];
        this.receivedNumber = 0;
        for (var i=0; i<n.rules.length; i+=1) {
            if(n.rules[i].hasOwnProperty("name")){
                if(n.rules[i].name.length > 0){
                    var r = {name:n.rules[i].name, condition: n.rules[i].condition};
                    this.rules.push(r);
                    this.log("Topic " + this.rules.length + ": " + this.rules[i].name + ", Condition: " + this.rules[i].condition);
                }
            }
        }

        var status = node.receivedNumber + "/" + node.rules.length + "  Close";
        this.status({fill:"red",shape:"dot",text:status});

        this.on('input', function (msg) {
            var exist = false;
            for (var i=0; i<node.rules.length; i+=1) {
                if(node.rules[i].name in msg) {
                    exist = true;
                    var resultA = (msg[node.rules[i].name] == node.rules[i].condition);
                    var resultB = node.rules[i].state;
                    if(resultA != resultB) {
                        if(resultA) {
                            node.rules[i].state = true;
                            node.receivedNumber += 1;
                        }
                        else {
                            node.rules[i].state = false;
                            node.receivedNumber -= 1;
                        }

                        if(node.receivedNumber == node.rules.length) {
                            var status = node.receivedNumber + "/" + node.rules.length + "  Open";
                            node.status({fill:"green",shape:"dot",text:status});
                        }
                        else {
                            var status = node.receivedNumber + "/" + node.rules.length + "  Close";
                            node.status({fill:"red",shape:"dot",text:status});
                        }
                    }
                }
            }
            
            if(!exist && node.receivedNumber == node.rules.length) {
                    node.send(msg);
            }
        });

        node.on('close', function() {
        });
    }
    RED.nodes.registerType("CToggle", CToggle);
}
