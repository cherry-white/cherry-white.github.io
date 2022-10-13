---
title: 现代游戏引擎 - 高级动画技术：动画树、IK和表情动画（九）
image: /images/background/Advanced-Animation-Technology.jpg
mathjax: false
date: 2022-10-13 20:47:12
tags:
 - 游戏引擎
 - Game104
categories:
 - 游戏引擎
---
## 动画混合（Animation Blending）
上一章节提到，我们的动画是由一个个Clip（动作）组成的。当我们正在播放一个Clip时，想要切换到另一个Clip，
如果直接播放Clip，会显得不自然。这时就需要对两个Clip进行动画混合。

之前在计算Clip的每一帧状态时，是通过插值的方式处理的，Clip之间的混合也是类似的处理方式。
两个Clip的差值需要知道在多长时间内以怎样的权重完成Clip的切换。
![对齐混合时间轴](/images/article/Games104/09/Games104_09_01.png)
在制作动画时，动画最好能够有较好的衔接（第一帧与最后一帧保持一致，循环播放不穿帮）。

## 混合空间
### 1D & 2D Blend
* 1D Blend：通过一个参数对动画进行混合
* 2D Blend：通过两个参数对动画进行混合

事实上当我们去插值动画的时候，并不局限于在两个clip中插值，也可以在多个动画clip中插值（比如直走、想左走以及向右走），
而且它们之间权重的设置也未必一定要均匀或线性插值，而blend space就是用来指导采样权重的东西。（在此处是一维Blend Space）
![1D Blend](/images/article/Games104/09/Games104_09_02.png)

玩家可以同时改变方向和速度，我们简单地将两个一维混合空间正交放置，我们得到一个二维混合空间，
由于实际需求上各个clip不一样（比如艺术家认为向左向右走时速度超过一个很低的阈值就直接进入跑的clip），
那么此时就无法像上图一样均匀插值，不同的clip在整个采样空间上的分布是不均匀的。
![2D Blend](/images/article/Games104/09/Games104_09_03.png)

### Skeleton Masked Blending
有时我们可能需要动画只对部分骨骼产生效果，例如角色边挥手边行走或者边挥手边边跳跃。
Masked Blending就是对骨骼进行遮罩的一种技术，这样就可以将多个动画进行组合。
![骨骼遮罩混合](/images/article/Games104/09/Games104_09_04.png)

### Additive Blending
除了以上两种混合方式，有时我们可能还需要根据环境情况做出改变。例如角色朝着摄像机点头，这是就需要对动画附加一个旋转动画。
![添加混合](/images/article/Games104/09/Games104_09_05.png)

## 动作状态机（Animation State Machine (ASM)）
### 结构（Struct）
当我们在进行动画设计和融合的时候，会发现有些动画clip是存在逻辑关系的而不是可以任意插值的，
比如“跳”这个动作我们一般分为“起跳”、“滞空loop”以及"落地"三个部分，而且其存在明确的顺序关系。
因而ASM就被引入了进来。 ASM包含“节点node”和“变换transitions”。
![Jump动画根据离地高度进行动态调整](/images/article/Games104/09/Games104_09_06.png)

![ASM结构](/images/article/Games104/09/Games104_09_07.png)

#### 节点Node
节点分为两类：clip和blend space。前者可以不止是指一个动画clip，也可以把一整个blend space打包成一个节点，
甚至可以把一个动画蓝图放进去当一个节点；当角色发生转变时进入另一个节点，而且这种转变是会自动发生，
举个例子：当人物进行跳这个动作时，相关的这个ASM就会被调用进入起跳状态，然后根据具体的判断标准，
角色会自动从一个状态节点切换到下一个状态节点，直到全部完成之后跳回到角色本身。

#### 变换Transitions
转变本身是一个过程（函数），最简单就是表明从一个节点到另一个节点，当然也可能涉及到两个节点之间blending的问题，
即两者切换时不是突变，而是有一个时间间隔完成插值过渡，此时经常会用到经典的0.2秒。
另外，transitions的核心问题在于触发条件，比如跳到什么程度会从“起跳”节点进入“滞空loop”节点。
事实上，transitions的触发条件可能有多种。

### Cross Fades
ASM内部的动画切换也有两种方式：smooth transition和frozen transition。smooth transition平滑得将两个动画随时间插值，
frozen transition会将原有动画暂停，并逐渐提高切换动画的比例。t通常会通过差值曲线进行转换。
![Cross Fades](/images/article/Games104/09/Games104_09_08.png)
![Cross Fades Curve](/images/article/Games104/09/Games104_09_09.png)

