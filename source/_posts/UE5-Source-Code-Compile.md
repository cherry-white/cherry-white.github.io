---
title: UE5 源码编译
date: 2022-08-13 18:12:32
image: /images/background/UE5-Source-Code-Compile.jpg
tags: [UE5, 虚幻, 源码]
categories:
- 虚幻
- 源码
---

### UE5源码

UE5源码Github地址：[https://github.com/EpicGames/UnrealEngine](https://github.com/EpicGames/UnrealEngine)

UnrealEngine是个开源商业引擎，但是它在GitHub上的开源是个私有库，所以需要申请EpicGames账户和Github账号的绑定授权才能进行下载。

注册登录EpicGames账户[https://www.unrealengine.com/zh-CN/](https://www.unrealengine.com/zh-CN/)

登录成功后点开右上角个人信息，点连接，点账户，选择Github进行关联，再登录你的GitHub账号授权。

![授权登录](/images/article/UnrealEngine/AuthorizedLogin.jpg)

授权成功后Github会发送一封验证邮件，激活一下就可以了。

![激活](/images/article/UnrealEngine/JoinEpicGames.jpg)

### 下载源码

找一个合适的目录执行命令 repo clone 到本地
```git
git clone git@github.com:EpicGames/UnrealEngine.git
```
代码clone下来之后，首先打个 `git branch --all` 命令，可以看到许多分支，本地有是白色的，当前分支是绿色的，远端分支本地没有则是红色的。

![Unreal代码分支](/images/article/UnrealEngine/UnrealCodeBranch.jpg)

然后输入 `git checkout ue5-early-access`，切换到UE5抢先体验版分支，下载过程可能有点久。

UE5 上最活跃的开发发生在 `ue5-main` 分支。这个分支是引擎的前沿，它甚至可能无法编译。

要获得 UE5 的稳定早期访问版本，使用 `ue5-early-access` 分支。具体可以参考`README.md`.

当代码完全下载下来后进入目录

1. 运行 `Setup.bat`，它会帮你装 UE5 需要的依赖库，要挺久的，等它慢慢完成。
2. 运行 `GenerateProjectFiles.bat` 它帮你装缺失的库，然后生成 `UE5.sln`。
3. 使用 Rider 打开目录 `UE5.sln`，设置 UE5 设为启动项目 并运行。
   
![设置启动项为UE5](/images/article/UnrealEngine/SetRunUE5.jpg)
