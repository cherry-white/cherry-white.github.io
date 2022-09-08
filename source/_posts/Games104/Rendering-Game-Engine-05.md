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
只用直接光照会使得场景的平面感很强，而使用全局光照（直接光照+间接光照）能很大程度上的还原真实情况
![全局光照对比](/images/article/Games104/05/Games104_05_18.png)

### 如何表现全局光照：
* 我们需要储存数以万计的光照探测器，因此我们需要一个很好的压缩比率（需要预计算，空间换时间）
* 材质的BRDF卷积运算涉及到复杂的多项式积分运算，我们需要利用数学方法简化积分运算

![如何表现全局光照](/images/article/Games104/05/Games104_05_19.png)

### 卷积定理（Convolution Theorem）
百度百科：
>卷积定理是傅立叶变换满足的一个重要性质。卷积定理指出，函数卷积的傅立叶变换是函数傅立叶变换的乘积。具体分为时域卷积定理和频域卷积定理，时域卷积定理即时域内的卷积对应频域内的乘积；频域卷积定理即频域内的卷积对应时域内的乘积，两者具有对偶关系。

对于空间域中的一个数字信号（下图以照片为例），我们可以通过傅里叶变换将其转化为频率域的一段频率，
截取频率的一小段就可以实现对频率整体的一个粗糙的表达，这时我们再通过反向傅里叶变换就可以得到原数字信号的大概情况
（通过对信号的高度压缩也能让我们大概看出是什么东西）。 通过这一数学性质，我们不需要再去进行复杂的乘积累加和运算。

![卷积定理](/images/article/Games104/05/Games104_05_20.png)

### 球谐函数（Spherical Harmonics）
球谐函数就是一组基函数的集合，并且基函数越多，它的回归性越强(表达能力越强)

球谐函数（SH）有以下性质：
* 正交性，任意两个不同的归一化的球谐函数卷积在一起的结果为0。
* 旋转不变性：光源旋转后，对世界空间传入的数据进行同样的旋转旋转变换，可以得到同样的光照数据。
* 球谐函数的二阶导数为0：说明函数永远是光滑的，变化十分流畅和光滑。

![球谐函数](/images/article/Games104/05/Games104_05_21.png)

使用球谐函数，我们就可以通过一阶多项式近似的表达一个球面光照（低频信号）
![球谐编码](/images/article/Games104/05/Games104_05_22.png)

接着我们来使用这个工具，一般来说我们取很低的阶来展现低频信息，如图在场景中取一点，
在这个点进来的光（也就是我们进行球面采样）我们将球按照地图一样展开，就像右下角的图一样。
![任意irradiance采集点](/images/article/Games104/05/Games104_05_23.png)

接着我们对其用球谐函数进行压缩，在这里我们只取L0和L1两阶，一共4个基函数。
![将irradiance采集点压缩到SH1](/images/article/Games104/05/Games104_05_24.png)

我们可以看到重建出来的图虽然十分模糊，但是我们大致知道哪些地方有光，而且整个数据是连续，
如果想知道某方向的光强是多少只需要进行一次线性的vector计算即可，大部分时间其实用来表示环境光的，
因为环境光本来就是低频的，用SH正合适。
![用SH存储和着色](/images/article/Games104/05/Games104_05_25.png)

### 光照贴图（Lightmap）
有了球谐函数这一便捷工具，我们就可以将许多几何物体拍下存放在一张贴图上（这张贴图通常被称为“atlas”），这一过程又分为几个步骤

首先我们需要将几何物体进行简化，而后在参数空间内为每个几何物体分配近似的texel精度
![UV集](/images/article/Games104/05/Games104_05_26.png)

下面我们在场景内加入全局光照，就可以表现出非常真实的效果
![全局光照效果](/images/article/Games104/05/Games104_05_27.png)

LightMap的优点：
* 在real-time中效率高，因为成本低
* 由于是离线baking，当将空间分解之后，会产生很多细节或subtle的效果。

LightMap的缺点：
* 时间非常长的预计算时间。
* 只能处理static物体和static光源。
* 由于采用的是空间换时间的策略，在real-time时lightmap会占用几十到几百兆的存储空间

