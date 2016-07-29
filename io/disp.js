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
var atlas = global.atlas;
var ejs = require('ejs');
var fs = require('fs');

module.exports = function(RED) {
    'use strict';
    var binary = require('node-pre-gyp');
    var path = require('path');
    var binding_path = binary.find(path.resolve(path.join(__dirname, '../package.json')));
    var sn_addon = require(binding_path);
    
    function dispImg(config) {
        RED.nodes.createNode(this, config);
        var img2Base64 = new sn_addon.Image2base64();
        var node = this;
        var name = config.name;

        node.on('input', function(msg) {
            process.nextTick(function () {
                //throw new Error("exception in nextTick callback");
                if((typeof msg.payload) != "string")
                {
                    node.log("Input Error! Wrong Topic");
                    node.status({fill:"red", shape:"dot", text:"InputError"});
                }
                else
                {
                    var base64Str = img2Base64.encode(msg.payload);
                    if(base64Str == -1)
                    {
                        node.log("Input Error! Wrong String Format");
                        node.status({fill:"red", shape:"dot", text:"WrongFormat"});                   
                    }
                    var msg1 = {topic: "base64", payload: base64Str};
                    //node.send(msg1);
                    atlas.emit(name, msg1.payload);
                }
            });
            
            /*
            if(typeof msg == "object" && msg['payload'] != undefined) {
                atlas.emit(name, msg1.payload);
            } else {
                atlas.emit(name, msg1);
            }*/
        });  

        atlas.genHtml.save({
            'name': 'dispImg',
            'html': 'dispImg.html'
        });
    }

    RED.nodes.registerType("dispImg", dispImg);

    function dispGauge(config) {
        console.log
        RED.nodes.createNode(this, config);
        var node = this;
        var name = config.name;

        node.on('input', function(data) {
            if(typeof data == "object" && data['payload'] != undefined) {
                atlas.emit(name, data.payload);
            } else {
                atlas.emit(name, data);
            }
        });  

        var buf = fs.readFileSync(__dirname + '/dispGauge.ejs').toString();

        var bufHtml = ejs.render(buf, {'config': config});
        fs.writeFileSync(atlas.htmlDir + '/' + name + '.html', bufHtml);

        atlas.genHtml.save({
            'name': name,
            'html': name + '.html',
            'width': 320,
            'height': 180
        });
    }

    RED.nodes.registerType("dispGauge", dispGauge);    

};
