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
    require("../../extends/check_pin");
    function playAudio(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.rules = config.rules;
        var node = this;

        //exec
        var term = require('child_process');

        //upload server
        var express = require('express')
          , morgan = require('morgan')
          , fs = require('fs')
          , path = require('path')
          , multipart = require('connect-multiparty');
        var cp = require('child_process');
        

        //cp.exec('netstat -aon|findstr "3000"', function(e, stdout, stderr) {
        cp.exec('netstat -lnp | grep 3000', function(e, stdout, stderr) {
        　　  if(!e) {
        　　　　   //console.log(stdout);
        　　　　   //console.log(stderr);
                listen_status = 'running';
        　　  }
        });

        var app = express();

        //cross-domain

        app.all('*', function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
            res.header("X-Powered-By",' 3.2.1')
            //res.header("Content-Type", "application/json;charset=utf-8");
            next();
        });
        app.use(morgan('dev'));
        //app.use(express.static(__dirname + '/html'));
        app.use(express.static(__dirname + '/../../extends/upload'));
        if (listen_status == 'end'){
            app.listen(process.env.PORT || 3000);
            listen_status ='starting';
        }
            
        console.log('Node.js Ajax Upload File running at: http://0.0.0.0:3000');
        app.post('*/upload', multipart(), function(req, res){
            //file dir
            var fileDir = '';
            if (req.query.type){
                fileDir = req.query.type+'/';
            }
            //create uploads dir
            var uploadFatherPath = path.dirname(__filename) + '/../../../../public/uploads/';
            if (!fs.existsSync(uploadFatherPath)) {
                fs.mkdirSync(uploadFatherPath);
            }

            var uploadPath = path.dirname(__filename) + '/../../../../public/uploads/'+fileDir;
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath);
            }

            console.log('upload completed');
            //get filename
            var filename = req.files.files.originalFilename || path.basename(req.files.files.path);

            //copy file to a public directory
            var targetPath = uploadPath + filename;
            //console.log(req.files.files.ws.path);
            //console.log(path.dirname(__filename));
            //copy file
            fs.createReadStream(req.files.files.path).pipe(fs.createWriteStream(targetPath));
            //return file url
            //console.log(req.headers.host);
            var host = req.headers.host;
            host = host.replace(/3000/, "1880");
            res.json({code: 200, msg: {url: 'http://' + host + '/uploads/'+ fileDir + filename}});
        }); 

        app.get('*/getfiles', function(req, res){
            //file dir
            var fileDir = '';
            if (req.query.type){
                fileDir = req.query.type+'/';
            }
            //create uploads dir
            var uploadPath = path.dirname(__filename) + '/../../../../public/uploads/'+fileDir;

            var filesList = geFileList(uploadPath);
            res.json({code: 200, msg: filesList});
        });

        function geFileList(path){
           var filesList = [];
           readFile(path,filesList);
           return filesList;
        }
        function readFile(path,filesList){
            files = fs.readdirSync(path);
            files.forEach(walk);
            function walk(file){ 
                states = fs.statSync(path+'/'+file);   
                if (states.isDirectory()){
                   readFile(path+'/'+file,filesList);
                }
                else{ 
                   var obj = new Object();
                   //obj.size = states.size;
                   //obj.name = file;
                   //obj.path = path+'/'+file; //absolute path;
                   obj.t = file; //file name
                   obj.v = path+'/'+file;  //absolute path;
                   filesList.push(obj);
                }  
            }
        }

        node.status({fill:"blue", shape:"dot",text:"ready"});

        this.on('input', function(msg) {
            var value = Number(msg.payload);
            if(value in node.rules){
                fileStr = node.rules[value].v;
                if(fileStr.substr(-3, 3) == "WAV" || fileStr.substr(-3, 3) == "wav"){
                    console.log("it's wav file");
                    orders = "killall -SIGINT mpg123 play; play " + fileStr;
                    term.exec(orders, function(err, stdout,stderr){
                        if(err){
                            console.log(err);
                        }
                    });
                }
                else if(fileStr.substr(-3, 3) == "MP3" || fileStr.substr(-3, 3) == "mp3"){
                    console.log("it's mp3 file");
                    orders = "killall -SIGINT mpg123 play; mpg123 " + fileStr;
                    term.exec(orders, function(err, stdout,stderr){
                        if(err){
                            console.log(err);
                        }
                    });
                }
                node.status({fill:"green", shape:"dot",text: "playing" + msg.payload});
            }
            else if(msg.payload == -1){
                orders = "killall -SIGINT mpg123 play";
                term.exec(orders, function(err, stdout,stderr){
                    if(err){
                        console.log(err);
                    }
                });
                node.status({fill:"red", shape:"dot",text:"stop"});
            }
            else{
                node.status({fill:"grey", shape:"dot",text:"error"});
            }
        });

        this.on('close', function() { 
            orders = "killall -SIGINT mpg123 play";
            term.exec(orders, function(err, stdout,stderr){
                if(err){
                    console.log(err);
                }
            });
        }); 

    }
    RED.nodes.registerType("PlayAudio", playAudio);
}
