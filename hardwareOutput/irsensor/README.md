###红外数字避障传感器
本节点用于红外数字避障传感器

####参数配置
Name：节点名称
Board：开发板选择
Digital Pin: 输入引脚

####输入量
无

####输出量
msg.payload：有无障碍物

####使用方法
节点会在传感器被遮住时，发送0，无遮挡时发送1。

###Adjustable Infrared Sensor Switch
this node is for Adjustable Infrared Sensor Switch.

####Config
Name: node name
Board: arduino board select
Digital Pin: input pin

####Input
None

####Output
msg.payload: the state of switch.

####Howto
this node will send 1 when there is nothing in front of sensor, and send 0 on the opposite status.
