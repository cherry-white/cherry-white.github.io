---
title: 现代游戏引擎 - 游戏引擎导论（一）
image: /images/background/Introduction-Game-Engine.jpg
tags: [游戏引擎, Game104]
date: 2022-08-29 20:51:58
categories:
- 游戏引擎
---
## 前言
游戏最奇妙的点在于每个人都很熟悉，但却很少有人能够意识到其中的高深之处。游戏中的每一个画面，每一个细节，都是在计算机中由0和1模拟出来的。一款游戏的制作十分复杂，它其中包含了计算机科学中几乎所有的知识门类。
![前言](/images/article/Games104/01/Games104_01_01.png)

## 为什么学游戏引擎
因为下一个时代将是由游戏引擎构建的虚拟现实的时代，现今的游戏引擎已经发展成为很多东西的底层技术支撑。

### 其实现在很多技术都离不开Game Engine:

1. 虚拟人技术：过去二十年中工业界致力于在游戏中完美的还原角色在现实世界中的各种表现，如头发的simulation，皮肤的材质模拟
2. 影视行业：通过游戏引擎搭建出场景然后显示在一个巨大的LED屏幕上，演员在屏幕前进行表演，这样导演可以十分便捷的在引擎中调整场景细节或者光照天气等因素。
3. 军事模拟：在虚拟世界中模拟军事演练。
4. Digital Twin:把现实世界中的物体在虚拟世界表示出来，从而方便进行管理和构建。比如无人驾驶的设备，实际上是通过将周围的环境以及各种异常在引擎上模拟出来从而保证正常行驶的。

![为什么学游戏引擎](/images/article/Games104/01/Games104_01_02.png)

## 游戏引擎历史
### 早期游戏时代
视频游戏行业的历史也不过短短的五十多年左右，早期的游戏多为在红白机上运行的视频游戏，此时根本没有Game Engine这个概念，游戏都十分的简单，大家所想的是如何将复杂的元素放在很小的存储空间内。比如马里奥中，将云彩的贴图换个颜色放在地板上就变成了草丛，将小乌龟的正面反面来回播放就形成了走的效果，此时是游戏的黄金时期，大家关注点在于游戏性和趣味性，在此时期诞生了各种经典的游戏，《魂斗罗》、《马里奥》,《坦克大战》等知名IP。
![早期游戏时代](/images/article/Games104/01/Games104_01_03.png)

### 第一个游戏引擎
游戏引擎之父John Carmack，将他参与研发的一款FPS游戏《德军总部3D》中能够复用的核心功能分离出来，便产生了早期游戏引擎的雏形。在他后来开发的第二款游戏《Doom》中，他将其中分离的功能卖出，便有另外一款游戏《Shadow Caster》被开发出来，这款游戏在商业上取得了巨大的成功，此时距离真正的游戏引擎的诞生已经很接近了。直到《Quake》的问世，其中的核心分离出来制作的Quake Engine，被用来制作其他第一人称射击游戏，至此，第一个游戏引擎诞生了。
![游戏引擎之父John Carmack](/images/article/Games104/01/Games104_01_04.png)

![Quake](/images/article/Games104/01/Games104_01_06.png)

最早的计算机硬件中并没有显卡，直到人们认识到逻辑运算和图形运算并不相同，图形运算是大量向量运算，而且有大量的并行化运算，并不适合用CPU来运算，此时，显卡便诞生了。硬件的发展不断推动着游戏引擎的发展，随着显卡等硬件性能的不断提升，游戏引擎的算力也从Play Station 1到Play Station 5提升了约二十万倍，游戏的质量自然也随之得到快速提升。更高的算力也就意味着游戏引擎变得更加庞大，复杂，也就演变成了现代游戏引擎。
![计算机演变](/images/article/Games104/01/Games104_01_05.png)

### 现代游戏引擎
* 商业引擎，其中有我们熟知的Unity和Unreal等
* 游戏公司独立研发的引擎，这类引擎一般为各大游戏公司内部使用，其中包括著名的寒霜引擎
* 免费引擎，主要适用于轻量级的休闲游戏，与商业引擎和游戏公司独立研发的引擎还是有一定差距的
* 
![现代游戏引擎](/images/article/Games104/01/Games104_01_07.png)

随着游戏行业的不断发展，诸如物理运算一类的东西会非常复杂，早期游戏会自己实现结算器，物理碰撞的检测等，但计算越来越复杂时，便出现了专门处理物理运算的模块，也就是中间件。中间件包含处理物理运算，声音效果等等的一系列引擎。
![游戏引擎中间件](/images/article/Games104/01/Games104_01_08.png)

## 什么是游戏引擎
百度百科：
>游戏引擎是指一些已编写好的可编辑电脑游戏系统或者一些交互式实时图像应用程序的核心组件。这些系统为游戏设计者提供各种编写游戏所需的各种工具，其目的在于让游戏设计者能容易和快速地做出游戏程式而不用由零开始。大部分都支持多种操作平台，如Linux、Mac OS X、微软Windows。游戏引擎包含以下系统：渲染引擎（即“渲染器”，含二维图像引擎和三维图像引擎）、物理引擎、碰撞检测系统、音效、脚本引擎、电脑动画、人工智能、网络引擎以及场景管理。

1. 游戏引擎是创造类似《黑客帝国》中虚拟世界的底层框架
2. 游戏引擎是创作者（艺术家、设计师）实现创意或者想象力的生产力工具
3. 游戏引擎复杂，庞大的体量很好的展现了复杂性系统的艺术，即系统复杂之美

当然，游戏引擎也需要提供如一个工作室中多人合作开发的可行性，并在不断升级优化时具备底层的兼容性。

## 如何学习游戏引擎

在学完游戏引擎的分层架构后，我们打开一个游戏引擎的源码，将能够有理清头绪的办法（Update函数）；在学完渲染系统后，我们将认识到如何组织虚拟世界中需要渲染的元素，并依照不同图形学的算法进行渲染；在学完动画系统后，我们将了解如何组织一系列的动作动画，以及不同动作的动画之间是如何过渡的；学完物理系统后，我们将学会如何使用物理表达这个世界（刚体力学、软体力学、流体等等）；在GamePlay系统中，将学到事件系统，脚本系统，图形驱动等等；在网络系统中，我们将了解到帧同步算法，异步同步算法等等

还有许多支路如特效系统、寻路系统、相机系统、C++反射机制等等。

以及广受关注的前沿科技如动作匹配技术、程序化内容生成、Lumen技术（动态全局光照）、Nanite技术（影视级片元数据处理）。

[参考文章](https://zhuanlan.zhihu.com/p/533979732)

[课程视频](https://www.bilibili.com/video/BV1oU4y1R7Km/?spm_id_from=333.788&vd_source=21a878bcf79a22801dbc305350f68ca1)

[课件PPT](https://cdn.boomingtech.com/games104_static/upload/GAMES104_Lecture1.pdf)