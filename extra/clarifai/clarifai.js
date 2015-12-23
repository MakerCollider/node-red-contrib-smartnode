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
    function clarifai(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.image = config.image;
        var node = this;
        
                //upload server
        var express = require('express')
          , morgan = require('morgan')
          , fs = require('fs')
          , path = require('path')
          , multipart = require('connect-multiparty');
        var exec = require('child_process').exec; 
        

        //cp.exec('netstat -aon|findstr "3000"', function(e, stdout, stderr) {
        exec('netstat -lnp | grep 3000', function(e, stdout, stderr) {
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
       // app.use(express.static('./public'));
        app.use(express.static(__dirname + '/html'));
        if (listen_status == 'end'){
            app.listen(process.env.PORT || 3000);
            listen_status ='starting';
        }
            
        //create uploads dir
        var uploadPath = path.dirname(__filename) + '/../../../../public/uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        } 
        
        console.log('Node.js Ajax Upload File running at: http://0.0.0.0:3000');
        app.post('*/upload', multipart(), function(req, res){
            console.log('upload completed');
            //get filename
            var filename = req.files.files.originalFilename || path.basename(req.files.files.ws.path);
            //copy file to a public directory
            var targetPath = uploadPath + 'static.jpg';
            //console.log(req.files.files.ws.path);
            //console.log(path.dirname(__filename));
            //copy file
            fs.createReadStream(req.files.files.ws.path).pipe(fs.createWriteStream(targetPath));
            //return file url
            //console.log(req.headers.host);
            var host = req.headers.host;
            host = host.replace(/3000/, "1880");
            res.json({code: 200, msg: {url: 'http://' + host + '/uploads/' + filename}});
        }); 

        
        var path = uploadPath + 'static.jpg';
        //var cmdStr = 'curl -X POST -H "Authorization: Bearer mKvIRbx7ow7D0MJZq63tPgL13b9FNb" -F "encoded_data=@/data1/vhosts/webapp/tmp/sheep.jpg" https://api.clarifai.com/v1/tag/';
        var cmdStr = 'curl -X POST -H "Authorization: Bearer mKvIRbx7ow7D0MJZq63tPgL13b9FNb" -F "encoded_data=@/'+path+'" https://api.clarifai.com/v1/tag/';
        exec(cmdStr, function(err,stdout,stderr){
            if (err) {
                console.log('get api error:'+stderr);
            } 
            else {
                var data = JSON.parse(stdout);
                commonResultHandler(data);
                //console.log(stdout);
            }
        });

        var tags = '';
        function commonResultHandler(data) {
            if(typeof data.status_code === "string" && ( data.status_code === "OK" || data.status_code === "PARTIAL_ERROR" )) {
                // the request completed successfully
                for( i = 0; i < data.results.length; i++ ) {
                    if(data.results[i].status_code === "OK" ) {
                        //console.log( 'docid='+data.results[i].docid +
                        //    ' local_id='+data.results[i].local_id +
                        //    ' tags='+data.results[i].result.tag.classes);
                        tags = data.results[i].result.tag.classes;
                    }
                    else {
                        //console.log( 'docid='+data.results[i].docid +
                        //    ' local_id='+data.results[i].local_id + 
                        //    ' status_code='+data.results[i].status_code +
                        //    ' error = '+data.results[i].result.error);
                    }
                }
            }
            else{
                if(typeof data.status_code=== "string" && data.status_code === "TIMEOUT") {
                    console.log("TAG request timed out");
                }
                else if( typeof data.status_code === "string" && data.status_code === "ALL_ERROR") {
                    console.log("TAG request received ALL_ERROR. Contact Clarifai support if it continues.");               
                }
                else if( typeof data.status_code === "string" && data.status_code === "TOKEN_FAILURE") {
                    console.log("TAG request received TOKEN_FAILURE. Contact Clarifai support if it continues.");               
                }
                else if( typeof data.status_code === "string" && data.status_code === "ERROR_THROTTLED") {
                    console.log("Clarifai host is throttling this application.");               
                }
                else {
                    console.log("TAG request encountered an unexpected error: ");
                    console.log(data);               
                }
            }

            var msg = {payload:tags}
            node.send(msg);
        }

        this.on('close', function() { 

        });	
    }

    RED.nodes.registerType("Clarifai", clarifai);
}
