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
    function WeChatPic(config) {
        RED.nodes.createNode(this, config);
        this.accountid = config.accountid;
        this.imagepath = config.imagepath;
        var node = this;

        if (!node.accountid || !node.imagepath){
            this.status({fill:"red",shape:"ring",text:"account id & image cannot be blank."});
            return;
        }
        else{
            node.status({fill:"green",shape:"dot",text:"ok"});
        }
        
        //var uploadPath = path.dirname(__filename) + '/../../../../public/uploads/robot/';
        //var path = uploadPath + 'static.jpg';
        //var cmdStr = 'curl -F media=@/data1/vhosts/webapp/bbs.makercollider.com/tmp/dpimg.jpg "http://weixin.makercollider.com/uploadWechatImage"';
       
        this.on("input",function(msg) {
            console.log(msg);

            var path = require('path');
            var exec = require('child_process').exec; 
            
            var path = node.imagepath;
            //var weixinServer = 'http://weixin.makercollider.com';
            var weixinServer = 'http://weixin.smartnode.io';
            var cmdStr = 'curl -F media=@'+path+' '+weixinServer+'"/uploadWechatImage?account_id='+node.accountid+'"';
            console.log(cmdStr);
            exec(cmdStr, function(err,stdout,stderr){
                if (err) {
                    console.log('get api error:'+stderr);
                } 
//                else {
//                    var data = JSON.parse(stdout);
//                    console.log(stdout);
//                    var msg = {payload:stdout};
//                    node.send(msg);
//                }
            });
        });

        this.on('close', function() { 

        });	

    }
    RED.nodes.registerType("WeChatPic", WeChatPic);
}
