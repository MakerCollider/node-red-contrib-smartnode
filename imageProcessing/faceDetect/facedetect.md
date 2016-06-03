###人脸识别
本节用于识别人脸

####配置参数
1. Name：节点名字

####输入
1. topic: 数据类型，值为**imageStr**
2. payload: 图像指针，类型为cv::Mat

####输出1
1. topic: 数据类型，值为**faceNumber**
2. payload：人脸个数

####输出2
1. topic: 数据类型，值为**imageStr**
2. payload: 图像指针，类型为cv::Mat

####使用方法
1. 输出2中的图像会标识出识别到的人脸


###FaceDetect

This node can detect face form camera

####Config
1. Name: Node name

####Input
1. topic: message type, the value is **imageStr**
2. payload: image pointer, the type is cv::Mat

####Output1
1. topic: message type, the value is **faceNumber**
2. payload: face number

####Output2
1. topic: message type, the value is **imageStr**
2. payload: image pointer, the type is cv::Mat

####Howto
1. The image in output2 circles the detected faces.