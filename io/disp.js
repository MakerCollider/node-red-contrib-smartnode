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
    function dispImg(config) {
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