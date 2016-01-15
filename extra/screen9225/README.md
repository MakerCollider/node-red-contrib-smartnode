#ILI9225屏幕
本节点使用ILI9225 TFT屏幕显示图片。

####**参数配置**
1. Name：节点名字。

####**输入量**
1. msg.payload: 要显示的图像的序号（从0开始），或者清屏（-1）。
2. msg.imagePtr: 用于显示实时画面，接收来自摄像头，人脸识别等结点传入的实时图像。

####**输出量**
1. 无。

####**使用方法**
1. 按照要求将屏幕接线。
2. 向节点输入`msg.payload`或者`msg.imagePtr`消息，显示相应的图像。

####**接线图**
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

#ILI9225 Screen
This node can be used to show image from ILI9225 Screen.

####**Config**
1. Name：Name of this node。

####**Input**

1. msg.payload: Picture Index(start from 0), or clean the screen(-1).
2. msg.imagePtr: Receive the message from Camera node, Face Detect node, etc.

####**Output**
None

####**Howto**
1. Link the wires.
2. Use 'msg.payload' or 'msg.imagePtr' to show image.

####**Pin map**

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