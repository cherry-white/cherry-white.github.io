---
title:  现代游戏引擎 - 游戏中地形大气和云的渲染（六）
image: /images/background/Rendering-Game-Engine-02.jpg
tags: [游戏引擎, Game104]
date: 2022-09-14 22:27:01
categories:
- 游戏引擎
---
## 概括
前面章节我们了解了如何处理光线与物体的关系，这就有了渲染的基础。真实世界中地形是十分重要的部分，
尤其是在现代大世界的场景中，可以看到各种美轮美奂的地形效果，我们通常把地形称为Terrain。
![荒野大镖客：救赎](/images/article/Games104/06/Games104_06_01.png)

地形的制作面临以下挑战：
* 游戏地形的尺寸可能十分广阔，如何在有限的硬件中来表现？
* 地形中存在大量各式各样的物件：山川、河流、植被、道路……，艺术家要如何处理？
* 游戏中需要与地形实时交互：比如雪地中行走留下痕迹、爆炸在地面留下坑洞。

## 地形的几何
本质来说地形与一般的物体没有树木不同，我们完全可以用简单的Mesh显示完整的地形效果。
但这样处理的方式，高精度地形对于目前硬件来说是难以承受的。之前章节处理阴影时，
有一个重要的思想： 对于距离Camera近的区域，需要的分辨率较高，反之则分辨率需求降低。（LOD）

### 高沉图（Heightfield）
Heightfield是地形的俯视图，记录了地形的高度数据。原始的地形Mesh可以是精度较低的网格，
在运行时根据Camera位置动态细分网格数据，这样就可以极大减少性能压力。
![Heightfield](/images/article/Games104/06/Games104_06_02.png)

HeightMap有明显的局限性。它是一张二维的俯视图，也就是说只能处理没有重叠的地形。
比如山的内部有一个巨大的洞窟，虽然有一些方式可以处理，但总体来说是不方便的。

### 网格细分原则
Camera Distance：距离摄像机约近，网格约密

Adaptive Mesh Tessellation：分块设置地形精度

在说三角形细分前，我们需要先了解FOV与视野精度的关系。FOV代表摄像机的夹角， 由于Camera的分辨率是确定的，
因此FOV较大时，视野开阔，画面的很多细节会变得模糊；FOV较小时，视野缩小，场景精度变高。
![Adaptive Mesh Tessellation](/images/article/Games104/06/Games104_06_03.png)

1. 根据Fov(视角)和距离设置
2. 因为采样点变少，所以地形的高度可能会有误差，这个误差体现到屏幕上，最好不超过一个像素。

当我们实现View-dependent Terrain时（网格颜色变化在一定范围内，通常为1个像素）就需要基于以上两个原则。

### 网格细分算法
细分网格算法需要关注两个点：什么情况下进行细分？如何细分？
#### 基于三角形的细分（Triangle-Based Subdivision）
将一个等腰三角形最长边与对应顶点切分得到两个等腰三角形。
![Triangle-Based Subdivision](/images/article/Games104/06/Games104_06_04.png)

相邻边一侧被切分，另一侧未切分时，未切分三角形进行同样的处理，避免相邻三角形出现高度差，从而漏出天空。
细分方法：从细分三角形的直角边将三角形对半分开。
![Subdivision and T-Junctions](/images/article/Games104/06/Games104_06_05.png)

#### 基于四叉树（QuadTree-Based Subdivision）
切分三角形的方式不符合我们制作地形的直觉，因此上述算法在实际应用中使用不多。基于四叉树的细分方式则更加方便理解和使用。

优点： 
1. 易于构建
2. 易于管理地理空间下的数据，包括对象挑选和数据流

缺点：
1. 网格细分不如三角形网格那么灵活
2. 叶节点的网格级别需要保持一致

![QuadTree原理](/images/article/Games104/06/Games104_06_06.png)


![QuadTree不同层级细分](/images/article/Games104/06/Games104_06_07.png)

QuadTree不仅在算法层面较为便利，并且资源的制作和管理方式也与算法较为贴合。四叉树同样存在T-Junctions问题，
但在处理时十分聪明：存在T-Junctions的问题三角形，将其新增的细分点吸附到临近三角形点。
这种处理方式不存在顶点的删减，算法实现层面也较为简单。
![QuadTree不同层级细分](/images/article/Games104/06/Games104_06_08.png)

#### 不规则三角形（Triangulated Irregular Network）
对于存在大量平面的地形，上述两种方法效果都不明显（极限情况地形为平面时，只需两个三角形采样就可以表达）。
因此TIN将地形的细分直接做到Mesh中，不再动态计算。
![不规则三角形对比](/images/article/Games104/06/Games104_06_09.png)

