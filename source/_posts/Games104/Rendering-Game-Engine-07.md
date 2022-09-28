---
title: 现代游戏引擎 - 游戏中渲染管线、后处理和其他的一切（七）
image: /images/background/Rendering-Game-Engine-03.jpg
tags:
  - 游戏引擎
  - Game104
categories:
  - 游戏引擎
abbrlink: ed8f511c
date: 2022-09-21 19:33:38
---
## 环境光遮蔽（Ambient Occlusion）
在之前的章节中，我们提到过对于阴影的处理，但有一种阴影是难以通过这种方式来处理的——物体自身局部对光线的遮挡，
比如人物眼角对皮肤、鼻子对面部的遮挡阴影。虽然从理论上来说，这种阴影也符合光照方程，但由于其局部遮挡的特性，
在统一的光照模型处理中很难得到较好的效果。
![Ambient Occlusion](/images/article/Games104/07/Games104_07_01.png)

### 预计算环境光遮蔽（Precomputed AO）
Precomputed AO思想是将AO信息存储在角色纹理中，这样即使我们没有AO真正对应的网格结构，
也可以有较好的AO效果。这也是现在很多商业项目使用的方法。
![Precomputed AO](/images/article/Games104/07/Games104_07_02.png)
其特点也很明显：
1. 无需几何上的遮蔽关系；
2. 需要额外的纹理存储信息；
3. 只能处理静态对象。

### 屏幕空间环境遮挡（Screen Space Ambient Occlusion+  - SSAO+）
SSAO的思想是将是对屏幕像素进行局部空间采样，计算点可显示的概率，作为最终颜色的比例系数。
![SSAO](/images/article/Games104/07/Games104_07_03.png)

SSAO采样时使用的是球体区域采样，但实际我们看到一个平面时，可视区域只有半球。因此对其进行优化后改为SSAO+的方式进行处理：
1. 沿法线方向在视图空间生成半球面；
2. 多次区域采样，判断是否被遮蔽，计算颜色衰减比例。

![SSAO+](/images/article/Games104/07/Games104_07_04.png)

相比Precomputed AO优点：动态处理AO效果

相比Precomputed AO缺点：
1. 实时计算量较大；
2. 需要有真实的遮蔽结构；
3. AO判断错误（当一个像素覆盖的深度很大也就是距离摄像机很远时，用球面进行采样计算覆盖的区域很大，很可能不是局部遮挡关系了，
不应该进行处理。屏幕空间没有几何信息，因此无法判断采样区域内的对象关系，应该可以设定阈值进行一定的优化）

### 基于地平线的环境光遮蔽（Horizon-basedAmbient Occlusion - HBAO）
HBAO假设各个方向上的光贡献相同（这也是算法的缺陷），对SSAO+在计算衰减比例上做了简化：区域采样点计算比例 => 积分切面最大仰角
![HBAO](/images/article/Games104/07/Games104_07_05.png)

### 基于地面实况的环境遮挡（Ground Truth-based Ambient Occlusion - GTAO）
具体来说，GTAO在HBAO的基础上移除了随着距离衰减的可见性函数，转而使用一个常量1作为可见性（不过恢复了正常积分中的光线与法线之间的余弦项），
为了避免硬切导致的瑕疵，会考虑添加一个从一个较大的距离到最大的采样半径上使用一个从1到0的线性混合权重。为了模拟near-field的interreflection，
则是通过对多个具有代表性的场景在不同的albedo作用下的GI跟AO之间的数值关系进行匹配映射，得到了两者之间的关系的解析模拟解。
![GTAO](/images/article/Games104/07/Games104_07_06.png)

### 光线追踪环境光遮蔽（Ray-Tracing Ambient Occlusion）
基于RTX的硬件，每个像素发出一些射线来进行遮蔽检测来计算AO情况。
![Ray-Tracing Ambient Occlusion](/images/article/Games104/07/Games104_07_07.png)

