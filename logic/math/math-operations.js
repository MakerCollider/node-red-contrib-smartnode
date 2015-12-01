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
    function mathOperations(config) {
        RED.nodes.createNode(this, config);
        this.operation = config.operation;
        this.input_type = config.input_type;
        this.value = config.value;
        var node = this;
        var output;
        var input_value;

        this.on('input', function(msg) {
            input_value = node.value;
            //operations 
            if (node.operation === "ADD") {
                output = Number(msg.payload) + Number(input_value);
            } else if (node.operation === "SUBTRACT") {
                output = Number(msg.payload) - Number(input_value); 
            } else if (node.operation === "MULTIPLY") {
                output = Number(msg.payload) * Number(input_value);
            } else if (node.operation === "DIVIDE") {
                output = Number(msg.payload) / Number(input_value);
            }
            //send the result
            msg = {payload: output};
            node.send(msg);
        });

        //clean up when re-deploying
        this.on('close', function() {
        });
    }
    
    RED.nodes.registerType("Math", mathOperations);
}