### GPU网格处理（GPU-Based Tessellation）
在早先时候，上述的细分算法都是需要程序员在CPU中精心处理好的，但在现代游戏引擎中，曲面细分的工作通常是交给GPU来完成。

#### 硬件曲面细分（Hardware Tessellation）
DX11提供了基于硬件的曲面细分可选Shader
![DX11的绘制流程](/images/article/Games104/06/Games104_06_10.png)

![DX11的绘制流程2](/images/article/Games104/06/Games104_06_11.png)
* Hull Shader：生成Subdivision Patch，Patch由几个控制点组成定义了一个细分面。
* Tessellator Shader：根据Patch生成点集和这些点集的重心坐标。
* Domain Shader：生成三角网格
* Geometry Shader：添加额外的Primitive

#### 网格着色器管线（Mesh Shader Pipeline）
DX12中提供了新的Shader管线：Mesh Shader Pipeline，极大简化了Shader处理流程，所有的处理流程都可以由程序自己控制。
![DX12的Shader管线](/images/article/Games104/06/Games104_06_12.png)

注：NVIDIA在2019年公布Turing(图灵) 架构对Mesh Shader的拓展，对应RTX 20系列显卡。
而DX12同年也宣布对这一特性的支持，因此Win10之前版本不支持这一特性。

#### 实时可变地形（Real-Time Deformable Terrain）
有了曲面细分之后，再进一步就可以着手处理与地形的交互了。以雪地交互为例，当物体在雪地中移动时，
我们用一张Texture来记录物体运动的轨迹。然后将这张Texture传入地形Shader中，做曲面细分。这样就可以实现雪地的交互变形效果。
![实时可变地形](/images/article/Games104/06/Games104_06_13.png)

#### 体素化（Voxelization）
曲面细分的方法虽然可以处理地面变形的交互，但地面的高度场并没有真正发生变化。
比如地面出现一个深坑， 我们只能看起来有一个坑，但人并不会掉入坑中。而体素化地形可以较好得解决这一问题。

**体素化思想**
Voxelization是将物体的几何形式表示转换成最接近该物体的体素表示形式，产生体数据，包含模型的表面信息和内部属性。
表示3D模型的体素跟表示2D图像的像素相似，只不过从二维的点扩展到三维的立方体单元。
体素化能够对模型进行简化，得到均匀一致的网格，在求模型的切片，物理仿真分析过程中有较好的应用。
![体素化](/images/article/Games104/06/Games104_06_14.png)

**方块裁切（Marching Cube）**
Marching Cube使用许多Cube来对物体进行填充表示。Cube的点与被表示的物体有两种情况：处于物体内部和处于物体外部。一个Cube有8个点，
这样每个Cube就有2^8=256种情况。由于反转状态不变，所以可以减少一半，为128种。再根据旋转不变形，又可以减少到14种情况。
![Marching Cube](/images/article/Games104/06/Games104_06_15.png)

我们把这14中情况的Cube数据存到查找表(look up table)中，这样只需要判断Cube顶点与物体的交集情况就可以得到覆盖物体的每个Cube数据了。

* 优点：可以处理任意结构的地形。
* 缺点：相比常规处理，地形内部多出了大量数据，并且目前的算法并不完善。

## 地形的材质
之前我们已经解决了光照计算，但地形由于其特殊的需求，需要对一些参数据进行处理。

### 纹理混合（Texture Splatting）
当我们渲染地表时，必然需要用到地表的纹理，但地表中存在许多物体：沙、石、草……，并且这些物体存在重叠的情况，
不同区域可能需要对多个纹理采样。我们使用一张纹理作为不同纹理的map：使用哪些纹理进行采样混合。
简单根据alpha的混合不符合现实：混合区域沙子应该更多得处于石头缝隙中，而不是线性得混合。
![简单的纹理混合](/images/article/Games104/06/Games104_06_16.png)

一种处理方式是对过渡区域做Height对比，从较高的区域区域过渡到较低的区域，则较高区域的混合权重下降慢一些，较低区域很快退去。
![高级的纹理混合](/images/article/Games104/06/Games104_06_17.png)

但这种处理方式仍然存在问题，这种切换是0、1切换（只选择一种材质），当相机移动时，信息高频，会出现抖动，
通过增加阈值的方式来手动调整（加入Bias，当高度差在0.2内时看起来是最好的）。
![添加扰动纹理混合](/images/article/Games104/06/Games104_06_18.png)

### 采样（Sampling）
Sampling from Texture Array

