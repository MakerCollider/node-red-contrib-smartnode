###摄像头节点

本节点使用摄像头获取图像，并将图像数据发送至下一节点。

####配置参数
1. Name：节点名字
2. CameraId：要使用的摄像头编号
3. FrameConfig：图像分辨率
4. Mode: 运行模式
5. ImageName：**Shoot**模式时图像存储的位置
6. TimerVal：定时器时长

####输入
1. payload：开关摄像头

####输出1
1. topic: 数据类型，值为**imageStr**
2. payload：图像数据的内存地址，类型为cv::Mat

####输出2
1. topic：数据类型，值为**shoot**
2. payload: 存储图像的地址

####使用方法
1. 连接摄像头或者使用机身自带的摄像头
2. 设置运行模式、摄像头编号、Shoot模式时的文件的名字，图像获取周期
3. 在**Video**模式中，当输入的**payload**为1时，摄像头开启，并定时输出图像数据
4. 在**Shoot**模式中，当输入的**payload**为1时，摄像头拍摄一张图片并输出保存的路径


###Camera

This node can get image from camera and send it out

####Config
1. Name: node name
2. CameraId: camera id
3. FrameConfig: the resolution of image
4. Mode: node mode(video or shoot)
5. ImageName: the name of image file when in shoot mode
6. TimerVal: timer

####Input
1. payload: switch

####Output1
1. topic: message type, the value is **imageStr**
2. payload: image pointer, type is cv::Mat

####Output2
1. topic: message type, the value is **shoot**
2. payload: image file path

####Howto
1. Setup camera
2. Set node mode, camera id, timerval and image name.
3. In **Video** mode, the node will send out image pointer periodically
4. In **Shoot** mode, the node will capture an image and send out the image file path