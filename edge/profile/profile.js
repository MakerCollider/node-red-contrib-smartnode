module.exports = function(RED) {
    var fs = require("fs");
    
    function profileNode(config) {  
        this.name = config.name;
        this.rules = config.rules;
        this.attrRules = config.attrRules;
        var node = this;
        
        var file = __dirname + '/../profile.json'; 
        var profile = JSON.parse(fs.readFileSync(file));  
        console.log(profile);
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
    }

    RED.nodes.registerType("profile", profileNode);
}