将实际采样的纹理存储在几个纹理数组中，通过Map纹理映射到具体对哪些纹理采样。
![从材料纹理阵列中取样](/images/article/Games104/06/Games104_06_19.png)

为了让平面产生几何感，我们可以通过一下几种方式进行处理，目前使用的比较少
* Bump（凹凸贴图）：颜色计算时，对法线做修改
* Parallax（视差贴图）：对纹理uv做偏移，形成高度差
* Dsaplacement（位移贴图）：对顶点延法线方向位移
  
![地形的凹凸显示](/images/article/Games104/06/Games104_06_20.png)

### 虚拟纹理（Virtual Texture）
上面使用纹理数组的方式处理，我们的Shader就需要在不同纹理之间来回跳转采样，这样的处理方式是十分耗时的。
Virtual Texture很好得解决了这个问题：将需要使用的Texture合并到一个虚拟的大纹理中，进行动态加载与卸载。
![Virtual Texture](/images/article/Games104/06/Games104_06_21.png)

### 直接存储器访问（DirectStorage & DMA）
常规的硬件GPU读取内存：硬盘->内存->现存，中间的数据传递十分耗时。DirectStorage技术在传递数据时，
传递的是未解压的数据，由GPU来完成解压。DMA技术则更进一步，直接由GPU读取纹理数据。
![Virtual Texture](/images/article/Games104/06/Games104_06_22.png)

### 浮点数精度溢出
浮点数是以32bit记录数据（整数+小数），当我们使用浮点数来表示大地形顶点数据时，
很可能出现浮点数无法精确表示的情况。（由于整数部分过大，小数部分精度不够）
![浮点数精度溢出](/images/article/Games104/06/Games104_06_23.png)

**Camera Relarive Rendering**
物体在渲染时，通常将顶点数据转换为世界坐标系。更好的处理方式是将物体转换为相对Camera的坐标来处理，
这样距离Camera视野范围内的对象就可以相对正确表达。

## 植被道路贴花等
### 树木渲染（Tree Rendering）
通常渲染树的方式是用一堆插片来表示，并且根据视角做LOD。
![Tree Rendering](/images/article/Games104/06/Games104_06_24.png)

### 装饰渲染（Decorator Rendering）
早期游戏的Decorator会一直面向Camera（跟着相机旋转）
![Decorator Rendering](/images/article/Games104/06/Games104_06_25.png)

### 道路和贴花渲染（Road and Decals Rendering）
Road在地形中的处理较为复杂，因为不仅要处理渲染纹理，还需要处理高度场。

Decals是将物体附着在对象上的技术，例如人脸上的花纹，建筑上的单孔。
![Road and Decals Rendering](/images/article/Games104/06/Games104_06_26.png)

现代通常会用程序化的方式对地形物件进行生成，上面这些所有的纹理在渲染时，都直接Bake到VT中，减少渲染成本。

## 大气散射理论
### 大气
![大气](/images/article/Games104/06/Games104_06_27.png)

这部分主要涉及两部分：天空与云，大气的拟合方程如下：
![大气拟合](/images/article/Games104/06/Games104_06_28.png)

影响因素：观察方向与天顶的角度（θ）、观测方向与太阳角度（γ）

优点：计算简单；缺点：只能模拟静态地表的情况

### 气体媒介
大气由气溶胶组成，所以才能表现出特殊的光学现象。气溶胶可以看做是很多细小的颗粒，光线在这些颗粒之间不断弹射，形成复杂的光学现象。
![气体媒介](/images/article/Games104/06/Games104_06_29.png)

### 光的交互
在一维空间下对于光与气体的交互，我们作出以下假设，以此产生RTE方程：
* 光在气体中每前进一段距离，其能量会以一定比例被吸收
* 光在气体中每前进一段距离，会向周围散射
* 气体自发光（通常不考虑）
* 周围气体的散射

![光的交互](/images/article/Games104/06/Games104_06_30.png)

RTE方程表示光传递的梯度，对于梯度的积分就是人眼看到一个气体像素的最终颜色。VRE想要表达是，
光从M点到P点，逐个计算每个气体光被吸收、散射并且接收周围气体散射的能量，得到最终的颜色。
![VRE](/images/article/Games104/06/Games104_06_31.png)

### 光散射模型
#### Rayleigh Scattering
当介质远小于光波长，光几乎均匀散射，越短的波长(蓝、紫)散射越厉害。受影响于波长与海拔(h)
![Rayleigh Scattering](/images/article/Games104/06/Games104_06_32.png)

#### Mie Scattering
气溶胶尺寸大于等于光波长，具有方向性，沿光方向比较强，对波长不敏感。雾也是用的这个原理
![Mie Scattering](/images/article/Games104/06/Games104_06_33.png)

