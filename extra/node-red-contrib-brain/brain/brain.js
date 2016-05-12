var brain = require('brain');

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
                net.fromJSON(msg.netJSON);
                msg.payload = net.run(msg.runData);
                node.status({fill: 'green',shape: 'dot',text: 'running done'});
                node.send(msg)
            } 
            else {
                var trainData;
                if (typeof(msg.payload) == 'string'){
                    trainData = JSON.parse(msg.payload);
                }
                if (typeof(msg.payload) == 'object'){
                    trainData = msg.payload;
                }
                node.status({fill: 'yellow',shape: 'dot',text: 'training'});
                var trainStream = net.createTrainStream({
                    floodCallback: function() {
                        flood(trainStream, trainData);
                    },
                    doneTrainingCallback: function(obj) {
                        node.status({fill: 'green',shape: 'dot',text: 'trainning done'});
                        //msg.result = net.run(msg.runData)
                        msg.payload = net.toJSON();
                        console.log(msg.payload);
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