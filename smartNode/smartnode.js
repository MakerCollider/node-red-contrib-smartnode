module.exports = function(RED) {

    function smartNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var fs = require('fs');
        kernelVersion = fs.readFileSync('/proc/version', 'utf-8');
        kernelVersion = kernelVersion.substring(0, kernelVersion.length-1);

        nodeJsVersion = process.version;
        nodeRedVersion = RED.version();

        upm_mcVersion = require('/usr/lib/node_modules/jsupm_camera/package.json').version;
        upmVersion = require('/usr/lib/node_modules/jsupm_grove/package.json').version;

        mraaVersion = require('/usr/lib/node_modules/mraa/package.json').version;

        smartNodeVersion = require('node-red-contrib-smartnode/package.json').version;
        smartNodeHookVersion = require('node-red-contrib-smartnode-hook/package.json').version;
        smartNodeSeeedVersion = require('node-red-contrib-smartnode-seeed/package.json').version;
        smartNodeDFRobotVersion = require('node-red-contrib-smartnode-dfrobot/package.json').version;

        this.status({fill:"green",shape:"dot",text:"Version"});

        function versionTimer(){
            msg = {
                NodeJs:            nodeJsVersion,
                NodeRed:           nodeRedVersion,
                mraa:              mraaVersion,
                upm:               upmVersion,
                upm_mc:            upm_mcVersion,
                SmartNode:         smartNodeVersion,
                SmartNodeHook:     smartNodeHookVersion,
                SmartNodeSeeed:    smartNodeSeeedVersion,
                SmartNodeDFRobot:  smartNodeDFRobotVersion,
                Kernel:            kernelVersion
            }
            node.send(msg);
        }
        node.timer = setInterval(versionTimer, 5000);

        this.on('input', function(msg) {
        });

        this.on('close', function() {
            clearInterval(node.timer);
        });
    }
    RED.nodes.registerType("SmartNode", smartNode);
}