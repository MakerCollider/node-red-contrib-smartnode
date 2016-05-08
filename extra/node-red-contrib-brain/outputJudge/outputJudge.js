module.exports = function(RED){
    var collect = require('../collect-defines');
    function outputJudge(config){
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.rules = config.rules;
        this.judgeType = config.judgeType;
        this.resultValue = config.resultValue;
        var node = this;

        this.on('input', function(msg){
            var inData;
            if (typeof(msg.payload) == 'string'){
                inData = JSON.parse(msg.payload);
            }
            if (typeof(msg.payload) == 'object'){
                inData = msg.payload;
            }
            
            var currentValue = 0;
            var currentkey;
            for (var i=0; i<node.rules.length; i++) {
                if (node.rules[i].hasOwnProperty("name") && inData[node.rules[i].name] != null  && !isNaN(inData[node.rules[i].name])){
                    if (node.judgeType == 1){
                        if (inData[node.rules[i].name] > currentValue){
                            currentValue = inData[node.rules[i].name];
                            currentkey = node.rules[i].value;
                        }
                    }
                    else{
                        if (currentValue == 0){
                            currentValue = inData[node.rules[i].name];
                            currentkey = node.rules[i].value;
                        }
                        else if (inData[node.rules[i].name] <= currentValue){
                            currentValue = inData[node.rules[i].name];
                            currentkey = node.rules[i].value;
                        }
                    }
                }
            }

            var outData = {};
            if (currentkey != null){
                outData[node.resultValue] = parseInt(currentkey);
                msg.payload = outData;
                node.send(msg);
            }

        });
    }

    RED.nodes.registerType('outputJudge', outputJudge);
}