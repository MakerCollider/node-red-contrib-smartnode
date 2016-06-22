###音乐播放节点

本节点用于播放上传的音乐。

####配置参数
1. Name：节点名字。

####输入
1. msg.payload：控制音乐的播放和停止。

####输出
无

####使用方法
1. 使用前，使用文件上传功能上传要播放的音乐（目前仅支持wmv和mp3格式的音乐）。
2. 点击 **+file list** 增加播放项目，并选择音乐文件。
3. 程序部署后，可以通过输入序号播放相应的音乐，或者输入**0**结束播放。

###PlayAudio

This node can be used to play audio file.

####Config
1. Name：Name of node。

####Input
1. msg.payload：turn on/off music playing.

####Output
None

####HowTo
1. Please upload the audio file in node config frame before you use this node.
2. Inject the music number to play music, or inject **0** to stop playing.