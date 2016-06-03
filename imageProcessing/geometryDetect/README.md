###几何图形识别
本节点用于几何图形识别，目前支持圆形和矩形的识别

####配置参数
1. Name：节点名字

####输入
1. topic: 数据类型，值为**imageStr**
2. payload: 图像指针，类型为cv::Mat

####输出1
1. topic: 数据类型，值为**geometryType**
2. payload：几何图形类别

####输出2
1. topic: 数据类型，值为**imageStr**
2. payload: 图像指针，类型为cv::Mat

####使用方法
1. 输出1中的**payload**的值为0-3的整数，0为输入错误，1为无图形，2为矩形，3为圆形。


###GeometryDetect

This node can detect circle and geometry from camera
####Config
1. Name: Node name

####Input
1. topic: message type, the value is **imageStr**
2. payload: image pointer, the type is cv::Mat

####Output1
1. topic: message type, the value is **geometryType**
2. payload: geometry type

####Output2
1. topic: message type, the value is **imageStr**
2. payload: image pointer, the type is cv::Mat

####Howto
1. The **payload** of output1 has 4 values: 0(input error), 1(no result), 2(rectangle), 3(circle)
