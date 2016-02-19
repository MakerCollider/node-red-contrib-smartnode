###图像转流数据

本节点使用Base64对传入的图像进行编码，生成具有头信息的base64图像流

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

###Image2Stream

This node convert image data to base64 stream(with header)

####Param
1. Name：Node name

####Input
1. msg.imagePtr：Image to convert

####Output
1. msg.payload：Base64 stream

####HowTo
1. Send `msg.imagePtr` message to this node, and the node will convert the image to base64 stream.
2. `msg.imagePtr` is a formatted message, like `Camera:xxxxxxxx`, `xxxxxxx` is a pointer of `cv:Mat` type value.