LightMap思想：
* 烘培（bake）可以空间换时间；空间光照可以烘焙成图片，那很多计算可以实现可以管理。
  
### 为什么使用LightMap:
如果只计算主光源那么就会感觉有些地方很暗，所以需要计算主光源和各个光源所产生的间接影响，
比如如果只有一个光源，他可能照射到一个物体，那么这个物体就变成了刺激光源反射光到别的物体上。
如果这样计算间接光照在不断的bounce下是无法结束的，很消耗计算资源，在上述简化光源的解决方案中我们设置了一个常数作为统一的环境光，
但是如果所有的物体都有相同的环境光，那么只接受间接光照影响的物体，会显得一股平面感塑料感，这是因为使用的相同的光照强度，
所以最好的办法还是记录每个点光照信息，但是这样的话记录的信息会非常多，这时候用傅里叶变换所衍生的SH函数，
SH函数是一种定义在球面上的函数的压缩表示方法，一个点收到的环境光照可以定义为以该点为球心的单位球面上每个点的irradiance，
我们该probe点接受的环境光用SH函数表示，当我们在进行使用时可以根据SH的系数和基函数进行重建，
从而可以记录很少的数据就能大致记录这个环境中大致的光暗关系，这个就是生成Lightmap。

### 光照采集点（Light Probe）
我们可以在空间内放置许多采样点，对于每个采样点采集其对应的光场，当有物体移动经过某一采样点时，
通过寻找附近的采样点并计算插值，就可以得到该采样点的光照
![光照采集点](/images/article/Games104/05/Games104_05_28.png)

那么这么多的采样点我们该如何生成呢？我们首先在空间内均匀的产生采样点，再根据玩家的可到达区域和建筑物的几何结构进行延拓，相对均匀的分布采样点
![自动生成采集点](/images/article/Games104/05/Games104_05_29.png)

### 反射采集点（Reflection Probe）
我们还会做一些数量不多但采样精度非常高的Reflection Probe用于表现环境，一般它们与Light Probe分开采样
![反射采集](/images/article/Games104/05/Games104_05_30.png)

综合使用Light Probes和Reflection Probes，我们已经可以实现一个不错的全局光照的效果，它给我们带来以下好处：
* 实时运行效率很高
* 既可以处理动态物体又可以处理静态物体，并且可以实时更新
* 既可以处理漫反射也可以处理镜面着色

当然它也有一些缺陷：
* 大量的Light probes需要我们进行预计算
* 相比于Lightmap，它对于全局光照和重叠部分的软阴影的细节处理精度较低
  
![光照采集和反射采集](/images/article/Games104/05/Games104_05_31.png)

## 基于物理的材质
全局光照是我们可以模拟真实世界的一个必要条件，在拥有GI之后，我们可以去模拟真实世界了。

### 微平面理论（Microfacet Theory）
微平面理论看上去很高大上，但实际上它所表达的东西很简单：

一个表面上其实是有无数个微表面，而光其实是在这些微表面上进行反射打出去的，一个金属表面是粗糙还是光滑，实际上是和平面上的法向聚集度相关的：
* 如果微表面们的法向朝向比较相似，其表现为金属材质较为清晰的反射（反射方向大致一致，完全一致则为镜子）
* 如果微表面们的法向朝向几乎不相同，其表现为金属材质较为粗糙的反射（反射方向为四面八方）

![微面理论](/images/article/Games104/05/Games104_05_32.png)

### 基于微平面理论的BRDF模型
因此基于微表面理论的基础上引入了一个反射模型，现如今大家用的最多的这类模型叫GGX。

渲染方程中，使用BRDF模型来处理物体反射效果，其中反射分为漫反射（diffuse）和高光（spectual）。

我们知道当光打到一个物体上时，只会发生两种情况：
* 部分光打到物体表面最后被反射，反射能量的多少取决于表面上法向的分布，也就是roughness(粗糙度)，roughness越高，随机性越强，而roughness越低，随机性就地，大部分法向相似，也就越接近于镜面反射。
* 部分光被吸收进入物体中，金属物体的电子可以捕获光子，而非金属没有能力捕获光子，因此进入的光会在内部进行几次弹射后，最后以一个随即方向射出去，因此一束光打入物体在经历几次折射后最后发生漫反射现象。

