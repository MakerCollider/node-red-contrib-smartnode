/**
 * Copyright 2015, 2015 MakerCollider.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    RED.nodes.registerType("I2cServo", I2cServo);
    var m = require("mraa");
    // helper function to go from hex val to dec 
    function char(x) { return parseInt(x, 16); } 

    function I2cServo(config) {
        RED.nodes.createNode(this, config);
        this.ServoType = config.ServoType;
	    this.ServoNumber=config.ServoNumber;
        this.ServoSpeed=config.ServoSpeed;
        var node = this;
        
 
        x = new m.I2c(6);
        x.address(0x40);
       
        // initialise device 
        if (x.readReg(char('0xfe')) != char('0x79')) { 
            x.writeReg(char('0x0'),char('0x11'));//关闭时钟
            x.writeReg(char('0xfe'), char('0x79'));//config the frequence to 50hz
            x.writeReg(char('0x0'),char('0x81'));//开启时钟并重新启动 
        }
        
         
        var intervalID;
        var nowAngle=90;
        motorActive(nowAngle);
        this.on('input', function(msg){
            var targetAngle = Number(msg.payload);
            if(node.ServoSpeed == 9){
                motorActive(targetAngle);//速度最快直接旋转舵机
            }
            else{
                clearInterval(intervalID);
                intervalID = setInterval(function(){
                    
                    if(targetAngle-nowAngle>0){
                        nowAngle++;
                        motorActive(nowAngle);
                        console.log("test1:"+nowAngle);
                    }
                    if(targetAngle-nowAngle<0){
                        nowAngle--;
                        motorActive(nowAngle);
                        console.log("test2:"+nowAngle);
                    }
                    if(targetAngle-nowAngle ==0){
                        clearInterval(intervalID);
                        console.log("test3:"+nowAngle);
                    }
                },(9-node.ServoSpeed)*10);
            }
            
        });

        this.on('close', function() {
            clearInterval(intervalID);
        });
        function motorActive(angle){
                switch(node.ServoType>>>0){
                case 0: //Futaba S9156
                    angle = 90-angle;
                    if(angle <0 || angle >90) { console.log("The input parameter is wrong!  Range:0~90°"); return ;}
                    angle = angle*(430-270)/90+270;//Futaba S9156 310-390 对应 0-45° 最大范围169-471
                    console.log("Futaba");
                    break;
                case 1: //EMAX ES08MAII
                    if(angle<0 ||angle>180){ console.log("The input parameter is wrong! Range:0~180°"); return ;}
                    angle = angle*(550-150)/180+150;
                    console.log("EMAX");
                    break;
                default:
                    break;
            }
            var H = 0x00;
            var L = 0xcb;
            
            console.log(~~angle);
            if((angle>>8) != 0){//angle>255
                H = angle>>8;
                L = angle & 0xff;
            }
            else
            {
                H = 0;
                L = angle;
            }
            // we want to read temperature so write 0x2e into control reg
            x.writeReg(char('0x06')+4*node.ServoNumber, char('0x00')); 
            x.writeReg(char('0x07')+4*node.ServoNumber, char('0x00')); 
            x.writeReg(char('0x08')+4*node.ServoNumber, L); 
            x.writeReg(char('0x09')+4*node.ServoNumber, H);
            //console.log(L);
            //console.log(H);
        } 
    }
   
}
