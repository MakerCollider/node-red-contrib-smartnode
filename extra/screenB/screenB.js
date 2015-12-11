module.exports = function(RED) {

    var jslib = require('jsupm_hd44780');

    function screenB(config) {
        RED.nodes.createNode(this, config);
        
        console.log("ScreenB(HD44780) initalizing.......");

        var TYPE = Number(config.types);
        var RS = Number(config.rs);
        var EN = Number(config.en);
        var D4 = Number(config.d4);
        var D5 = Number(config.d5);
        var D6 = Number(config.d6);
        var D7 = Number(config.d7);

        var screen = new jslib.HD44780(RS, EN, D4, D5, D6, D7);
        screen.begin(16, 2);
        this.status({fill:"blue",shape:"dot",text:"Initalized"});
        console.log("ScreenB(HD44780) initalized!");

        var lastConsole = "";
        //Handle inputs
        this.on('input', function(msg) {
            if(msg.payload)
            {
                msg.payload = msg.payload.toString();
                screen.clear();
                if(TYPE == 0)
                {
                    if(msg.payload.length > 16)
                    {
                        tmpA = msg.payload.substring(0, 16);
                        tmpB = msg.payload.substring(16);

                        screen.setCursor(0, 0);
                        screen.writeStr(tmpA);
                        screen.setCursor(0, 1);
                        screen.writeStr(tmpB);
                    }
                    else
                        screen.writeStr(msg.payload);
                }
                else
                {
                    screen.setCursor(0, 0);
                    screen.writeStr(">" + lastConsole);
                    screen.setCursor(0, 1);
                    screen.writeStr(">" + msg.payload);
                    lastConsole = msg.payload;
                }
                this.status({fill:"blue",shape:"dot",text:"Showing"});
            }
        });

        this.on('close', function() {
            console.log("Stop Screen");
            screen.clear();
            delete screen; 
            this.status({fill:"red",shape:"ring",text:"closed"});
        });
    }
    RED.nodes.registerType("ScreenB", screenB);
}
