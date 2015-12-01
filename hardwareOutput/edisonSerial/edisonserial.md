###Edison 串口发送

本节点可以使用Edison的串口发送字符串

####配置参数
1. Name：节点名字
2. SerialBaudrate：串口波特率
3. SerialDatabits：数据位
4. SerialParity：校验位
5. SerialStopbits：停止位

####输入
1. msg.payload：待发送字符串

####输出
无

####使用方法
1. 串口使用Arduino扩展板上的0,1管脚。
2. 向节点传入`msg.payload`信息，节点每接收到一次就会发送一次。