## 雾效（Fog）
Fog越浓，透明度约低。

### 深度雾效（Depth Fog）
Depth Fog假设空间中充满了均匀的Fog，那么我们就只需要根据Depth缓冲就可以计算看到物体的透明度了。
常见的Fog透明度计算方式有三种：线性、指数、指数平方（最常用）。
![Depth Fog](/images/article/Games104/07/Games104_07_08.png)

### 高度雾效（Height Fog）
Height Fog用来处理与高度相关的Fog，例如从山脚向上看，可以看到雾效；但在山顶缺看不到雾效。
![Height Fog](/images/article/Games104/07/Games104_07_09.png)

### 体积雾（Volumetric Fog）
以上两种方式的Fog都是在屏幕空间进行处理的，这样有些效果就难以处理了，比如幽暗的环境，一束光透过fog。这就需要体积雾来处理了。

体积雾根据视锥与摄像机的远近，对空间进行划分（近处密）。对切分后的视锥进行Ray Matching等计算，处理方式与云的处理类似。
![Volumetric Fog](/images/article/Games104/07/Games104_07_10.png)

## 抗锯齿
走样的原因：想要表达的东西太细，但是采样频率不足。大概分为三类：
* 边缘的采样
* 纹理的采样
* 高光的采样
  
![走样的原因](/images/article/Games104/07/Games104_07_11.png)

### Anti-aliasing
常用解决方案就是：多采样获取更多的样本，然后对样本进行加权和求和，以产生一个像素颜色
![Anti-aliasing](/images/article/Games104/07/Games104_07_12.png)

### Super-sample AA (SSAA) and Multi-sample AA (MSAA)
SSAA是通过绘制一个高分辨率的图像做一下滤波变成低分辨率的结果，处理步骤如下：
1. 在一个像素内取若干个子采样点；
2. 对子像素点进行颜色计算（采样）；
3. 根据子像素的颜色和位置，利用一个称之为resolve的合成阶段，计算当前像素的最终颜色输出

MSAA优化了SSAA的着色次数：每个像素只着色一次，根据子像素覆盖情况，将着色的数据复制到相应的Color位置。
![SSAA and MSAA](/images/article/Games104/07/Games104_07_13.png)

### FXAA（Fast Approximate Anti-aliasing）
核心思想：提取边缘像素；将边缘像素与周围像素混合。
![FXAA](/images/article/Games104/07/Games104_07_14.png)

为了判断边缘像素法线方向，通常会计算自身以及周围像素（8个）亮度，计算其中最大值与最小值之差作为判断依据。
（亮度不同的地方，以不同的阈值判断，缓解局部高频信息丢失）
![卷积计算偏移方向](/images/article/Games104/07/Games104_07_15.png)

在确定像素边缘方向之后，就需要进一步确定边缘的法线方向。处理思路如下：若边缘为水平方向，则判断上下像素与自身像素亮度的差值；
若边缘为垂直方向，则判断左右像素与自身像素亮度的差值。(法线朝向亮度变化大的方向)
![边缘搜索算法](/images/article/Games104/07/Games104_07_16.png)

FXAA算法在颜色混合时，首先会计算当前像素处于边线中的比例位置。然后根据比例位置，对当前像素的uv做偏移。
![计算混合系数](/images/article/Games104/07/Games104_07_17.png)

### TAA（Temporal Anti-aliasing）
TAA分为采样（sampling）和合成（resolve）两个过程。
* 采用：常见的做法是在每帧中对摄像机的视锥体矩阵做偏移，以达到多次采样的效果。
* 合成：为了避免采样的像素差异过大，使用Motion Vector：计算像素点在当前帧和上一帧的移动，
在融合时进行差异判断，放弃掉那些颜色差异大的历史像素点

