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
    function tts(config) {
        var tts = require('./TTSService.js'); 
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.say = config.say;
        this.genderVoice = config.genderVoice;
        this.language = config.language;
        var node = this;

        node.status({fill:"blue", shape:"dot",text:"ready"});
       
        this.on('input', function(msg) {
            //default zh female
            var voiceType = 'Female';
            var voiceTypeDec = 'Microsoft Server Speech Text to Speech Voice (zh-CN, Yaoyao, Apollo)';
            var language = 'zh-CN';
            if (node.language == 1){ //en
                language = 'en-US';
                voiceTypeDec = 'Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)';

                if (node.genderVoice == 1){
                    voiceType = 'Male';
                    voiceTypeDec = 'Microsoft Server Speech Text to Speech Voice (en-US, BenjaminRUS)';
                }
            }
            else {
                if (node.genderVoice == 1){
                    voiceType = 'Male';
                    language = 'zh-CN';
                    voiceTypeDec = 'Microsoft Server Speech Text to Speech Voice (zh-CN, Kangkang, Apollo)';
                }
            }

            if (node.say){
                var data = {'text':node.say,'voiceType':voiceType,'language':language,'voiceTypeDec':voiceTypeDec};
                tts.Synthesize(data); 
            }
            else{
                if(msg.payload){
                    var data = {'text':msg.payload,'voiceType':voiceType,'language':language,'voiceTypeDec':voiceTypeDec};
                    tts.Synthesize(data); 
                }
            }
        });

        this.on('close', function() { 
        }); 

    }
    RED.nodes.registerType("tts", tts);
}