因此PBR模型其实可以分为两个PART：
* lambert的漫反射（diffuse）部分，如果将球面所有的漫反射部分积分起来的话结果为  ，C的大小取决于多少能量可以进来。
* specular，反射的这一部分引入了著名的cook-Torrance模型，可以看到它的公式中有DFG这三项，每一项代表了一种光学现象。

![基于微平面理论的BRDF模型](/images/article/Games104/05/Games104_05_33.png)


DFG模型中的D指法向分布方程（Normal Distribution Function）、F指菲涅尔现象（Fresnel Equation）、
G指微表面几何内部的自遮挡（Geometric attenuation term）

#### D（Normal Distribution） 表示法线分布，反应的是normal分布是发散还是聚集。
左下角是GGX模型和Phong模型对比，我们可以发现GGX模型的变化足够快并且底部足够平滑，
也就是高频部分突出，低频部分变化慢不像Phong一样快速衰减。

将GGX模型比作音箱来理解就是，高音够脆，低音够沉，范围广，这样的表现力才强。

因此当我们用GGX模型来表达高光时，高频部分的波峰足够陡，当光是“混响”时，高光并不会消失的很彻底，
低频也有很好的表达效果，而当我们在调整Phong模型的pow时，如果没有调好pow，会发现高光部分边界很生硬，
就像一张狗皮膏药贴在上面一样，但是用了GGX模型时，过渡比较顺滑，在低频高频上都有很好的效果。

在右下角伪代码中我们可以发现，我们引入了一个α值，其代表的是roughness，表达法向分布的随机度,roughness越高，
随机度越高，也就越发散。引入这个值的好处在于可以参与D和G的运算，引入了一个值（参数）从而可以计算出两个结果。
那么我们接下来根据roughness来计算G。
![分布方程（Normal Distribution Function）](/images/article/Games104/05/Games104_05_34.png)

#### G (Geometric attenuation term) 微表面几何内部的自遮挡
由于表面是凹凸不平的，当一束光射到物体上进行反射的时候，反射的光可能会被其他微平面挡住。

我们这里需要理解方程含义，他所代表的意义是： 

在基于微表面理论的基础上，我们认为表面上的法线形成了一个roughness的分布方程，
根据这个roughness的分布方程我们可以用积分的方法大致估算出每个角度上大致有多少光被挡住，
伪代码中的GGX函数的目的是为了计算出阻挡性，而G_Smith是在将光的阻挡性和视线的阻挡性计算出之后，
将两个阻挡性相乘，从而知道有多少光从入射表面到弹到眼睛时被挡住了。

举个例子，一束光以100%的能量射入到表面上，根据NDF方程（roughness分布方程），
我们知道30%的光被遮挡了，因此此时的光的能量是70%，这些光又是无数个光子，这些光子开始朝眼睛运动，
由于分布时各向同性的，因此70%的能量中又有30%被遮挡了，最后到达眼睛的能量就是70% X 70% = 49%。
![微表面几何内部的自遮挡（Geometric attenuation term）](/images/article/Games104/05/Games104_05_35.png)

#### F（Fresnel）菲尼尔现象
什么是菲涅尔现象？

当你的眼睛视线足够靠近表面的切线方向时，反射系数会急剧增加，从而会产生一种倒影的效果。

视线与平面的夹角约大，人眼接收到的反射约弱。

反射效果越弱，水体看起来越透明，像空气；反射效果越强，水体看起来越光滑，像镜子。

如图我们可以知道，摄像头在固定位置，而他所照出来的图片在近处看感觉清澈见底，在远处看则像是一面镜子反射出了山，
这就是因为在同一位置对不同位置进行观察时，视线与平面的夹角不同，观察近处时与平面夹角大，观察远处时夹角小。

因此，当你的视线与水平面接近时，此时就会产生很强的镜面效果。

这样Cook-Torrance模型就可以通过roughness以及fresnel这两个参数来很好的模拟出符合物理规则的材质。
![菲涅尔现象（Fresnel Equation）](/images/article/Games104/05/Games104_05_36.png)

