
module.exports = function(RED){
    function upgrade(config){
        RED.nodes.createNode(this, config);
        this.name = config.name;
        var node = this;

        var cp = require('child_process');
        var fs = require('fs');
        var fse = require('fs-extra')
        var path = require('path');
        //use ftp get remote files list
        var ftpClient = require('ftp');
        
        var dirPath = '/SmartNode_Build/Stable/';
        var ftpOptions = {'host':'114.215.140.168'};
        var versionName = '';
        function ftpGetVersionLists(ws){
            var ftpc = new ftpClient();
            ftpc.on('ready', function() {
                fs.readFile("version",'utf-8',function(err,data){  
                    if (err){  
                        console.log("read version error");  
                    }
                    else{  
                        console.log(data);
                        ws.send('{current_version}'+data);
                    }  
                });

                ftpc.list(dirPath,function(err, list) {
                    if (err) {
                        throw err;
                        ws.send('{version_list_error}加载失败');
                    }
                    //console.dir(list);
                    var fileArray = new Array();
                    for (var i in list) {
                        var fileList = {};
                        fileList.id = i;
                        fileList.name = list[i].name;
                        fileList.size = list[i].size;
                        fileArray.push(fileList);
                    };

                    console.log(JSON.stringify(fileArray));
                    ws.send('{versions}'+JSON.stringify(fileArray));
                    ws.send('{version_list_finished}加载完成');
                    ftpc.end();  
                });
            });
            // connect to localhost:21 as anonymous
            ftpc.connect(ftpOptions);
        }

        function ftpDownLoad(ws,file){
            versionName = file.name;
            var upgradePath = path.dirname(__filename)+ '/../../../../../';
            var writeStream = fs.createWriteStream(upgradePath+file.name);
            var totalSize = file.size;

            var passedLength = 0;
            var lastSize = 0;
            var startTime = Date.now();
            //out = process.stdout;

            var ftpc = new ftpClient();
            ftpc.on('ready', function() {

                var filePath = dirPath+file.name;
                ftpc.get(filePath, function(err, stream) {
                    if (err) throw err;
                    stream.once('close', function() { ftpc.end(); });
                    //stream.pipe(fs.createWriteStream('SmartNode-1.1.3.install'));

                    stream.on('data', function(chunk) { // 当有数据流出时，写入数据
                        passedLength += chunk.length;
                        if (writeStream.write(chunk) === false) { // 如果没有写完，暂停读取流
                            stream.pause();
                        }
                    });

                    writeStream.on('drain', function() { // 写完后，继续读取
                        stream.resume();
                        
                        var percent = Math.ceil((passedLength / totalSize) * 100);
                        var size = Math.round((passedLength / (1024*1024))*100)/100;
                        var diff = Math.round((size - lastSize)*100)/100;
                        lastSize = size;
                        //out.clearLine();
                        //out.cursorTo(0);
                        console.log('已完成' + size + 'MB, ' + percent + '%, 速度：' + diff * 2 + 'MB/s');
                        var progress_txt = '{progress}已完成' + size + 'MB, ' + percent + '%, 速度：' + diff * 2 + 'MB/s';
                        ws.send(progress_txt);
                    });

                    stream.on('end', function() { // 当没有数据时，关闭数据流
                        writeStream.end();
                        ftpc.end();
                        var endTime = Date.now();
                        var totalTime = '共用时：' + Math.ceil((endTime - startTime) / 1000) + '秒。';
                        ws.send(totalTime);
                        ws.send('{download_finished}下载完成！');
                    });
                });
            });
            // connect to localhost:21 as anonymous
            ftpc.connect(ftpOptions);
        }

        function installSmartNode(ws,file){
            backUpOldVersion(ws,file);
        }

        function backUpOldVersion(ws,file){
            ws.send('{backup_start}正在备份当前版本...');
            fse.copy('./', '../bakup', function (err) {
              if (err){
                 ws.send('{backup_error}备份失败！');
                 console.error(err);
              }
              console.log('success!');
              ws.send('{backup_finished}备份完成！');
              //install
              install(ws,file);
            });
        }

        function install(ws,file){
            var installStatus = 1; // 1成功 0错误
            if (versionName.length == 0){
                versionName = file.name;
            }

            var cmd = 'cd /home/root && chmod a+x '+versionName;
            console.log(file);

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
                if (installStatus == 1){
                    installExtract(ws,versionName);
                }
            }); 
        }

        function installExtract(ws,filename){
            var installStatus = 1; // 1成功 0错误
            var cmd = 'cd /home/root && ./'+filename;
            console.log(cmd);
            var ls = cp.exec(cmd);

            ls.stdout.on('data', function (data) {
                installStatus = 1;
                console.log('stdout: ' + data);
                ws.send('{install_finished}'+data);
                if (data =='## 13.1 ## Start smartnode service'){
                    ws.send('{install_finished}安装成功！');
                }
            });

            ls.stderr.on('data', function (data) {
                installStatus = 0;
                console.log('stderr: ' + data);
            });

            ls.on('exit', function (code) {
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
                        ftpDownLoad(ws,file);
                    }
                    else if (message === 'version_list'){
                        ws.send('{version_list_start}正在获取版本列表...');
                        ftpGetVersionLists(ws);
                    }
                    else if (message.indexOf('{install}') != -1){
                        var version = message.replace('{install}','');
                        var data = version.split('|');
                        var file = {'name':data[0],'size':data[1]}
                        //installSmartNode(ws);
                        install(ws,file);
                    }
                });
            });
        }    

    }


    RED.nodes.registerType('upgrade', upgrade);
}