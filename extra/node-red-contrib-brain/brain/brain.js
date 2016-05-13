var brain = require('brain');
var netData;
module.exports = function(RED){
    function Brain(config){
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.brainType = config.brainType;
        this.learningRate = config.learningRate;
        this.hiddenLayers = config.hiddenLayers;
        this.errorThresh = config.errorThresh;
        this.iterations = config.iterations;
        this.logPeriod = config.logPeriod;
        var node = this;

        node.status({fill: 'grey',shape: 'dot',text: 'waiting'});

        this.on('input', function(msg){
            var hiddenLayers;
            if(!isNaN(node.hiddenLayers)){
               hiddenLayers = node.hiddenLayers;
            }
            else{
               hiddenLayers = node.hiddenLayers.split(',');
            }
            
            var neuralNetworkOptions = {
                hiddenLayers: hiddenLayers,//[6,8],
                learningRate: node.learningRate,
                iterations: node.iterations,
                errorThresh: node.errorThresh,  // error threshold to reach
                log: false,           // console.log() progress periodically
                logPeriod: node.logPeriod      // number of iterations between logging
            } 
           // console.log(neuralNetworkOptions);
            var net = new brain.NeuralNetwork(neuralNetworkOptions);

            if (node.brainType == 'run') {
                if (typeof(msg.netData) == 'string'){
                    netData = JSON.parse(msg.netData);
                }
                else if (typeof(msg.netData) == 'object'){
                    netData = msg.netData;
                }
                
                var runData;
                if (typeof(msg.runData) == 'string'){
                    runData = JSON.parse(msg.runData);
                }
                else if (typeof(msg.runData) == 'object'){
                    runData = msg.runData;
                }
                if (typeof(netData)!='undefined' && netData!=0 && typeof(runData)!='undefined' && runData!=0){
                    //console.log(typeof(netData));
                    //console.log('-------------');
                    //console.log(typeof(runData));
                    net.fromJSON(netData);
                    msg.payload = net.run(runData);
                    node.status({fill: 'green',shape: 'dot',text: 'running done'});
                    node.send(msg);
                }

            } 
            else {
                var trainData;
                if (typeof(msg.payload) == 'string'){
                    trainData = JSON.parse(msg.payload);
                }
                else if (typeof(msg.payload) == 'object'){
                    trainData = msg.payload;
                }
                node.status({fill: 'yellow',shape: 'dot',text: 'training'});
                var trainStream = net.createTrainStream({
                    floodCallback: function() {
                        flood(trainStream, trainData);
                    },
                    doneTrainingCallback: function(obj) {
                        node.status({fill: 'green',shape: 'dot',text: 'trainning done'});
                        msg.payload = net.toJSON();
                        node.send(msg);
                    }
                });

                flood(trainStream, trainData);

                function flood(stream, data) {
                    for (var i = 0; i < data.length; i++) {
                        stream.write(data[i]);
                    }
                    stream.write(null);
                }
            }
        });
    }

    RED.nodes.registerType('brain', Brain);
}