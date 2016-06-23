/**
 * Copyright 2013,2015 IBM Corp.
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
    var spawn = require('child_process').spawn;
    var exec = require('child_process').exec;
    var isUtf8 = require('is-utf8');

    var mi_key={JOYA:{H:-1,V:-1},
                JOYB:{H:-1,V:-1},
                KEY:{L1:-1,L2:-1,
                    R1:-1,R2:-1,
                    A:-1,B:-1,X:-1,Y:-1,
                    BACK:-1,MENU:-1,
                    LEFT:-1,RIGHT:-1,
                    UP:-1,DOWN:-1}
    };
    var close_flag=false;
    function Mijoystick(n) {
        RED.nodes.createNode(this,n);
        this.address = (n.address || "").trim();
        this.activeProcesses = {};

        var node = this;
        var msg=new Object();

        useExec("rfkill unblock bluetooth");
        var cmd="echo \"connect "+node.address+"\" | bluetoothctl";
        console.log("trying to connect to "+node.address);
        useExec(cmd);
        setTimeout(function(){
            useSpawn("cat /dev/hidraw0");
           
        },2500);
               
        
       
        
        this.on('close',function() {
            for (var pid in node.activeProcesses) {
                if (node.activeProcesses.hasOwnProperty(pid)) {
                    node.activeProcesses[pid].kill();
                }
            }
            node.activeProcesses = {};
            close_flag=true;
        });

        function useExec(command){
            var cl = command;
                
                if (RED.settings.verbose) { node.log(cl); }
                var child = exec(cl, {encoding: 'binary', maxBuffer:10000000}, function (error, stdout, stderr) {
                    msg.payload = new Buffer(stdout,"binary");
                    try {
                        if (isUtf8(msg.payload)) { msg.payload = msg.payload.toString(); }
                    } catch(e) {
                        node.log(RED._("exec.badstdout"));
                    }
                 /*   var msg2 = {payload:stderr};
                    var msg3 = null;
                    //console.log('[exec] stdout: ' + stdout);
                    //console.log('[exec] stderr: ' + stderr);
                    if (error !== null) {
                        msg3 = {payload:error};
                        //console.log('[exec] error: ' + error);
                    }
                    node.status({});
                    console.log(msg.payload);*/ 
                    delete node.activeProcesses[child.pid];
                });
                child.on('error',function(){})
                node.activeProcesses[child.pid] = child;
        }
        function useSpawn(command,callback){
            // make the extra args into an array
            // then prepend with the msg.payload
            var arg = command;
            // slice whole line by spaces (trying to honour quotes);
            arg = arg.match(/(?:[^\s"]+|"[^"]*")+/g);
            var cmd = arg.shift();
            if (RED.settings.verbose) { node.log(cmd+" ["+arg+"]"); }
            if (cmd.indexOf(" ") == -1) {
                var ex = spawn(cmd,arg);
                node.activeProcesses[ex.pid] = ex;
                ex.stdout.on('data', function (data) {
                    //console.log('[exec] stdout: ' + data);
                    if (isUtf8(data)) { msg.payload = data.toString(); }
                    else { msg.payload = data; }
                    parser_keys(msg.payload); 
                    delete msg.payload;
                    msg=mi_key;
                    //console.log("msg from stdout"+msg);
                    node.send(msg);
                });
                ex.stderr.on('data', function (data) {
                    //console.log('[exec] stderr: ' + data);
                    if (isUtf8(data)) { msg.payload = data.toString(); }
                    else { msg.payload = new Buffer(data);}
                  
                    //console.log("msg from stderr"+msg.payload);
                    var msgerr=new Object();
                    msgerr.payload="please make sure your joystick is in pairing mode!";
                    node.send(msgerr);
                });
                ex.on('close', function (code) {
                    //console.log('[exec] result: ' + code);
                    //delete node.activeProcesses[ex.pid];
                    msg.payload = code;
                    node.status({});
                    //console.log("at close:"+msg);
                    if(!close_flag){
                        cmd="echo \"connect "+node.address+"\" | bluetoothctl";
                        console.log("trying to connect to "+node.address);
                        useExec(cmd);
                       // console.log("cmd is :"+cmd);
                        setTimeout(function(){
                            useSpawn("cat /dev/hidraw0");
                           
                        },2500);
                    }
                });
                ex.on('exit',function(){
                })
                ex.on('error', function (code) {
                    delete node.activeProcesses[ex.pid];
                    node.error(code,msg);
                });
          
              
            }
            else { node.error(RED._("exec.spawnerr")); }
        } 
        /****************************************************************
        *purpose:categorize the keys according to the buffer from the HID file.
        *input:  b1, the second byte from the HID device file.
        *        pstkey, the output key dict. it is always the same length of MI_KEY_NUM
        *return: 0 is success.
        *****************************************************************/
        function parser_key_b1(b1)
        {
            var code=new Buffer([0x01,0x02,0x08,0x10,0x40,0x80]);
           
            b1&code[0] ? mi_key.KEY.A=1 : mi_key.KEY.A=0;
            b1&code[1] ? mi_key.KEY.B=1 : mi_key.KEY.B=0;
            b1&code[2] ? mi_key.KEY.X=1 : mi_key.KEY.X=0;
            b1&code[3] ? mi_key.KEY.Y=1 : mi_key.KEY.Y=0;
            b1&code[4] ? mi_key.KEY.L1=1 : mi_key.KEY.L1=0;
            b1&code[5] ? mi_key.KEY.R1=1 : mi_key.KEY.R1=0;
        }


        /****************************************************************
        *purpose:categorize the keys according to the buffer from the HID file.
        *input:  b2, the 3rd byte from the HID device file.
        *        pstkey, the output key dict. it is always the same length of MI_KEY_NUM
        *return: 0 is success.
        *****************************************************************/
        function parser_key_b2(b2)
        {
            var code= new Buffer([0x04,0x08]);
            b2&code[0] ? mi_key.KEY.BACK=1 : mi_key.KEY.BACK=0;
            b2&code[1] ? mi_key.KEY.MENU=1 : mi_key.KEY.MENU=0;
        }

        /****************************************************************
        *purpose:categorize the keys according to the buffer from the HID file.
        *input:  b4, the 5th byte from the HID device file.
        *        pstkey, the output key dict. it is always the same length of MI_KEY_NUM
        *return: 0 is success.
        *****************************************************************/
        function parser_key_b4(b4)
        {
            var code=new Buffer([0x00,0x02,0x04,0x06]);
            b4==code[0] ? mi_key.KEY.UP=1 : mi_key.KEY.UP=0;
            b4==code[1] ? mi_key.KEY.RIGHT=1 : mi_key.KEY.RIGHT=0;
            b4==code[2] ? mi_key.KEY.DOWN=1 : mi_key.KEY.DOWN=0;
            b4==code[3] ? mi_key.KEY.LEFT=1 : mi_key.KEY.LEFT=0;
            
            if(b4%2!=0){
                if(b4==0x01) {mi_key.KEY.UP=1;mi_key.KEY.RIGHT=1; } 
                if(b4==0x03) {mi_key.KEY.RIGHT=1;mi_key.KEY.DOWN=1;}
                if(b4==0x05) {mi_key.KEY.DOWN=1;mi_key.KEY.LEFT=1;} 
                if(b4==0x07) {mi_key.KEY.LEFT=1;mi_key.KEY.UP=1;} 
            }
        }

        /****************************************************************
        *purpose:categorize the keys according to the buffer from the HID file.
        *input:  b4, the 5th byte from the HID device file.
        *        pstkey, the output key dict. it is always the same length of MI_KEY_NUM
        *return: 0 is success.
        *****************************************************************/
        function parser_key_b5(b5)
        {   
            mi_key.JOYA.H=b5;
        }
        /****************************************************************
        *purpose:categorize the keys according to the buffer from the HID file.
        *input:  b4, the 5th byte from the HID device file.
        *        pstkey, the output key dict. it is always the same length of MI_KEY_NUM
        *return: 0 is success.
        *****************************************************************/
        function parser_key_b6(b6)
        {   
            mi_key.JOYA.V=b6;
        }
        /****************************************************************
        *purpose:categorize the keys according to the buffer from the HID file.
        *input:  b4, the 5th byte from the HID device file.
        *        pstkey, the output key dict. it is always the same length of MI_KEY_NUM
        *return: 0 is success.
        *****************************************************************/
        function parser_key_b7(b7)
        {   
            mi_key.JOYB.H=b7;
        }
        /****************************************************************
        *purpose:categorize the keys according to the buffer from the HID file.
        *input:  b4, the 5th byte from the HID device file.
        *        pstkey, the output key dict. it is always the same length of MI_KEY_NUM
        *return: 0 is success.
        *****************************************************************/
        function parser_key_b8(b8)
        {   
            mi_key.JOYB.V=b8;
        }

        /****************************************************************
        *purpose:categorize the keys according to the buffer from the HID file.
        *input:  b4, the 5th byte from the HID device file.
        *        pstkey, the output key dict. it is always the same length of MI_KEY_NUM
        *return: 0 is success.
        *****************************************************************/
        function parser_key_b11(b11)
        {   
            mi_key.KEY.L2=b11;
        }

        /****************************************************************
        *purpose:categorize the keys according to the buffer from the HID file.
        *input:  b4, the 5th byte from the HID device file.
        *        pstkey, the output key dict. it is always the same length of MI_KEY_NUM
        *return: 0 is success.
        *****************************************************************/
        function parser_key_b12(b12)
        {   
            mi_key.KEY.R2=b12;
        }

        /****************************************************************
        *purpose:categorize the keys according to the buffer from the HID file.
        *input:  buffer, the unsigned char line from the HID device file.
        *        pstkeylist, the final output key list. it is always the same length of MI_KEY_NUM
        *        len, the length of the output pstkeylist.
        *return: 0 is success.
        *****************************************************************/
        function parser_keys(buffer)
        {
            
            parser_key_b1(buffer[1]);
            parser_key_b2(buffer[2]);
            parser_key_b4(buffer[4]);
            parser_key_b5(buffer[5]);
            parser_key_b6(buffer[6]);
            parser_key_b7(buffer[7]);
            parser_key_b8(buffer[8]);
            parser_key_b11(buffer[11]);
            parser_key_b12(buffer[12]);  
        }
    }
    
    RED.nodes.registerType("Mijoystick",Mijoystick);
}