### 多散射问题
![单次和多次射对比](/images/article/Games104/06/Games104_06_34.png)

现实中气体散射会影响场景中的光照，上图中山的背面被空气的散射照亮。为了解决这一问题，我们可以使用Ray Matching的方式处理。
![Ray Matching](/images/article/Games104/06/Games104_06_35.png)

沿着射线的方向，均匀采样许多点。根据散射方程，计算散射积分。

## 实时大气渲染
为了避免复杂计算，我们通常会将通透度和散射放到纹理中进行查询。根据通透度和散射值，可以计算一次散射的结果，多次迭代计算可以接近真实效果。
![根据一个角度和海拔高度采样通透度](/images/article/Games104/06/Games104_06_36.png)
![通过三个角度和海拔高度采样一次散射](/images/article/Games104/06/Games104_06_37.png)

当我们需要处理天空中的雾效时，可以做一些简化处理。参考UE中的处理方式，以及作出的假设
* 大气的散射具有各项同性 => 颜色百分比的衰减
* 光源位置不变，海拔高度不变，这样只需要两个参数就可以查找散射
* 根据距离进行积分

![快速产生天空和气氛的渲染](/images/article/Games104/06/Games104_06_38.png)

## 云的渲染
### 云的类型
![云的类型](/images/article/Games104/06/Games104_06_39.png)

* stratus（层云）：云体均勾成层，呈灰色，似雾，但不与地接，常笼罩山腰，主要由小水滴构成，为水云，厚度一般在400-500米之间；
云底离地面高度常在2000米以下，属低云族。层云又可分成2类：层云、碎层云。
* Stratocumulus（层积云）：一般在600~2000米 ，结构松散的大云块、大云条(滚轴状)组成的云层，有时排列成行；颜色灰白或灰色；
根据其形状特征可分透光、蔽光、积云性、荚状、堡状等层积云数种。
* Cirrus（卷云）：一般在4500至10000米。它由高空的细小冰晶组成，且冰晶比较稀疏，故云比较薄而透光良好，色泽洁白并具有冰晶的亮泽。
卷云按外形、结构等特征，分为毛卷云和钩卷云、伪卷云、密卷云四类。

### 实现方式
![基于网格的云建模（Mesh腐蚀处理）](/images/article/Games104/06/Games104_06_40.png)
优点：高质量。缺点：昂贵，不支持动态天气。

![公告牌云（Billboard面片处理）](/images/article/Games104/06/Games104_06_41.png)
现在一般不使用这种方式了。优点：效率高。缺点：视觉有限，类型有限。

![体积云](/images/article/Games104/06/Games104_06_42.png)
优点：
* 实现云的形状。
* 可大规模出现。
* 支持动态天气。
* 支持体积照明和阴影。

缺点：
* 必须考虑效率。

### 体积云
体积云使用Weather Texture来处理。Weather Texture分为两个部分：云的分布纹理和云的厚度纹理。
当我们需要让云产生变化时，只需要对Weather Texture做扰动处理。
![Weather Texture](/images/article/Games104/06/Games104_06_43.png)

在项目中常见的随机扰动处理就是噪声。Perlin Noise可以生成的平滑的随机游走模型；Worley Noise模拟细胞的生成，根据空间中的点对空间进行划分。
![噪声扰动](/images/article/Games104/06/Games104_06_44.png)
![云模型的生成过程：多层级Noise对云模型腐蚀](/images/article/Games104/06/Games104_06_45.png)

有了云模型之后，就要考虑如何渲染了，处理方式和大气类似：Ray Marching。由于云的通透度度很低，并不需要像大气的复杂处理，
我们看到的云是GPU中的三维纹理，使用Ray Marching的方式解析出来。
![通过光线行进来渲染云](/images/article/Games104/06/Games104_06_46.png)

[参考文章1](https://zhuanlan.zhihu.com/p/500870965)

[参考文章2](https://zhuanlan.zhihu.com/p/501343768)

[参考文章3](https://zhuanlan.zhihu.com/p/500862481)

[课程视频1](https://www.bilibili.com/video/BV1au411y7Fq/?spm_id_from=333.788&vd_source=371bc0e94a8c97f991c4ac20af0b2d53)

[课程视频2](https://www.bilibili.com/video/BV1i3411T7QL/?spm_id_from=333.788&vd_source=371bc0e94a8c97f991c4ac20af0b2d53)

[课件PPT](https://cdn.boomingtech.com/games104_static/upload/GAMES104_Lecture06_The%20Challenges%20and%20Fun%20of%20Rendering%20the%20Beautiful%20Mother%20Nature.pdf)