### MERl BRDF
现在我们有了表面上的法线朝向分布情况，引入了roughness参数， 
并且根据分布方程和roughness计算出了各个角度的阻挡性，又引入了fresnel从而模拟fresnel现象，
已经能够很好表达物理世界的效果，但是现实世界的物体仍然很复杂，想要通过艺术家手动调参的方式来实现仍然有一定难度。

MERL BRDF数据库是对大量现实中的物体进行采样，提供个各种材质对应的BRDF参数，
从而提供了不同材质的roughness参数和菲尼尔参数，也表达了diffuse应该是多少。
![基于物理的测量材料](/images/article/Games104/05/Games104_05_37.png)

### Disney BRDF Principle
在最早期时候，艺术家对于cook-torrance的使用并不成熟，
导致了很多的问题，比如能量不守恒的话，光线bounce几次之后lightmap的计算就会爆炸了。

这时候Disney的一位大神提出了几条规则：
* 物理材质的每个参数需要符合直觉且容易让艺术家明白，不可以很抽象
* 要尽量使用较少的参数
* 参数要尽量在0~1之间
* 需要一些特殊效果时参数可以超出0~1这个区间
* 所有参数的组合应该是合理的，不会出现诡异的结果

![迪士尼BRDF原则](/images/article/Games104/05/Games104_05_38.png)

### PBR主流模型
Specular Glossiness（SG），这个模型中Diffuse控制漫反射部分，Specular控制菲涅尔现象，
Glossiness控制材质的光滑程度。这一模型的参数设置较少，便于艺术家们使用，但也因其过于灵敏而容易导致奇怪的现象。
![Specular Glossiness](/images/article/Games104/05/Games104_05_39.png)

Metallic Roughness（MR），这一模型中首先设置一个Base Color，而后通过金属度（Metallic）来控制Diffuse和菲涅尔现象。
仅调节金属度虽然使得灵活度下降了，但却不容易出问题，这也使得MR模型现今被更多的使用
![Metallic Roughness](/images/article/Games104/05/Games104_05_40.png)

我们可以从MR模型转换为SG模型
![MR模型转换为SG模型](/images/article/Games104/05/Games104_05_41.png)

下图为MR模型和SG模型优缺点的对比
![MR模型和SG模型对比](/images/article/Games104/05/Games104_05_42.png)

## 基于图像的光照 (Image-Based Lighting)
IBL的核心思想是：若我们能对环境光照的信息进行一些预处理，是否能减少光照处理中积分运算消耗的时间
![IBL核心思想](/images/article/Games104/05/Games104_05_43.png)

BRDF的材质模型分为diffuse和specular两部分：
![BRDF的材质模型](/images/article/Games104/05/Games104_05_44.png)

对于漫反射部分的光照，我们可以预先进行对应的卷积运算，并将其储存在Irradiance Map中
![Diffuse](/images/article/Games104/05/Games104_05_45.png)

对于Specular部分，它涉及大量复杂的计算，可以近似为Lighting Term和BRDF Term的乘积
![Specular](/images/article/Games104/05/Games104_05_46.png)
![第一部分](/images/article/Games104/05/Games104_05_47.png)
![第二部分](/images/article/Games104/05/Games104_05_48.png)

通过预计算能快速的将shading point的光照信息通过预计算求出：
![预计算](/images/article/Games104/05/Games104_05_49.png)

从而让我们在环境光照中得到一个不是很shiny的高光。
通过对比，我们可以看到开了IBL的环境场景更加层次分明。
![IBL对比](/images/article/Games104/05/Games104_05_50.png)

## 经典阴影方法
其实游戏中经典主流的shadow算法是cascade shadow，cascade可以理解为一层层的楼梯的场景
![cascade shadow](/images/article/Games104/05/Games104_05_51.png)

例如10米内的物体的shadow，我们采用高精度的shadow map，然后根据距离的增加，我们逐渐降低shadow map的精度，
这样最后绘制出来的shadow，近处的shadow足够清晰，远处的shadow足够稀疏，这样也符合一个光学原理，近大远小的特点，
近处的采样率高，远处的采样率低，眼睛的采样率从下降因此远处的从光的采样率也下降，从而使用了低精度的shadow map使得完美契合。
![cascade shadow步骤](/images/article/Games104/05/Games104_05_52.png)

