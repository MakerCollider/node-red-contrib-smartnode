###Base64图形编码

本节点使用Base64对传入的图像进行编码，供`dispImg`进行显示。

####配置参数
1. Name：节点名字

####输入
1. msg.imagePtr：输入的图像

####输出
1. msg.payload：Base64编码后的数据

####使用方法
1. 使用时，向节点传入`msg.imagePtr`消息，节点收到消息后，会将对应的图像转换为Base64编码数据。
2. 如果输入的数据不正确，节点会显示InputError，需要检查输入节点的信息是否正确。
3. `msg.imagePtr`的数据内容为格式化字符串，样式为`Camera:xxxxxxxx`，其中`xxxxxxx`为`cv:Mat`类型的指针，存有摄像头读取到的图像。
