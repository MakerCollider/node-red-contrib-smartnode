###数字继电器节点
本节点表示Arduino套件里数字继电器节点。

####参数配置
Name：节点名称
Board：开发板选择
Digital Pin: 输入引脚

####输入量
msg.payload：输入1或者0
1表示打开数字继电器，0表示关闭

####输出量
无

####使用方法
配置好节点的每个参数。输入1表示打开继电器，输入0表示关闭继电器。
模块化的设计使其很容易同Arduino扩展板相连接。继电器的输出状态都由一个发光二极管表示，方便实际使用。
Relay module就是采用大电流优质继电器，提供1路输入与输出，最高可以接277V/10A的交流设备或28V/10A的直流设备，因此能够用来控制电灯、电机等设备。
在使用Arduino做互动项目时，很多大电流或高电压的设备通常无法直接用Arduino的数字IO口进行控制（如电磁阀、电灯、电机等），此时可以考虑用继电器的方案解决。
###Digital Relay Node
This node represents Digital Relay module in Arduino kit.

####Parameter Configuration
Name: node name
Board: arduino board select
Digital Pin: input pin

####Input
msg.payload：Input 1 or 0
1 : turn on the Digital Relay Node; 0 : close the Digital Relay Node

####Output
NULL

####Howto
Configure every parameter correctly.  1 : turn on the Digital Relay Node; 0 : close the Digital Relay Node
The modular design makes it easy to connect with Arduino expansion board. A relay output is represented by a light-emitting diode, convenient for practical use.
Relay module uses the high-quality high-current relay with one line input and output.It can connect up to 277V / 10A AC devices or 28V / 10A DC device, so it is possible to control lights, motors and other equipment.
When using the Arduino to do interactive projects, a lot of high-current or high-voltage equipment is usually not directly controlled (such as solenoid valves, lamps, motors, etc.), then you can consider the solution to use the relay with Arduino digital IO port.