### 分层状态机（Layered ASM）
Layered ASM与前面提到的遮罩概念近似，让不同的动画进行组合，独立控制部分骨骼，以达到更好的效果。
![Layered ASM](/images/article/Games104/09/Games104_09_10.png)

## 动画混合树
随着技术的发展，现在普遍使用的是动画混合树。
![Blend Tree](/images/article/Games104/09/Games104_09_11.png)

其中每个非叶节点的产出都是一个pose。
比较常用的操作有lerp（包括多个输入的lerp，此时它们的权重另外输入）、相加（addictive blend node）等。
因而不难发现，上述layered ASM本身也是动画树的一种情况。
![Blend Tree Nodes](/images/article/Games104/09/Games104_09_12.png)

动画树的一个特点是递归：
因为动画树中叶节点可以是单个动画clip、blend space已经ASM三种内容，所以导致其叶节点本身也可以是一个内含很多node的小动画树。

另外，动画树的核心作用是控制变量，动画树会定义大量变量暴露给外面的game play系统来进行控制，而这些变量的值决定了动画的混合行为。
通过这个设计，我们只需设置这些变量的值就可以决定动画实现。
变量有两种，一种是环境变量，比如有一个变量是角色当前血量，如果设定到了50%以下就切换成虚弱的动画。
还有一类变量类似于类的private data，通过event触发去进行调整。event概念引用于UE，即事件。
当某件事发生的时候，会改变动画树中的某些变量，从而影响动画混合效果。
![虚幻的动画蓝图控制](/images/article/Games104/09/Games104_09_13.png)

## IK技术（Inverse Kinematics）
上面介绍了常规动画的处理方式，但有一类动画是难以处理的。人伸手拿杯子、登上不同高度的阶梯，这类动画有一个特点：
在动画结束时需要特定骨骼移动到指定位置。在此需求上产生了两种处理方式：反向动力学（IK）和正向动力学（FK）。
IK是在最终效果骨骼确定的情况下，反推其它骨骼变动情况；而FK则是从Root节点，
逐步正向计算每个节点位置，以符合最终的效果。其中IK在游戏中使用较为常见
![IK基本概念](/images/article/Games104/09/Games104_09_14.png)

### Two Bones IK
Two Bones IK是指只有两个骨骼限制的IK，常见于人物行走在地面的效果。两个骨骼是指与地面接触的点以及大腿根部，这样就可以简单计算腿的弯曲角度。
![Two Bones IK 01](/images/article/Games104/09/Games104_09_15.png)

但这只是在二维平面上的结果，在三维空间中并不唯一，我们还需要对腿的朝向进行约束。
![Two Bones IK 02](/images/article/Games104/09/Games104_09_16.png)

### More Complicated IK Scenarios
当有多条链的IK处理情况就变得极其复杂，难点：
* 计算成本很高
* 自由度高，结果不唯一

![Complexity of Multi-Joint IK Solving](/images/article/Games104/09/Games104_09_17.png)

此时首先要做的第一步是判断可达性，即先判断角色能不能到达目标位置。而不能达到分两种情况：
* 全身所有骨骼加起来都没法碰到目标位置
* 全身所有其他骨骼加起来的总和与最长的骨骼比起来的差大于目标位置的位置。

![Check Reachability of the Target](/images/article/Games104/09/Games104_09_18.png)

除了可达性判断外，另外很重要的一点是骨骼的旋转是受限的，尤其是人体，不同骨骼的旋转模式不一样。错误的处理会导致很离谱的扭曲。
![Constraints of Joints](/images/article/Games104/09/Games104_09_19.png)

### Cyclic Coordinate Decent (CCD)
* 规则：在已知最终首末两端位置情况下，从终点位置依次连接末端骨骼=>起始骨骼，旋转所连接的骨骼，
使得末端骨骼处于两者连线上。最后尝试将末端骨骼移动至指定位置。
* 终止：可设置一定迭代次数，无限迭代问题
* 优化（每个节点旋转相对均匀）：可对旋转角度、距离目标点位置做限制

![CCD](/images/article/Games104/09/Games104_09_20.png)
![CCD P1](/images/article/Games104/09/Games104_09_21.png)
![CCD P2](/images/article/Games104/09/Games104_09_22.png)

### Forward And Backward Reaching Inverse Kinematics (FABRIK)
* 规则：依次使用FR和BR迭代计算骨骼位置，直到达到理想效果。FR:强制末端骨骼移动到指定位置，
再依次移动其它骨骼保证骨骼长度不变。BR则是从首端骨骼开始处理。

![FABRIK](/images/article/Games104/09/Games104_09_23.png)
![FABRIK约束](/images/article/Games104/09/Games104_09_25.png)

