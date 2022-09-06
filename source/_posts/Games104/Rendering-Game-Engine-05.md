---
title: 现代游戏引擎 - 游戏渲染中光和材质的数学魔法（五）
image: /images/background/Rendering-Game-Engine.jpg
tags: [游戏引擎, Game104]
date: 2022-09-05 22:40:37
categories:
- 游戏引擎
---
## 渲染方程及挑战
### 
* 光：光子，反射，吸收
* 材质：跟光子的交互
* 着色：不同材质和、光照的渲染

![渲染计算的组成](/images/article/Games104/05/Games104_05_01.png)

### 渲染方程式
1986年，James Kajiya提出了物体渲染方程（Rendering Equation），世界上所有物体的渲染逻辑都可以用这一方程来解释。
![James Kajiya](/images/article/Games104/05/Games104_05_02.png)
![渲染方程式](/images/article/Games104/05/Games104_05_03.png)

渲染方程式表明：经过任意点x反射到观察点中的辐射通量由x点自身发光和其他点反射到x点的辐射通量组成，其中其他点反射到x点的光照又可分为直接光照和间接光照。

![真实环境的复杂渲染](/images/article/Games104/05/Games104_05_04.png)
渲染方程在实际运用中非常复杂，包含诸多影响因素。

[具体分析可参考大佬的文章：王江荣：路径追踪（Path Tracing）与渲染方程(Render Equation)](https://zhuanlan.zhihu.com/p/370162390)

### 挑战1
阴影（Shadow）是我们判断物体空间关系的重要条件，我们该如何模拟出真实的阴影呢？
![光的可见性](/images/article/Games104/05/Games104_05_05.png)
光源的复杂性，光源有点光源、方向光源、面光源等不同种类，在实际应用中光照强度也有所不同。
![光源的复杂性](/images/article/Games104/05/Games104_05_06.png)

### 挑战二
如何高效的对双向反分布函数（BRDF，Bidirectional Reflectance Distribution Function）和入射辐射率的乘积进行积分，这里可以使用Monte Carlo积分（在上面大佬的文章中也有具体分析）。
![如何在硬件上高效地进行集成](/images/article/Games104/05/Games104_05_07.png)

### 挑战三
因为光可以反射，所以全局范围内任何一个物体都可以作为光源，即一束Output的光下一次可能作为Input输入，这样形成了一个递归的过程，典型案例Cornell Box。
![任何物质都将是光源](/images/article/Games104/05/Games104_05_08.png)

### 总结三个挑战
* 对于任一给定方向如何获得irradiance
* 对于光源和表面shading的积分运算
* 对于入射光和反射光不断递归过程的计算

![总结三个挑战](/images/article/Games104/05/Games104_05_09.png)

## 基础光照解决方法
### 简化光源
我们使用方向光源、点光源、锥形光源等作为Main Light，取Ambient Light作为除主光外的环境光的均值，以此简化复杂的计算。
![简单的光解决方案](/images/article/Games104/05/Games104_05_10.png)

对于能够反射环境的材质，我们可以设计一种环境贴图，通过采样环境数据来表现
![环境地图反射](/images/article/Games104/05/Games104_05_11.png)

### 简化材质
基于一个光照可以线性叠加的假设（在渲染方程式中也有用到），
Blinn-Phong模型通过叠加Ambient（环境）、Diffuse（漫反射）、和Specular（高光）来简单粗暴的描述材质的着色计算
![Blinn-Phong材质](/images/article/Games104/05/Games104_05_12.png)

Blinn-Phong的缺陷：
* 能量不保守：使用Blinn-Phong模型的出射光照能量可能大于入射光照的能量，这在计算光线追踪时会带来很大的问题：这一过程在光线追踪中经过无限次反弹后，会使得本该暗的地方变得过于明亮。
* 难以表现真实的质感：Blinn-Phong模型虽然比较经典，但它却很难表现出物体在真实世界中的模样，总是有一种”塑料“感。

![Blinn-Phong缺陷](/images/article/Games104/05/Games104_05_13.png)

### 简化阴影
Shadow简单说来就是人眼可见区域中，光线无法照到的地方。在过去十几年中，对于Shadow最常见的处理方式便是Shadow Map。
![阴影](/images/article/Games104/05/Games104_05_14.png)

Shadow Map的思想可以简单概括为：第一次先在光源处放置相机，以z-buffer的方式储存一张对应的深度缓冲， 第二次将相机放置在观察的位置，
并将视锥内的点的深度和深度缓冲中的对应点（三维坐标转换为二维坐标后，在平面坐标系中对应的点）的深度进行对比，
若前者大于后者，则认为视锥中的点处于阴影中

![Shadow Map](/images/article/Games104/05/Games104_05_15.png)

渲染Camera区域对ShadowMap进行采样，两者精度是不同的，因此很容易出现走样问题。
最常见的就是自遮挡问题，可以尝试加一个bias使它的容差大一点，但是这样会导致物体与阴影之间出现”断层“的人脚浮空现象。
![自遮挡问题](/images/article/Games104/05/Games104_05_16.png)

这样的话我们有了lighting,material和shadow，一套简单的渲染方案就出现了：
![基本的渲染方案](/images/article/Games104/05/Games104_05_17.png)

## 基于预计算的全局光照

## 基于物理的材质

## 基于图像的光照

## 经典阴影方法

## 前沿技术

## Shader的管理

[参考文章1](https://zhuanlan.zhihu.com/p/543728861)

[参考文章2](https://zhuanlan.zhihu.com/p/512998645)

[课程视频](https://www.bilibili.com/video/BV1J3411n7WT/?spm_id_from=333.788&vd_source=371bc0e94a8c97f991c4ac20af0b2d53)

[课件PPT](https://cdn.boomingtech.com/games104_static/upload/GAMES104_Lecture05_Rendering%20on%20Game%20Engine_Lighting,%20Materials%20and%20Shaders.pdf)
