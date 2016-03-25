###条件开关

本节点可以使用多个条件控制节点的通断。

####配置参数
1. 名字：节点名字
2. 规则：作为条件的主题和条件为真时的值。

####输入
1. msg.*：任意主题的消息。

####输出
1. msg.*：输入到该节点的消息（开关打开时）

####使用方法
1. 在**规则**中增加用于条件判断的主题和条件为真时的值。
2. 连接对应的输入和输出。
4. 部署后，如果节点收到了规则中定义的所有消息，则节点状态为开，此时任何输入到节点的消息都会被放过。
5. 如果有一个条件不满足，则节点的状态为关，此时任何输入到节点的消息都不会被发送到下一级。
6. 能输出的消息始终不包含用于条件判断的主题。

###Condition Toggle

Condition Toggle

####Config
1. Name: Name of node
2. Rules: condition topic and the value.

####Input
1. msg.*: any

####Output
2. msg.*: any(only when toggle is on)

####HowTo
1. Add rules in config window.
2. Connect input, output and then deploy.
3. When the node get all conditions, the node will send any message it recieved.
4. When any of conditions is false, the node will not send any message to the next node.
5. The conditions can not be sent out.