### Multiple End-Effectors
上面的算法解决了单条链的IK问题，但在复杂模型中往往存在多个终端点的情况。比如角色攀岩，就是将四肢附着在墙壁上。
* 难点：各个附着点的链条相互影响
* 处理方式：为各链条设置优先级或者权重。（例如一个共享骨骼需要移动，最后更新的末端执行器将获得优先级，其他骨骼将被移除）

![Multiple End-Effectors](/images/article/Games104/09/Games104_09_24.png)

### Jacobian Matrix IK
当控制点有很多时又会遇到不同问题（比如攀岩，同时需要设定的目标点不止一个）
因为当试图把一个点移到它的目标点时可能会让其他已经到位的节点又偏移开。
解决方法是：Jacobian Matrix（优化问题），在后续物理系统会详细介绍。
![Jacobian Matrix IK](/images/article/Games104/09/Games104_09_26.png)
![逐步接近目标](/images/article/Games104/09/Games104_09_27.png)

### 其它IK解决方案
![其它IK解决方案](/images/article/Games104/09/Games104_09_28.png)

### IK前沿问题
其中第一个是指IK是假设骨骼本身没体积的，但实际上是有的，尤其在蒙皮之后，所以会出现IK后骨骼自我穿插等问题。
![其它IK解决方案](/images/article/Games104/09/Games104_09_29.png)

### 完整动画Pipeline
![完整动画Pipeline](/images/article/Games104/09/Games104_09_31.png)

## 面部动画（Facial Animation）
### 概述
人的面部表情是很难表达的，细微的变化就可能表达出完全相反的含义。
骨骼动画虽然也可以处理面部表情，但即便是最简单的表情也需要花费大量的时间处理。
![面部是由复杂的肌肉系统驱动的](/images/article/Games104/09/Games104_09_30.png)

### Facial Action Coding System
FACS在基础表情库的基础上进行组合，表达其它表情。（40个 => 28个）
![简单混合的问题](/images/article/Games104/09/Games104_09_32.png)
所以不同于其他动画blending，一般业内使用Morph Target Animation。简单讲就是blending总是以additive的形式去融合，
比如直接在眼睛的位置上加上闭着的眼睛，而不会将睁着的眼睛和闭着的去做插值。 MF的问题是存储量大，并且随着表面细节增多计算量也会变很大

### 其它方法
![Morph Target](/images/article/Games104/09/Games104_09_33.png)
![Complex Facial Skeleton](/images/article/Games104/09/Games104_09_34.png)
![UV Texture Facial Animation](/images/article/Games104/09/Games104_09_35.png)
![Muscle Model Animation](/images/article/Games104/09/Games104_09_36.png)

## 动画重定向（Animation Retargeting）
### 简介
作用：不同的骨骼需要表现相同的动作效果。
![在角色之间共享动画](/images/article/Games104/09/Games104_09_37.png)

术语
![Terminology](/images/article/Games104/09/Games104_09_38.png)

### Retargeting
此处默认source与target的骨骼结构相同。
![Retargeting](/images/article/Games104/09/Games104_09_39.png)

### Retargeting IK
即便使用了上述的方法，当两者骨骼比例差异过大，仍然会出现穿帮效果。例如同样的蹲在地上的动画，
由于大腿与小腿的比例差异，上述方法就会产生穿模，这时就需要使用IK来辅助解决。
![Retargeting IK](/images/article/Games104/09/Games104_09_40.png)

### Retargeting with Different Skeleton Hierarchy
上面的方法都要求source、target骨骼结构相同，但如果骨骼结构相似但不完全相同的情况下需要怎么处理呢？
![用不同的骨架层次结构进行重新定位](/images/article/Games104/09/Games104_09_41.png)

处理的方式有很多，一种较为简单的方法是规定骨骼名称相同的进行Retargeting处理。将中间没有Retargeting的骨骼归一化.
![简单的解决方案](/images/article/Games104/09/Games104_09_42.png)

### 其它问题
![未解决的再定位问题](/images/article/Games104/09/Games104_09_43.png)
![变形动画重定向](/images/article/Games104/09/Games104_09_44.png)
表情领域的MF也面临动画重定向问题，具体做法有如利用拉普拉斯算子解决artifacts等。

## 总结
![Take Away](/images/article/Games104/09/Games104_09_45.png)

[参考文章1](https://zhuanlan.zhihu.com/p/546514925)

[参考文章2](https://blog.csdn.net/Jason__Y/article/details/124841455)

[课程视频](https://www.bilibili.com/video/BV1pY411F7pA/?spm_id_from=333.788&vd_source=371bc0e94a8c97f991c4ac20af0b2d53)

[课件PPT](https://cdn.boomingtech.com/games104_static/upload/GAMES104_Lecture%2009_Animation%20System-Advanced%20Animation%20Technology.pdf)
