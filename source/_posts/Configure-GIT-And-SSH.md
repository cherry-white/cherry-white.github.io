---
title: 配置 Git 和 SSH
date: 2022-08-11 16:29:13
image: /images/background/Configure-GIT-And-SSH.jpg
tags: [Git, SSH]
categories:
- 配置
---

### Git 下载安装

直接去官网下载即可，安装过程直接下一步就行。[下载地址](https://git-scm.com/downloads)

### Git 配置

首先设置Git的 user name 和 email ：
```git
git config --global user.name "yourname"
```
```git
git config --global user.email "youremail@gmail.com"
```

### 生成密钥
在命令行执行以下命令：

建立密钥对，-t代表类型，有 RSA 和 DSA 两种
```shh
ssh-keygen -t rsa
```
或
```shh
ssh-keygen -t rsa -C “youremail@gmail.com”
```
按3个回车，密码为空。

生成的好的文件默认存放路径是在： C:\Users\你的用户名\.ssh

id_rsa是私钥，id_rsa.pub是公钥。

### GitHub配置
把公钥里面的字符串复制好，登录 Github，右上角个人，选 Settings，选SSH and GPG keys,再点New SSH key。

这里 Title 随便起个名，方便自己记，Key 的内容，就是 Ctrl+V 粘贴 id_rsa.pub 里的内容。

![配置SSH key](/images/article/configs/github-ssh.jpg)
