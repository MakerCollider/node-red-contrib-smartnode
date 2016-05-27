module.exports = function(RED) {
    var edgeServer = require(__dirname + '/../edgeServer');
    var server = new edgeServer();
    function M2MEdgeInNode(config) { 


        this.name = config.name;
        this.device = config.device;
        var node = this;

        RED.nodes.createNode(node, config);

        node.on('input', function(msg) {
            console.log('In:');
            console.log(msg.payload);

            console.log(typeof(node.device) + node.device);

            var edgeDev = JSON.parse(node.device);

            
            var data;
            if (typeof(msg.payload) == 'string'){
                data = JSON.parse(msg.payload);
            }
            else if (typeof(msg.payload) == 'object'){
                data = msg.payload;
            }

            if (data.hasOwnProperty("profId")){
               if (edgeDev.id == data.profId){
                   node.send(msg);
               }
            }
        });
    }
    RED.nodes.registerType("M2MEdgeIn", M2MEdgeInNode);

    function M2MEdgeOutNode(config) {  
        this.name = config.name;
        this.device = config.device;
        var node = this;

        RED.nodes.createNode(node, config);

        node.on('input', function(msg) {
            console.log('Out:');
            console.log(msg.payload);
            
            console.log(typeof(node.device) + node.device);

            var edgeDev = JSON.parse(node.device);
            
            var data;
            if (typeof(msg.payload) == 'string'){
                data = JSON.parse(msg.payload);
            }
            else if (typeof(msg.payload) == 'object'){
                data = msg.payload;
            }

            if (data.hasOwnProperty("serviceName") && data.hasOwnProperty("attrName")){
                data.profId = edgeDev.id;
                data.devInfoId = edgeDev.devInfo.id;
                msg.payload = data;
                server.set(data.devInfoId,JSON.stringify(data));
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("M2MEdgeOut", M2MEdgeOutNode);

}

