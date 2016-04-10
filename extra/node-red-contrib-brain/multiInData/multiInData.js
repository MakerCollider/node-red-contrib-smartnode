module.exports = function(RED){
    var collect = require('../collect-defines');
    function multiInData(config){
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.rules = config.rules;
        var node = this;

        this.on('input', function(msg){
            
            for (var i=0; i<node.rules.length; i++) {
                if (node.rules[i].hasOwnProperty("name") && msg[node.rules[i].name] != null  && !isNaN(msg[node.rules[i].name])){
                    collect.setMultiDataValue(node.rules[i].name,msg[node.rules[i].name]);
                }
            }


            var arrData = Object.keys(_G_inMultiData);
            if (arrData.length == node.rules.length){
                msg.payload = _G_inMultiData;
                node.send(msg);
            }

        });
    }

    RED.nodes.registerType('multiInData', multiInData);
}