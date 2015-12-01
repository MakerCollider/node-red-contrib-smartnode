###OpenJumper L298 H桥电机驱动板节点
本节点使用`upm_ojl298`控制电机。节点中规定，电机旋转方向是面向电机输出轴时的旋转方向。

####参数配置
1. Name：参数配置
2. pwm：电机pwm引脚
3. Dir：电机dir引脚
4. Speed：电机速度
5. Timeout：超时时间

####输入量
1. msg.speed：速度
2. msg.direction：方向
3. msg.timeout:运行时间

####输出量
无

####使用方法
1. 配置好节点的每个参数。
2. 使用时，通过发送`msg`控制小车的行进。
3. `msg.direction`的值为0-2的整数，从零开始分别代表的是`逆时针`、`顺时针`和`停止`。
4. `msg.speed`的值为0-100的整数，表示速度的百分比。
5. `msg.timeout`的值为0-100的小数，表示运行时间，单位为秒。
4. 在不设置`msg.speed`和`msg.timeout`时，节点会使用参数中的值作为默认值。需要注意的是，如果使用过`msg.speed`和`msg.timeout`，之后的默认值都会发生改变。
