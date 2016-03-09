var brain = require('brain')

module.exports = function(RED){
  function Brain(config){
    RED.nodes.createNode(this, config)

    var node = this

    node.status({
      fill: 'grey',
      shape: 'dot',
      text: 'waiting'
    })

    this.on('input', function(msg){

      var net = new brain.NeuralNetwork(msg.neuralNetworkOptions)

      if (msg.netJSON) {
        // 不训练
        net.fromJSON(msg.netJSON)
        msg.payload = net.run(msg.runData)
        node.status({
          fill: 'green',
          shape: 'dot',
          text: 'running done'
        })
        node.send(msg)
      } else {
        node.status({
          fill: 'yellow',
          shape: 'dot',
          text: 'training'
        })

        var trainStream = net.createTrainStream({

          floodCallback: function() {
            flood(trainStream, msg.trainData);
          },

          doneTrainingCallback: function(obj) {
            node.status({
              fill: 'green',
              shape: 'dot',
              text: 'trainning done'
            })
            // msg.result = net.run(msg.runData)
            msg.net = net.toJSON()
            node.send(msg)
          }
        });

        flood(trainStream, msg.trainData);

        function flood(stream, data) {
          for (var i = 0; i < data.length; i++) {
            stream.write(data[i]);
          }

          stream.write(null);
        }
      }
    })
  }

  RED.nodes.registerType('brain', Brain)
}