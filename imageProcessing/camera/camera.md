###摄像头节点

本节点使用摄像头获取图像，并将图像数据发送至下一节点。

####配置参数
1. Name：节点名字。
2. CameraId：要使用的摄像头编号。
3. FrameConfig：图像分辨率。
4. TimerVal：定时器时长。

####输入
1. msg.payload：开关摄像头。

####输出
1. msg.imagePtr：图像数据包。

####使用方法
1. 将摄像头插入Edison的USB口。
2. 设置参数，如果只有一个摄像头，CameraId为0。
3. 当`msg.payload`为1时，摄像头开启，并定时输出图像数据。
4. 输出内容为格式化字符串，样式为`Camera:xxxxxxxx`，其中`xxxxxxx`为`cv:Mat`类型的指针，存有摄像头读取到的图像。
