module.exports = function(RED) {
    function profileNode(config) {
        this.name = config.name;
        this.appkey = config.appkey;
        this.deviceName = config.deviceName;
        this.deviceId = config.deviceId;
        this.serverAddr = config.serverAddr;
        this.rules = config.rules;
        this.attrRules = config.attrRules;
        var node = this;
        
        var fs = require("fs");
        var path = require('path');
        var file = __dirname + '/../profile.json'; 
        var profile = JSON.parse(fs.readFileSync(file));  
        //console.log(profile);
        /*
        for (var device in profile) {
            if (device == 'dev_info'){
                console.log(profile[device].name);
                node.name = profile[device].name;
            }
            else{
                //node.rules[0].name = device;
            }
        };*/
       
        RED.nodes.createNode(node, config);

        //node.on('input', function(msg) {

        //});

        var profile = {};
        var lwm2m = {};
        lwm2m.addr = node.serverAddr;
        lwm2m.port = '5683';
        
        var devInfo = {};
        devInfo.appKey = node.appkey;
        devInfo.name = node.deviceName;
        devInfo.id = node.deviceId;
        devInfo.lwm2m = lwm2m;
        profile.dev_info = devInfo;

        for (var k in node.rules) {
            var attrs = {};
            for (var ck in node.attrRules) {
                if (node.rules[k].name == node.attrRules[ck].parent){
                    attrs[node.attrRules[ck].name] = 0;
                }
            }
            profile[node.rules[k].name] = attrs;

        }

        fs.writeFile(path.join(__dirname, '../profile.json'), JSON.stringify(profile), function (err) {
            if (err) {
                throw err;
            }
            console.log("Export Account Success!");
        });
    }

    RED.nodes.registerType("profile", profileNode);
}

