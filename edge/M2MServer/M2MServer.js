module.exports = function(RED) {
    var edgeServer = require(__dirname + '/../edgeServer');
    var server = new edgeServer();
    var strDeviceList;
    var objDeviceList = [];
    function M2MServerNode(config) {  
        this.name = config.name;
        var node = this;

        RED.nodes.createNode(node, config);
        
        server.on('write', function(data) {
            console.log('----------------callback begin----------------');
            console.log('callback write:'+data);
            console.log('----------------callback end----------------');

            var msg = {};
            if (typeof(data) == 'string'){
                msg.payload = JSON.parse(data);
            }
            else if (typeof(data) == 'object'){
                msg.payload = data;
            }

            if (msg != null){
                node.send(msg);
            }
            
        });

        server.on('writelist', function(data) {
            console.log('----------------callback begin----------------');
            console.log('callback write3:'+data);
            console.log('----------------callback end----------------');
            strDeviceList = data;
            addDevicelist();
        });

        function addDevicelist(){
            if (typeof(strDeviceList) == 'string'){
                var devices = JSON.parse(strDeviceList);
                for (var d in devices) {
                    for (var i in devices[d]) {
                        console.log(devices[d][i].prof.dev_info.name+'=='+devices[d][i].devInfo.name);
                        console.log('---------------');

                        var objDevice = {};
                        objDevice.appKey = devices[d][i].prof.dev_info.appKey;
                        objDevice.name = devices[d][i].prof.dev_info.name;
                        objDevice.id = devices[d][i].prof.dev_info.id;
                        var serviceList = [];
                        for (var n in devices[d][i].prof) {
                            if (n != 'dev_info'){
                                var ls = {};
                                ls[n] = devices[d][i].prof[n];
                                serviceList.push(ls);
                            }
                        }
                        objDevice.services = serviceList;
                        objDevice.lwm2m = devices[d][i].prof.dev_info.lwm2m;
                        objDevice.devInfo = devices[d][i].devInfo;
                                    
                        if (objDeviceList.length == 0){
                            objDeviceList.push(objDevice);
                        }
                        else{
                            if (replaceDevice(objDevice) == false){
                                objDeviceList.push(objDevice);
                            }
                        }
                    }
                }

            }
        }

        function replaceDevice(device){
            for (var b in objDeviceList) {
                if (objDeviceList[b].id == device.id){
                    objDeviceList.splice(b,1);
                    objDeviceList.push(device);
                    return true;
                }
            }
            return false;
        }

        if (ws_listen_status == 0){
            var WebSocketServer = require('ws').Server;
            wss = new WebSocketServer({port: 8081});
            ws_listen_status = 1;
            wss.on('connection', function(ws) {
                ws.on('message', function(message) {
                    console.log('received: %s', message);
                    
                    if (message.indexOf('{deviceList}') != -1){
                        ws.send('$list$'+JSON.stringify(objDeviceList));
                    }
                });
            });
        }   
    }
    RED.nodes.registerType("M2MServer", M2MServerNode);

}

