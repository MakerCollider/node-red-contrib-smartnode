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
    function addStrings(config) {
        RED.nodes.createNode(this, config);
        this.prepend = config.prepend;
        this.append = config.append;
        var node = this;

        this.on('input', function(msg) {
            //prepend
            if (node.prepend) {
                msg.payload = String(node.prepend + msg.payload);
            }
            //append
            if (node.append) {
                msg.payload = String(msg.payload + node.append);
            }
            //send the result
            node.send(msg);
        });

        //clean up when re-deploying
        this.on('close', function() {
        });
    }
    
    RED.nodes.registerType("add-strings", addStrings);
}
