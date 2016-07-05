###蜂鸣器节点
本节点表示Arduino套件的数字蜂鸣器模块。

####参数配置
Name：节点名称
Board：开发板选择
Digital Pin: 输入引脚

####输入量
msg.payload：输入1或者0
1表示打开数字蜂鸣器，0表示关闭

####输出量
无

####使用方法
配置好节点的每个参数。输入1表示打开蜂鸣器，输入0表示关闭蜂鸣器。
通过Arduino或者其他控制器就能轻松的控制蜂鸣器发出声音甚至MID音乐。 该模块与Arduino其他传感器结合使用，能够实现酷炫的声光互动作品。
###Piezo Node
This node represents Piezo module in Arduino kit.

####Parameter Configuration
Name: node name
Board: arduino board select
Digital Pin: input pin

####Input
msg.payload：Input 1 or 0
1 : turn on the Piezo; 0 : close the Piezo

####Output
NULL

####Howto
Configure every parameter correctly.  1 : turn on the Piezo; 0 : close the Piezo
It can easily control the piezo module to play sounds or music by Arduino or other controllers. Combined with other sensors, it can make cool and acousto-optic interaction works.
