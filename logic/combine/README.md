###融合节点

本节点用于融合多个节点的信息

####配置参数
1. 名字：节点名字
2. 规则：要融合的主题
3. 超时：输入等待超时的时间，单位秒，如果为零，则无限等待

####输入
1. msg.*：和规则中的输入项对应

####输出
1. msg.*：融合后消息

####使用方法
1. 在**规则**中增加要监听的输入主题。
2. 设置超时时间。
3. 连接对应的输入和输出。
4. 部署后，节点会尝试收集所有在列别中的消息，当节点收集到全部的消息，或者输入超时，节点会将收集到的信息合并起来一次发送出去。
5. 超时从最后一次接收到信息的时候算起。

###Combine

This node can be used to combine multi message

####Config
1. Name: Name of node
2. Rules: msg topic to combine
3. Timeout: Input Timeout, if zero, then waitting forever.

####Input
1. msg.*: message which is in rule list

####Output
2. msg.*: output message.

####HowTo
1. Add message topic to rule list.
2. Set timeout.
3. Connect input and output.
4. After deploy, the node whill collect message which is in rule list. When the node get all messages or timeout, it will send a message which has all topic it collected.