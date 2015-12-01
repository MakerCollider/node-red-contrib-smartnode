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
    function ChangeType(config) {
        RED.nodes.createNode(this, config);
        this.operation = config.operation;
        var node = this;

        this.on('input', function(msg) {
            //convert to type
            if (node.operation === "TO_STRING") {
                msg.payload = String(msg.payload);
            } else if (node.operation === "TO_NUMBER") {
                msg.payload = Number(msg.payload); 
                //print "Not a Number" instead of "NaN"
                if (isNaN(msg.payload)) {
                    msg.payload = "Not a Number";
                }
            }
            //send the result
            node.send(msg);
        });

        //clean up when re-deploying
        this.on('close', function() {
        });
    }
    
    RED.nodes.registerType("change-type", ChangeType);
}