这种采样方法存在很多问题：
1. 由于舍弃了历史像素，会出现部分顶点闪烁。
2. 当前画面的像素点与上一帧的矩形像素点有偏移，插值合成导致了像素的模糊。
3. Ghosting问题：光照变化或物体运动，导致历史样本失效；
4. 骨骼动画、顶点动画需要额外计算处理
![TAA](/images/article/Games104/07/Games104_07_18.png)

## 后处理
后处理：在Camera渲染完成之后，拿到渲染的纹理再对其进行处理。通常后处理是用来保证画面正确以及特殊效果
，但我们之前提到的SSAO、Depth Fog其实也算是在后处理流程中实现的。这里简单介绍一下常见的后处理效果。

### 光晕（Bloom）
现实中，我们看到的强光源时，周围会有一圈光晕，Bloom就是为了处理这类效果。

Bloom的产生：
* 相机透镜不能完美聚焦
* Airy disk，光会在眼里产生散射

![光晕](/images/article/Games104/07/Games104_07_19.png)

### 处理步骤
![提取高亮区域](/images/article/Games104/07/Games104_07_20.png)

利用高斯模糊与低阶亮度对所提取的亮度区域进行模糊处理，以达到高效计算。然后将模糊化的亮度图与原图以一定比例进行叠加。
![高斯模糊](/images/article/Games104/07/Games104_07_21.png)
![高斯滤波金字塔](/images/article/Games104/07/Games104_07_22.png)

### 色调映射（Tone Mapping）
自然界中亮度范围很大，但我们用来显示的设备亮度范围是有限的。若不对颜色做任何处理，但显示的颜色亮度超出显示上限时就会被截断，产生过曝显现。

为了处理这一问题，就需要Tone Mapping将显示的颜色映射到显示器能够处理的亮度范围内。
颜色的映射方案就是Tone Mapping的核心（Tone Mapping Curve）。

#### Filmic s-curve
Filmic s-curve是行业早期剔除的颜色映射曲线，提出者在大量实践基础上进行参数化拟合。其效果然游戏画质有了极大提升。
![Filmic s-curve](/images/article/Games104/07/Games104_07_23.png)

#### ACES
ACES是目前最被认可的颜色曲线，能够有效得在各种终端有稳定的显示效果。
![ACES](/images/article/Games104/07/Games104_07_24.png)

![三条色调映射效果对比](/images/article/Games104/07/Games104_07_25.png)

### Color Grading
Color Grading用来调整画面的色调，以达到烘托气氛或特殊的画风效果。
通常的处理方式为：对原有像素颜色通过查表的变为需要的颜色。映射的表称为Lookup Table (LUT)
![LUT](/images/article/Games104/07/Games104_07_26.png)

因为颜色是连续的，将3D颜色空间转换到2D纹理使用起来效果差不多。
![3D颜色空间到2D纹理](/images/article/Games104/07/Games104_07_27.png)

## 渲染管线
到目前为止，渲染的需要处理的内容基本都涉及了：渲染方程、大地、天空、AO等。
但还有一个核心问题：如何将我们提到的渲染相关的内容串联起来，使得整个渲染系统能够正常工作？
渲染管线就是来管理整个渲染的流程。

### 前向渲染（Forward Rendering）
![前向渲染](/images/article/Games104/07/Games104_07_28.png)

物体渲染顺序：总体来说，先由近及远渲染不透明物体（避免OverDraw），再由远及近渲染半透明物体（处理颜色混合）

半透明物体穿插绘制问题无法完美解决，只能用物体的中心点进行排序处理。
![排序和渲染透明对象](/images/article/Games104/07/Games104_07_29.png)

### 延迟渲染（Deferred Rendering）
前向渲染的问题就在于，每有一个光源就要对渲染物体处理一遍。当场景中存在大量光源时，开销太大。Deferred Rendering为了避免这种情况，
提出了两个Pass的处理方案：第一个Pass存储屏幕像素需要的几何信息（GBuff）；第二个Pass针对像素进行逐光源处理。
![延迟渲染](/images/article/Games104/07/Games104_07_30.png)

