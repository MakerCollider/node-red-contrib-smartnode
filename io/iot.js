/**
 * Copyright 2015, MakerCollider.
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

var debug = require('debug')('iot-server');
var app = require('../../app');

var parseJSON = function(input) {
        var rpc;
      
        if(typeof(input) == "string") {
            rpc = JSON.parse(input);
        } else {
            rpc = input;
        }

        if(rpc && rpc.params) {
            var params = rpc.params;
            if(typeof params == 'string') {
                rpc.params = JSON.parse(params)
            }
        }

        return rpc;

    try {

    } catch(e) {
        return undefined;
    }
};

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {            
    console.log('Express server listening on port ' + server.address().port);
});
var io = require('socket.io').listen(server);
*/

//var io = require('../../../node-red/atlas_hook/').io;
var atlas = global.atlas;
var ejs = require('ejs');
var fs = require('fs');

module.exports = function(RED) {

    function remoteIotInput(config) {
 
        RED.nodes.createNode(this, config);

        var node = this;
        var name = config.name;

        node.log('register ' + name);

        recvEvent[name] = function(data) {
            if(typeof data == "object" && data["payload"] != undefined)
                node.send({'payload': data.payload});
            else
                node.send({'payload': data});
        };    

        this.on('close', function() {
            delete recvEvent[name];
        });
    };

    RED.nodes.registerType("iot-input", remoteIotInput);

    function remoteIotOutput(config) {

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
    };

    RED.nodes.registerType("iot-output", remoteIotOutput);

};

