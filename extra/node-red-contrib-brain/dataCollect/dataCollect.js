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
    var collect = require('../collect-defines');

    function dataCollect(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.inRules = config.inRules;
        this.outRules = config.outRules;
        this.sendCmd = config.sendCmd;
        this.inGroupNumber = config.inGroupNumber;
        this.outGroupNumber = config.outGroupNumber;
        this.prev_inGroupNumber = config.prev_inGroupNumber;
        this.prev_outGroupNumber = config.prev_outGroupNumber;
        var node = this;

        this.on('input', function (msg){
            if (node.prev_inGroupNumber != node.inGroupNumber || node.prev_outGroupNumber != node.outGroupNumber){
                collect.clearAllData();
                node.prev_inGroupNumber = node.inGroupNumber;
                node.prev_outGroupNumber = node.outGroupNumber;

            }

            //send
            if (node.sendCmd === msg[node.sendCmd]){
                //if (_G_indata_completed === 1 && _G_indata_completed === 1 ){
                    var jsonStr = JSON.stringify(_G_outDataSets);
                    jsonObj = JSON.parse(jsonStr);
                    msg.payload = jsonObj;
                    node.send(msg);
                    collect.initStatus();
                //}
            }
            //input
            for (var i=0; i<node.inRules.length; i++) {
                if (node.inRules[i].hasOwnProperty("name") && msg[node.inRules[i].name] != null  && !isNaN(msg[node.inRules[i].name])){
                    var arrIn = Object.keys(_G_inData);
                    if (arrIn.length < node.inGroupNumber){
                        collect.setInDataValue(node.inRules[i].name,msg[node.inRules[i].name]);
                    }
                }
            }

            // output
            for (var i=0; i<node.outRules.length; i++) {
                if (node.outRules[i].hasOwnProperty("name") && msg[node.outRules[i].name] != null  && !isNaN(msg[node.outRules[i].name])){
                    var arrOut = Object.keys(_G_outData);
                    if (arrOut.length < node.outGroupNumber){
                        collect.setOutDataValue(node.outRules[i].name,msg[node.outRules[i].name]);
                    }
                    
                    
                    //check data complete.
                    var arrIn = Object.keys(_G_inData);
                    if (arrIn.length >= node.inGroupNumber){
                        _G_indata_completed = 1;
                    }
                    var arrOut = Object.keys(_G_outData);
                    if (arrOut.length >= node.outGroupNumber){
                        _G_outdata_completed = 1;
                    }

                    if (_G_indata_completed === 1 && _G_outdata_completed === 1 ){
                        var groupData = {
                            'input':_G_inData,
                            'output':_G_outData,
                        };
                    
                        collect.appendData(groupData);
                        collect.clearInData();
                        collect.clearOutData();
                        _G_indata_completed = 0;
                        _G_outdata_completed = 0;
                    }
                }
            }
        });

        this.on('close', function() {
        });
    }
    RED.nodes.registerType("dataCollect", dataCollect);
}
