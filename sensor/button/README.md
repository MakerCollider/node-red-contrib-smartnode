###数字按钮节点
本节点表示Arduino套件的按钮模块。

####参数配置
Name：节点名称
Board：开发板选择
Digital Pin: 输入引脚
Impulse：脉冲时长，以毫秒为单位

####输入量
无

####输出量
msg.payload：输出1或者0

####使用方法
配置好节点的每个参数，Impulse代表按钮按下多长时间代表一次按下操作，时间越短，按钮越灵敏。
按钮按下<code>msg.payload</code>输出1，按钮弹起输出0。
###Digital Button Node
The node represents the button module in Arduino kit.

####Parameter Configuration
Name: node name
Board: arduino board select
Digital Pin: input pin
Impulse： The impulse length, in milliseconds

####Input
Null

####Output
msg.payload: Output 1 or 0

####Howto
Configure each parameter correctly,Impulse represents that pressing the button how long time means a pressing operation. The shorter the time is, the more sensitive button is.
Press the button, <code>msg.payload</code> outputs 1，Release the button, outputs 0.