优点
* 只计算可见顶点光照
* G-Buffer的数据，后处理能拿来用

缺点：
* 高内存占用
* 不支持透明对象
* 对MSAA不友好
![延迟渲染优缺点](/images/article/Games104/07/Games104_07_31.png)

### 分块渲染（Tile-based Rendering）
由于移动端的带宽、内存以及散热极其敏感，常规的PC GPU架构并不适合。为了应对这一问题，
现代移动端设备通常使用Tile-based Rendering的GPU架构：将画面拆分成许多小块（Tile），渲染绘制时针对Tile进行处理。
![分块渲染](/images/article/Games104/07/Games104_07_32.png)

优点：
1. 较少GPU的读写压力；
2. 将Light附着到Tile优化Light处理；
3. 根据Pre-Z与光照范围减少光照计算
![屏幕瓷砖中的灯光列表](/images/article/Games104/07/Games104_07_33.png)
![深度范围优化](/images/article/Games104/07/Games104_07_34.png)

Forward+(Tile-based Forward) Rendering ：对Forward模式使用Tile-based Rendering
TBDR（Tile-based Deferred Rendering）：对Deferred模式使用Tile-based Rendering
![Forward+ Rendering](/images/article/Games104/07/Games104_07_35.png)

### 基于集群的渲染（Cluster-based Rendering）
将视图空间划分为多个四棱锥（Cluster），每个Tile单独计算Light的可见性。
![Cluster-based Rendering](/images/article/Games104/07/Games104_07_36.png)

### 可见性缓冲区（Visibility Buffer）
Visibility Buffer的基本思路是在前一个Pass中生成一个类似于GBuffer的全屏Buffer，
其中的每个texel只存primitive ID、uv和贴图ID，进而得到与之关联的所有属性值，法线、粗糙度等等。

Deferred Rendering在完成GBuff存储之后，就无法再获取原始的Mesh相关数据了；
而Visibility Buffer很好处理了这种问题， 对于复杂几何体来说，能够提供更好的细节效果。
![Visibility Buffer](/images/article/Games104/07/Games104_07_37.png)

优点：
1. 提供更好的几何数据；
2. 内存、带宽压力小=>可以使用MSAA

缺点：计算消耗变大（索引不同纹理）

## 框架图（FrameGraph）
可视化依赖和分析管理pipeline
![FrameGraph](/images/article/Games104/07/Games104_07_38.png)

## V-Sync&&G-Sync
游戏画面出现画面撕裂问题，学术名叫Screen Tear
![画面撕裂](/images/article/Games104/07/Games104_07_39.png)

画面撕裂的原因：引擎渲染不同帧复杂程度不同，所以GPU帧率不固定，但是显示器刷新是固定的。
如果在显示器的刷新间隔中间，GPU完成了渲染，就会造成屏幕撕裂
![画面撕裂原因](/images/article/Games104/07/Games104_07_40.png)

垂直同步，是为了解决画面撕裂问题。就是降低帧率，等FrameBuffer写完，再一起刷新界面
![垂直同步](/images/article/Games104/07/Games104_07_41.png)

### 可变刷新率（Variable Refresh Rate）
显示器自适配游戏帧率技术
![Variable Refresh Rate](/images/article/Games104/07/Games104_07_42.png)

[参考文章1](https://zhuanlan.zhihu.com/p/533244258)

[参考文章2](https://zhuanlan.zhihu.com/p/527697509)

[课程视频](https://www.bilibili.com/video/BV1kY411P7QM/?spm_id_from=333.788&vd_source=371bc0e94a8c97f991c4ac20af0b2d53)

[课件PPT](https://cdn.boomingtech.com/games104_static/upload/GAMES104_Lecture07_Rendering%20on%20Game%20Engine_Render%20Pipeline,%20Post-process%20and%20Everything.pdf)
