module.exports = function(RED) {

    function smartNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var fs = require('fs');
        kernelVersion = fs.readFileSync('/proc/version', 'utf-8');
        kernelVersion = kernelVersion.substring(0, kernelVersion.length-1);

        nodeJsVersion = process.version;

        nodeRedVersion = RED.version();

        var pkginfo = require('pkginfo')(module);
        smartNodeVersion = module.exports.version;
        
        this.status({fill:"green",shape:"dot",text:"Version"});

        function versionTimer(){
            msg = {
                KernelVersion:    kernelVersion,
                NodeJsVersion:    nodeJsVersion,
                NodeRedVersion:   nodeRedVersion,
                SmartNodeVersion: smartNodeVersion
            }
            node.send(msg);
        }
        var timer = setInterval(versionTimer, 5000);

        //Handle inputs
        this.on('input', function(msg) {
        });

        this.on('close', function() {
            clearInterval(node.timer);
        });
    }
    RED.nodes.registerType("SmartNode", smartNode);
}