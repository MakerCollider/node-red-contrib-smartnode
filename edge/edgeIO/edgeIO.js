module.exports = function(RED) {
    var fs = require("fs");
    var file = __dirname + '/../profile.json'; 

    function edgeInNode(config) {
        this.name = config.name;
        this.service = config.service;
        this.attribute = config.attribute;
        var node = this;
        RED.nodes.createNode(node, config);
        var profile = JSON.parse(fs.readFileSync(file));

        edge.on('write', function(serviceName, attrName, val) {
            var edge = {
                "service": serviceName,
                "attr": attrName,
                "value": val
            };
            console.log('++++++++++');
            console.log(edge);
            var flag = false;
            if (node.service == serviceName && node.attribute == attrName){
                flag = true;
            }
            if (checkEdgeProfile(profile,edge) && flag == true){
                var msg = {};
                msg.payload = val;
                node.send(msg);
            } 
        });
    }

    RED.nodes.registerType("edgeIn", edgeInNode);


    function edgeOutNode(config) {     
        this.name = config.name;
        this.service = config.service;
        this.attribute = config.attribute;
        var node = this;
        RED.nodes.createNode(node, config);
        var profile = JSON.parse(fs.readFileSync(file));
        console.log('+++++++++++++++++++++++');
        //console.log(profile);

        node.on('input', function(msg) {
            var output = {
                'service':node.service,
                'attr':node.attribute,
                'value':msg.payload
            };

            if (checkEdgeProfile(profile,output)){
                edge.set(output.service, output.attr, output.value);
                edge.get(output.service,output.attr,function(result){
                    console.log(result);
                });
            }
        });

    }

    RED.nodes.registerType("edgeOut", edgeOutNode);

    function checkEdgeProfile(profile,edge){
        for (var dev in profile) {
            if (dev != 'dev_info'){
                for(var attr in profile[dev]){
                    if (edge.service == dev && edge.attr == attr){
                        return true;
                    }
                } 
            }

        }
        return false;
    }
}

