module.exports = function(RED) {
    function SubStringNode(config) {
        RED.nodes.createNode(this, config);
		this.From=config.From;
		this.To=config.To;
        var node = this;
		var length;
		
			this.on('input', function(msg) {
			length=Number(node.To)-Number(node.From)+1;
				if(Number(node.From) >= String(msg.payload).length || Number(node.To) >= String(msg.payload).length)
						msg.payload="Out of bounds";
					else if(Number(node.From)>Number(node.To))
						msg.payload="The 'from' can not > 'to'";
					else 
						msg.payload=String(msg.payload).substr(Number(node.From),length);
				node.send(msg);
			});
			this.on('close',function(){	
			});
	}
		RED.nodes.registerType("substring",SubStringNode);
}
