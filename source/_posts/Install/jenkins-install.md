---
title: Jenkins 安装
date: 2021-12-04 21:41:10
image: /images/background/jenkins-install.jpg
tags: [jenkins, CI/CD]
categories:
- 安装
---

### Jenkins简介
Jenkins是一个用Java编写的开源的持续集成工具，提供了软件开发的持续集成服务。

#### [官方地址](https://www.jenkins.io/zh/)

### Jenkins安装部署

1. 安装JDK

jenkins推荐安装[JDK11](http://jdk.java.net/java-se-ri/11)

```bash
// 下载JDK
wget https://download.java.net/openjdk/jdk11/ri/openjdk-11+28_linux-x64_bin.tar.gz

// 解压JDK
tar -zxvf openjdk-11+28_linux-x64_bin.tar.gz

// 配置环境变量
vim /etc/profile

// 在/etc/profile底部加入
export JAVA_HOME=/opt/jdk-11
export CLASSPATH=.:${JAVA_HOME}/lib
export PATH=${PATH}:${JAVA_HOME}/bin

// 刷新文件
source /etc/profile

// 查看Java版本是否和下载的一致
java -version

// 我的JDK显示一下信息
openjdk version "11" 2018-09-25
OpenJDK Runtime Environment 18.9 (build 11+28)
OpenJDK 64-Bit Server VM 18.9 (build 11+28, mixed mode)
```

2. 下载Jenkins

[根据自己实际情况在官网下载](https://www.jenkins.io/zh/download/)

我使用的是Debian系统，[安装过程](https://pkg.jenkins.io/debian-stable/)

3. 启动jenkins

启动命令

```bash
sudo service jenkins start
```
如果启动报错

```bash
Job for jenkins.service failed because the control process exited with error code.
See "systemctl status jenkins.service" and "journalctl -xe" for details.
```
大概率就是/etc/init.d/jenkins文件读取不到JDK
```bash
// 打开文件
sudo vim /etc/init.d/jenkins

// 需要在PATH变量加入java的路径 将java路径改成你自己的
PATH=/bin:/usr/bin:/sbin:/usr/sbin:/home/sakura/jdk-11/bin

// 刷新配置
sudo systemctl daemon-reload

// 启动jenkins
sudo service jenkins start
```

4. 进入Jenkins

在浏览器输入 http://IP:8080 进入 Jenkins 页面

大概率会看到以下报错
```bash
AWT is not properly configured on this server. Perhaps you need to run your container with 
"-Djava.awt.headless=true"? See also: https://www.jenkins.io/redirect/troubleshooting/java.awt.headless
```

就是因为系统没有字体导致的，[需要根据自己系统安装工具](https://www.jenkins.io/redirect/troubleshooting/java.awt.headless) 
我的服务器需要安装以下工具
```bash
// 安装这个就够了
sudo apt-get install fontconfig

// 实在不行在安装这两个
sudo apt-get install ttf-dejavu
sudo apt-get install xvfb

fc-cache --force

// 重启jenkins
sudo service jenkins restart
```

刷新 Jenkins 页面可以看到以下话面
![安装 Jenkins](/images/article/jenkins/install.png)

根据浏览器提示进行找到密码并继续

选择 安装推荐的插件 安装Jenkins，并等待安装

插件安装失败不用紧，直接继续就好了，有需要就创建用户，没需要就使用admin账号

进入jenkins之后最好修改以下admin密码

admin -> configure 拉到下面可以修改账号密码

Manage Jenkins -> Manager Plugin -> ADVANCED 
最下面有 Update Site 设置为：
https://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json

修改为中文需要安装插件 Localization: Chinese（Simplified）

以上就是安装Jenkins的全过程了，如果什么问题可以在下方评论。
