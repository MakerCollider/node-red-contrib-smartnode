
module.exports = function(RED){
    function upgrade(config){
        RED.nodes.createNode(this, config);
        this.name = config.name;
        var node = this;

        var cp = require('child_process');
        var path = require('path');
        var fs = require('fs');

        var versionName = '';
        var rootDir = getCurrDirPath();

        //--------------http---------------
        var http = require('http');
        var qs = require('querystring');

        var versionLists = [];
        var rowArr = [];
        var options = {
            hostname: 'repository.smartnode.io',
            port: 80,
            path: '/download/Stable/',
            method: 'GET'
        };

        var req = http.request(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                //console.log('BODY: ' + chunk);
                var start = chunk.indexOf('<table>');
                var stop = chunk.indexOf('</table>');
                chunk =  chunk.substring(start+7,stop);

                var rows = chunk.split('</tr>');
                for(var i=0;i<rows.length;i++){
                    rows[i] = rows[i]+'</tr>';
                    if (rows[i].indexOf('SmartNode')!=-1){
                        rowArr.push(rows[i]);
                    }
                }

                for (var i = 0; i < rowArr.length; i++) {
                    var versions = {};
                    versions = splitTr(rowArr[i]);
                    if (!isEmptyObject(versions)){
                       versionLists.push(versions);
                    } 
                }
                
                for(var ver in versionLists){
                    //parse name
                    var _verName = versionLists[ver].name;
                    var start1 = _verName.indexOf('href="');
                    var stop1 = _verName.indexOf('">');
                    _verName =  _verName.substring(start1+6,stop1);
                    versionLists[ver].name = trim(_verName);
                    
                    //parse size
                    var _verSize = versionLists[ver].size;
                    var start2 = _verSize.indexOf('">');
                    var stop2 = _verSize.indexOf('</td>');
                    _verSize =  _verSize.substring(start2+2,stop2);
                    versionLists[ver].size = trim(_verSize);
                }
                //console.log(versionLists);
            });

            function splitTr(row){
                var _versions = {};
                var cols = row.split('</td>');
                for(var i=0;i<cols.length;i++){
                    cols[i] = cols[i]+'</td>';
                    if (i == 1){
                        _versions.name = cols[i];
                    }
                    if (i == 3){
                        _versions.size = cols[i];
                    }
                }

                if (_versions.hasOwnProperty("name") && _versions.hasOwnProperty("size")){
                    return _versions;
                }
                return {};
            }

            function trim(str) {
                str = str.replace(/^(\s|\u00A0)+/, '');
                for (var i = str.length - 1; i >= 0; i--) {
                    if (/\S/.test(str.charAt(i))) {
                        str = str.substring(0, i + 1);
                        break;
                    }
                }
                return str;
            }

            function isEmptyObject(e) {  
                var t;  
                for (t in e)  
                    return !1;  
                return !0  
            }
        });
        req.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });
        req.end();
        //-----------------http---------------------
        function getCurrDirPath(){
            var rootDir = path.dirname(__filename)+ '/../../../../../';
            return rootDir;
        }

        function getVersionLists(ws){
            fs.readFile(rootDir+'version','utf-8',function(err,data){  
                if (err){
                    console.log("read version error");  
                }
                else{  
                    //console.log(data);
                    ws.send('{current_version}'+data);
                }  
            });

            ws.send('{versions}'+JSON.stringify(versionLists));
            ws.send('{version_list_finished}加载完成');  
        }

        function downLoad(ws,file){
            if (versionName.length == 0){
                versionName = file.name;
            }
            var versionPath = options.hostname+options.path+versionName;
            var cmd = 'cd '+rootDir+' && wget -c -O '+versionName+' '+versionPath;
            console.log(cmd);
            
            var _options =  {
                encoding: 'utf8',
                timeout: 0,
                maxBuffer: 1000*1024,
                killSignal: 'SIGTERM',
                cwd: null,
                env: null
            };
            var ls = cp.exec(cmd,_options);

            ls.stdout.on('data', function (data) {
                console.log('stdout: ' + data);
            });

            ls.stderr.on('data', function (data) {
                console.log('stderr: ' + data);
                if (data.indexOf('%')!=-1){
                    data = data.replace(/\./g,'');
                    var progress_txt = '{progress}已完成' + data;
                    ws.send(progress_txt);
                }
            });

            ls.on('exit', function (code) {
                console.log('exit:child process exited with code ' + code);
            }); 

            ls.on('close', function (code) {
                console.log('close:child process exited with code ' + code);
                ws.send('{download_finished}下载完成！');
            }); 
        }

        function install(ws,file){
            var installStatus = 1; // 1成功 0错误
            if (versionName.length == 0){
                versionName = file.name;
            }

            //var cmd = 'cd /home/root && chmod a+x '+versionName;
            var cmd = 'cd '+rootDir+' && chmod a+x '+versionName;
            console.log(cmd);

            ws.send('{install_start}开始安装新版本...');
            var ls = cp.exec(cmd);

            ls.stdout.on('data', function (data) {
                console.log('stdout: ' + data);
            });

            ls.stderr.on('data', function (data) {
                installStatus = 0;
                console.log('stderr: ' + data);
                ws.send('{install_error}安装失败！');
            });

            ls.on('exit', function (code) {
                console.log('child process exited with code ' + code);
            }); 

            ls.on('close', function (code) {
                console.log('child process exited with code ' + code);
                if (installStatus == 1){
                    installExtract(ws,versionName);
                }
            });
        }

        function installExtract(ws,filename){
            var installStatus = 1; // 1成功 0错误
            //var cmd = 'cd /home/root && ./'+filename;
            var cmd = 'cd '+rootDir+' && ./'+filename;
            console.log(cmd);

            var _options =  {
                encoding: 'utf8',
                timeout: 0,
                maxBuffer: 1000*1024,
                killSignal: 'SIGTERM',
                cwd: null,
                env: null
            };
            var ls = cp.exec(cmd,_options);

            ls.stdout.on('data', function (data) {
                installStatus = 1;
                console.log('stdout: ' + data);

                if (data.trim() =='## 13.1 ## Start smartnode service'){
                    ws.send('{install_finished}安装成功！');
                }
            });

            ls.stderr.on('data', function (data) {
                installStatus = 0;
                console.log('stderr: ' + data);
            });

            ls.on('exit', function (code) {
                console.log('child process exited with code ' + code);
            });
            
            ls.on('close', function (code) {
                console.log('child process exited with code ' + code);
                if (installStatus == 1){
                    ws.send('{install_finished}安装成功！');
                }
                else{
                    ws.send('{install_error}安装失败！');
                }
            });
        }
        if (ws_listen_status == 0){
            var WebSocketServer = require('ws').Server;
            wss = new WebSocketServer({port: 8081});
            ws_listen_status = 1;
            wss.on('connection', function(ws) {
                ws.on('message', function(message) {
                    console.log('received: %s', message);
                    if (message.indexOf('{download}') != -1){
                        var version = message.replace('{download}','');
                        var data = version.split('|');
                        var file = {'name':data[0],'size':data[1]}
                        ws.send('{download_start}开始下载新版本...');
                        downLoad(ws,file);
                    }
                    else if (message === 'version_list'){
                        ws.send('{version_list_start}正在获取版本列表...');
                        getVersionLists(ws);
                    }
                    else if (message.indexOf('{install}') != -1){
                        var version = message.replace('{install}','');
                        var data = version.split('|');
                        var file = {'name':data[0],'size':data[1]}
                        install(ws,file);
                    }
                });
            });
        }  
    }

    RED.nodes.registerType('upgrade', upgrade);
}