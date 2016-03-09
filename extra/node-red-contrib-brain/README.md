# node-red-contrib-brain

[![npm](https://img.shields.io/npm/dm/node-red-contrib-brain.svg)](https://www.npmjs.com/package/node-red-contrib-brain)
[![npm](https://img.shields.io/npm/v/node-red-contrib-brain.svg)](https://www.npmjs.com/package/node-red-contrib-brain)

# Install

```bash

$ cd $HOME/.node-red
$ npm install node-red-contrib-brain

```

Or globally alongside Node-RED:

```bash

sudo npm install -g node-red-contrib-brain

```

**You will need to restart Node-RED for it to pick-up the new nodes.**

# Usage

node-red-contrib-brain is based on [brain](https://github.com/harthur/brain). You need to see it basic usage at first.

## Train

When there is no `msg.netJSON` input, `brain` node will train with `msg.trainData` and output `net.toJSON` in `msg.net`.

## Run

When there is `msg.netJSON` input, `brain` node will not train anymore. Instead, it will directory run `net.run()` with your `msg.runData`. And output the result in `msg.payload`.

## Options

You could pass a `msg.neuralNetworkOptions` to brain node. See [brain options doc](https://github.com/harthur/brain/#options-1).

# Example

Train:

```json
[{"id":"d4a484b.f2b5b78","type":"debug","z":"46d50fa1.b92af","name":"","active":true,"console":"false","complete":"net","x":679,"y":175,"wires":[]},{"id":"3b4d60b3.c4b2a","type":"inject","z":"46d50fa1.b92af","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":150,"y":144,"wires":[["6d766489.92899c"]]},{"id":"6d766489.92899c","type":"function","z":"46d50fa1.b92af","name":"fake data","func":"// This function return a fake json array\nvar trainData = [{input: { r: 0.03, g: 0.7, b: 0.5 }, output: { black: 1 }},\n           {input: { r: 0.16, g: 0.09, b: 0.2 }, output: { white: 1 }},\n           {input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 }}]\n\nmsg.trainData = trainData\nreturn msg;","outputs":1,"noerr":0,"x":333,"y":183,"wires":[["2fe2efbc.d01d1"]]},{"id":"2fe2efbc.d01d1","type":"brain","z":"46d50fa1.b92af","name":"brain","learningRate":0.3,"errorThresh":0.005,"iterations":20000,"log":false,"logPeriod":10,"x":516,"y":185,"wires":[["d4a484b.f2b5b78"]]}]
```

Run:

```json
[{"id":"10d56f1d.ef2a91","type":"debug","z":"46d50fa1.b92af","name":"","active":true,"console":"false","complete":"payload","x":687,"y":346,"wires":[]},{"id":"808a1160.7f75f","type":"inject","z":"46d50fa1.b92af","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":131,"y":325,"wires":[["fbed5f0e.0412a"]]},{"id":"fbed5f0e.0412a","type":"function","z":"46d50fa1.b92af","name":"fake data","func":"// This function return a fake json array\nvar netJSON = {\"layers\":[{\"r\":{},\"g\":{},\"b\":{}},{\"0\":{\"bias\":0.5976173927716023,\"weights\":{\"r\":3.5006895738532835,\"g\":-4.542455700505483,\"b\":0.9988932386815509}},\"1\":{\"bias\":0.6470978455858952,\"weights\":{\"r\":3.6115725201557827,\"g\":-4.875546614413311,\"b\":1.211740813346471}},\"2\":{\"bias\":-0.3559477465736521,\"weights\":{\"r\":1.1063595019849224,\"g\":-1.857026678772011,\"b\":0.14886809335684345}}},{\"black\":{\"bias\":3.3336645409591017,\"weights\":{\"0\":-3.7876606581596914,\"1\":-4.023316483216229,\"2\":-1.0819957068479935}},\"white\":{\"bias\":-3.29149645757729,\"weights\":{\"0\":3.782751737648757,\"1\":4.173873416865656,\"2\":0.7154074171638515}}}],\"outputLookup\":true,\"inputLookup\":true}    \nvar runData = { r: 1, g: 0.4, b: 0 }\n\nmsg.runData = runData\nmsg.netJSON = netJSON\nreturn msg;","outputs":1,"noerr":0,"x":315,"y":336,"wires":[["3132e68b.cecd1a"]]},{"id":"3132e68b.cecd1a","type":"brain","z":"46d50fa1.b92af","name":"brain","learningRate":0.3,"errorThresh":0.005,"iterations":20000,"log":false,"logPeriod":10,"x":501,"y":341,"wires":[["10d56f1d.ef2a91"]]}]
```


# License 

MIT License