但是cascade shadow有一个问题，就是由于分成了不同层级采用了不同的采样精度，
因此不同层级之间的交界处需要进行插值处理，否则就会产生一个很生硬的边界。
![边界问题](/images/article/Games104/05/Games104_05_53.png)

优点：
* 很快,因为用空间换时间，但它消耗的存储空间十分大。
* 效果比较好。

缺点：
* 近处的shadow质量不会特别高。
* shadows没有颜色
* 透明的物体会显示不透明的阴影。

![cascade shadow优缺点](/images/article/Games104/05/Games104_05_54.png)

### 软阴影
#### PCF-PercentageCloserFilter
原理:对当前像素周围的阴影地图进行采样，并将其深度与所有的采样进行比较，通过插值，我们得到了光和影之间更平滑的线
![PCF](/images/article/Games104/05/Games104_05_55.png)

#### PCSS - PercentageCloserSoftShadow
根据物体距离光源的远近，确定阴影的质量。
![PCSS](/images/article/Games104/05/Games104_05_56.png)

#### Variance Soft Shadow Map
利用深度的平均值和方差，直接接近深度分布的百分比，而不是将单个深度与特定区域进行比较。
![Variance Soft Shadow Map](/images/article/Games104/05/Games104_05_57.png)

#### 上个时代的3A标配选择
* 光照:Lightmap + Lightprobe。都会有解决不同的问题
* 材质:PBR(SG、MR) + IBL(背光、环境光)
* Shadow:CascadeShadow+VSSM

![上个时代的3A标配选择](/images/article/Games104/05/Games104_05_58.png)

## 前沿技术

### 着色器模型（Shader Model）
* Compute shader
* Mesh shader
* Ray-tracing shader

![Shader Model](/images/article/Games104/05/Games104_05_59.png)

### 实时光线追踪（Real-Time Ray-Tracing）
上面讲到的GI算法，其实都不是真实的实时光照处理，它们都有一定的预计算或者很多非常规假设。
但在新一代硬件支持下，实时光线追踪的处理方式出现了，虽然现在还没有能够大规模普及，但这项技术已经在突破的边缘。

2018年NVIDIA宣布了可加速硬件中光线追踪速度的新架构Turing，以及搭载实时光线追踪技术的RTX系列显卡。
同年，第一款搭载RTX实时混合光线追踪技术的游戏《战地5（Battlefield V）》正式面世
![实时光线追踪](/images/article/Games104/05/Games104_05_60.png)

### 实时GI（Real-Time Global Illumination）
![实时GI](/images/article/Games104/05/Games104_05_61.png)

### 更多复杂材质
毛发渲染，皮肤渲染等复杂材质的渲染。
![更多复杂材质](/images/article/Games104/05/Games104_05_62.png)

### Virtual Shadow Maps
Virtual Shadow Maps和Virtual Texture原理很像。Virtual Texture是将游戏中需要用到的所有纹理Pack到一张纹理中，
需要使用时就加载调用，不需要时就进行卸载。

Virtual Shadow Maps首先计算哪些地方需要Shadow Map，然后在一个完整虚拟的Shadow Map中去分配空间，
每小块得生成Shadow Maps。在计算Shadow时，反向去取小格数据。这种处理方式可以更有效利用存储空间。
![Virtual Shadow Maps](/images/article/Games104/05/Games104_05_63.png)

### Uber Shader
通过宏定义不同情况下的Shader组合，在编译时生成大量独立的Shader代码，
这就是所谓Uber Shader(类似Unity中的Shader变体概念)。这样的好处是，当Shader发生变化时，
只需修改组合Shader后重新编译。
![Uber Shader](/images/article/Games104/05/Games104_05_64.png)

[参考文章1](https://zhuanlan.zhihu.com/p/543728861)

[参考文章2](https://zhuanlan.zhihu.com/p/512998645)

[课程视频](https://www.bilibili.com/video/BV1J3411n7WT/?spm_id_from=333.788&vd_source=371bc0e94a8c97f991c4ac20af0b2d53)

[课件PPT](https://cdn.boomingtech.com/games104_static/upload/GAMES104_Lecture05_Rendering%20on%20Game%20Engine_Lighting,%20Materials%20and%20Shaders.pdf)
