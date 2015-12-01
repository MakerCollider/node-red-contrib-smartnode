###屏幕控制节点
本节点使用ILI9225 TFT屏幕显示表情。

####参数配置
1. Name：节点名字。

####输入量
1. msg.payload:表情代号。

####输出量
1. 无。

####使用方法
1. 按照要求将屏幕接线。
2. 向节点输入`msg.payload`消息,其中0为笑脸,1为哭脸,2为平常脸。

####接线图
左侧为屏幕引脚,右侧为Edison Arduino Board引脚。

VCC : 5V
GND : GND
GND :
NC :
NC :
LED : 3.3V
CLK : 13
SDI : 11
RS : A0(14)
RST : A1(15)
CS : 9
