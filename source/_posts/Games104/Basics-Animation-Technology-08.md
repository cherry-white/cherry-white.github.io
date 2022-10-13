---
title: 现代游戏引擎 - 游戏引擎的动画技术基础（八）
image: /images/background/Basics-Animation-Technology.jpg
mathjax: true
tags:
  - 游戏引擎
  - Game104
categories:
  - 游戏引擎
abbrlink: b1eb3151
date: 2022-10-09 21:10:36
---
## 动画技术简介
人类一直在试图代表运动中的物体
![壁画、陶瓷、神庙](/images/article/Games104/08/Games104_08_01.png)

序列帧和视觉残留（1/24 秒：翻页书、西洋镜）
![视觉残留](/images/article/Games104/08/Games104_08_02.png)

### 电影中的动画技术发展
* Zafari（2018）第一部用游戏引擎（Unreal）渲染出来的动画短片
* 手绘
* 骨骼动画，K帧
* 动作捕捉

![电影动画技术](/images/article/Games104/08/Games104_08_03.png)

### 游戏中的动画技术发展
* 序列帧动画（Pac-Man（1980）、波斯王子（1989）、Doom（1993））
* 骨骼动画
* 蒙皮动画
* 物理动画

![游戏中的动画技术01](/images/article/Games104/08/Games104_08_04.png)
![游戏中的动画技术02](/images/article/Games104/08/Games104_08_05.png)

### 游戏动画挑战
1. 要跟用户进行很多的互动动画（要和其他玩法系统协作、适配各种复杂环境）
2. 实时的（要在1/30秒完成）
3. 真实感的要求（表情动画、布娃娃系统、运动匹配系统（Motion Matching））

![游戏动画的挑战01](/images/article/Games104/08/Games104_08_06.png)
![游戏动画的挑战02](/images/article/Games104/08/Games104_08_07.png)
![游戏动画的挑战03](/images/article/Games104/08/Games104_08_08.png)

## 2D游戏动画技术
Sprite animation：通过多张图片连续播放获得的近似动画效果，早年红白机小霸王上的游戏大多此原理
![2D序列帧动画](/images/article/Games104/08/Games104_08_09.png)

Sprite-like animation：在前者基础上利用多个视角相机进行拍摄获得的更全面的图片信息，从而可以实现模拟3D的效果（Doom）
![2D模拟3D](/images/article/Games104/08/Games104_08_10.png)

根据角色的方向，播放指定的动画序列以达到模拟3D动画的效果。这种处理方式也可以用来模拟特效
![2D特效](/images/article/Games104/08/Games104_08_11.png)

Lived2D：是一种2D动画生成技术，处理非常简单。其核心思想是将动画对象进行拆分，对图元局部进行Transform以及spine变换以达到模拟局部动画效果。
![Lived2D](/images/article/Games104/08/Games104_08_12.png)

## 3D游戏动画技术
### 自由度
自由度（Degrees of Freedom）：系统对象可变化的基础维度。通常三维空间的物体自由度为6：三个维度上的偏移和三个维度上的旋转。
![DoF](/images/article/Games104/08/Games104_08_13.png)

### 刚性层次动画
最基础的3D角色动画，就是有层次的（如树状）的刚体的运动，形式类似皮影戏和上面的Live2D。这种方法的问题是刚体间移动旋转时可能会出现缺缝。
![刚性层次动画](/images/article/Games104/08/Games104_08_14.png)

### 顶点动画
如旗帜、水流的动画效果用刚体难以解决，所以使用3DoFs的顶点动画，计算每一帧下每个顶点的空间位置的变化，
一般存成两个texture，第一张的x轴是所有顶点的序号，y轴是帧的数量，位置（x, y）则是某顶点在某帧下空间位置变化的offset；
第二张图是记录顶点的法向量，因为随着位置的变化，法向也会变化。这两张图都会利用物理引擎先预计算保存。缺点是数据量会很大。
![顶点动画](/images/article/Games104/08/Games104_08_15.png)

###  Morph Target Animation
顶点动画的一种变型，不同的是顶点影响权重。通常用于表情动画，对两个key frame进行插值。
![顶点动画](/images/article/Games104/08/Games104_08_16.png)

### 2D & 3D 蒙皮动画
3D角色是动画通常是通过骨骼来驱动的，骨骼所影响的皮肤通常不会的静态的，Mesh会随着骨骼的运动而变化。处理这种问题的技术称为蒙皮骨骼动画。
![3D蒙皮动画](/images/article/Games104/08/Games104_08_17.png)

2D也可以使用同样的原理进行处理
![2D蒙皮动画](/images/article/Games104/08/Games104_08_18.png)

### Physics-based Animation
基于物理的动画，常见于三个方面：Ragdoll，即人从高空坠地时的一些动画，往往部分由艺术家设计实现，部分还需考虑物理原理（自由落体以及坠地瞬间）；
衣料的动画；Inverse Kinematics（IK）反向运动学，比如攀爬时如何让这个抓取过程更合理。
![基于物理的动画](/images/article/Games104/08/Games104_08_19.png)

### Animation Content Creation
* 在专业软件中通过key frame来插值处理
* 动捕技术

![动画制作方式](/images/article/Games104/08/Games104_08_20.png)

## 蒙皮动画实现
### Mesh如何运动
1. 为一个Pos创建Mesh
2. 为Mesh绑定骨骼（骨骼影响哪些顶点）
3. 设置骨骼的影响权重
4. 将骨架设置为所需姿势的动画
5. 通过骨架和蒙皮权重设置蒙皮顶点的动画

看似简单，但如果顶点的权重设置不合理，模型一动起来可能就炸了。
![Mesh如何运动](/images/article/Games104/08/Games104_08_21.png)

### 坐标系
* World space：包含所有物体的坐标系。
* Model space：模型制作的时的坐标系。
* Local space：当有其它物体相对于自身表示时的坐标系，骨骼的计算也是在这一坐标系中进行的。

![坐标系](/images/article/Games104/08/Games104_08_22.png)

### 生物骨骼
动画师在设计骨骼时，根据需求通常会有一套标准的骨骼，在此基础上进行角色动画的制作。
这些骨骼由一系列的刚性joint组成，两个joint可以为一根骨骼（Bone）。所有的joint都附属于root节点，通常处于角色的底部。
![生物骨骼01](/images/article/Games104/08/Games104_08_23.png)
![生物骨骼02](/images/article/Games104/08/Games104_08_24.png)

### 人物骨架
游戏中的人物，除了标准的骨骼，还会有许多附加的骨骼。比如穿着斗篷、拿着武器以及表情动画，都会有额外骨骼的需求。
![人物骨架](/images/article/Games104/08/Games104_08_25.png)

### 对象的绑定动画
游戏中常见一种动画就是骑乘，比如开车、骑马。骑乘状态下的角色会随着载具一起运动，那么两者之间就必须有一个连接点来保持两者的关系。
![对象的绑定动画](/images/article/Games104/08/Games104_08_27.png)

### T-Pos & A-Pos
T-Pos与A-Pos是在制作人物骨骼动画时常见的两种pos。
T-Pos在处理肩部的有一定的肌肉挤压，会造成对这部分的骨骼权重精度不足。A-Pos更符合制作的需求。
![T-Pos & A-Pos](/images/article/Games104/08/Games104_08_26.png)

## 3D旋转的数学原理
### 欧拉角（Euler Angle）
可以通过绕xyz旋转的矩阵相乘来获取最终效果。
另一种表达欧拉角的方式是Yaw, Roll和Pitch，分别指水平的旋转、左右侧向高低变化以及抬头低头的变化。
![2D旋转矩阵](/images/article/Games104/08/Games104_08_28.png)
![3D欧拉角旋转矩阵](/images/article/Games104/08/Games104_08_29.png)


欧拉角存在的问题：
* 顺序依赖，即换一种绕不同轴旋转的顺序会导致最终旋转结果不同。所以一般规定必须xyz顺序。
* 欧拉角存在“退化”问题，即当固定绕一个轴旋转时，其他两个轴就退化成同一个内容了，比如绕z轴转动时，x和y的地位就相同了，此时DoF实际上只有1度了。
* 插值困难。给定两组旋转角度时，很难计算它们之间的插值结果，不能简单线性插值。
* 很难绕其他任意特定轴旋转。

![旋转插值](/images/article/Games104/08/Games104_08_31.png)
![欧拉角存在的问题](/images/article/Games104/08/Games104_08_30.png)

### 四元数（Quaternion）
出于上述缺点，实际游戏制作中不太用欧拉角，反而用Quaternion会比较多。
其基于利用复数解决二维旋转问题的方法。
![复数和二维旋转](/images/article/Games104/08/Games104_08_32.png)

进一步提升到三维空间后
![四元数向量运算基础](/images/article/Games104/08/Games104_08_33.png)
比较值得注意的是
$$i^2=j^2=k^2=ijk=-1$$
这个式子，从中可以得出 ij = k, ik = j, jk = i 的事实。从而便于理解后面两个旋转的累积结果的矩阵。
与二维的复数一样，这个四元数也有共轭和互逆的概念。
![欧拉角转Quaternion](/images/article/Games104/08/Games104_08_34.png)

![Quaternion旋转](/images/article/Games104/08/Games104_08_35.png)

其中q是指旋转的四元数，v’ 是v进行q旋转后的结果
对上式进行计算优化后，结果可以表示为
![四元数到旋转矩阵](/images/article/Games104/08/Games104_08_36.png)

在以上基础上，利用四元数可以表示很多三维空间的旋转，包括反旋转、旋转的结合以及从当前方向u到指定方向v的旋转函数计算等
![四元数旋转数学](/images/article/Games104/08/Games104_08_37.png)

四元数还有一个应用就是围绕任意固定轴旋转，其中u就是那个指定轴的单位坐标，q就是与这个轴和旋转角度相关的一个旋转四元数，v’即v旋转后的结果。
![任意轴Quaternion旋转](/images/article/Games104/08/Games104_08_38.png)

## 关节与蒙皮
### Transform
关节的Pose有三个维度：Orientation、Position和Scale

#### Orientation
![方向](/images/article/Games104/08/Games104_08_39.png)

#### Position
![定位](/images/article/Games104/08/Games104_08_40.png)

#### Scale
![比例](/images/article/Games104/08/Games104_08_41.png)

合并起来形成了Affine Matrix
![Transfrom矩阵](/images/article/Games104/08/Games104_08_42.png)

### 骨骼动画 & 蒙皮
骨骼动画中所有的骨骼变动都是基于局部坐标系（旋转时能够保证骨骼大小不变），也就是和父节点相关。
所有骨骼的变动是逐步叠加的结果。骨骼动画需要存储model space下，关键帧root => joint的变换矩阵。
![从局部空间到模型空间](/images/article/Games104/08/Games104_08_43.png)

在处理骨骼蒙皮时，会记录皮肤Mesh顶点相对绑定骨骼的位置，这样皮肤就能跟随骨骼运动。
在处理骨骼蒙皮时，只需要知道Mesh顶点在model space的坐标和绑定矩阵，就可以知道蒙皮顶点相对Joint的局部坐标。
![蒙皮矩阵01](/images/article/Games104/08/Games104_08_44.png)
![蒙皮矩阵02](/images/article/Games104/08/Games104_08_45.png)

通常骨骼的数量很少，蒙皮顶点的数量很多，因此不可能每次计算蒙皮顶点时都计算骨骼的转化矩阵。在计算骨骼动画时，
先计算好某一时刻的骨骼动画，再计算所有的蒙皮矩阵。在计算实际的顶点时，是在世界空间下处理，因此可以将这部分骨骼矩阵计算好，再处理蒙皮效果。
![蒙皮矩阵调色板](/images/article/Games104/08/Games104_08_46.png)

### Clip插值
一个动画Clip是由一些关键帧组成的，关键帧之间由两个关键帧的数据插值计算，由此获得较为平滑的动作。
对弈简单的差值，比如位置就可以直接进行差值，但上面提到的角度差值就相对麻烦。
![简单插值](/images/article/Games104/08/Games104_08_47.png)

对于角度来说，最直观的线性插值（q1 -> q2直线），但旋转需要保证半径不变，因此要对对线性插值结果标准化处理（NLERP）。
缺点：角度变化不均匀，中间慢，两边慢。
![旋转的四元数插值](/images/article/Games104/08/Games104_08_48.png)

最短路径插值：从一个角度移动到另一个角度，对于每个维度来说都有两种变化方式，而符合人直观的插值是最短路径插值。
通过四元数点乘的正负值；方向向量的叉乘正负值来处理旋转方向。
![最短路径插值](/images/article/Games104/08/Games104_08_49.png)

SLERP：先计算旋转角度，对角度进行差值计算位置。优点：变化均匀。
缺点：计算量略高（反三角函数）；旋转角度很小时，计算结果不稳定。
![SLERP](/images/article/Games104/08/Games104_08_50.png)

混合处理：设定一个角度阈值，当夹角小于阈值时，使用NLERP;当角度大于阈值时，使用SLERP。
![NLERP VS SLERP](/images/article/Games104/08/Games104_08_51.png)

### 动画管线
基础动画管线：根据时间插值计算当前帧的Pos => 计算蒙皮Mesh => GPU渲染。
现代动画管线：大部分CPU计算放到GPU处理。
![基础动画管线](/images/article/Games104/08/Games104_08_52.png)

## 动画技术压缩
动画需要处理的数据很多，会占用大量的存储空间，若不就行压缩处理，难以在硬件设备上运行。
![动画数据大小](/images/article/Games104/08/Games104_08_53.png)

### 简单压缩
如果存下所有节点每秒比如三十帧的数据，会导致数据量过大没法使用，所以必须进行压缩。
第一步是进行DoF的压缩，我们可以发现，对大部分节点来说，其scale不怎么变化，所以可以直接去掉（除了脸部节点）；
同时，节点的translate也不怎么动，只需要存储固定值（除了骨盆和脸部节点）。
![自由度降低](/images/article/Games104/08/Games104_08_54.png)

### 关键帧与插值曲线
针对旋转，比较简单的方法是使用关键帧Key Frame进行插值，当插值误差小于一定阈值时就设为关键帧，
不然就把这插值对应的GT帧加入关键帧再继续细分。因而关键帧的间隔不是固定的。
![关键帧](/images/article/Games104/08/Games104_08_55.png)

关键帧的结果虽然不错，但仍然是一条折线。所以又提出了Catmull-Rom Spline：在两帧P1P2之外分别再取P0P3，然后拟合这个曲线即可。
![Catmull-Rom Spline](/images/article/Games104/08/Games104_08_56.png)

### 数值精度
![浮点量化](/images/article/Games104/08/Games104_08_57.png)
对已知范围的浮点数映射到0~1之间，可以增加数据的精度。对于四元数可利用归一化的特性，只存储三个绝对值较小的数据，这三个值处于一定范围内。
这样只需要2bit存储最大值的位置，其余每位15bit，共48bit。
![四元数量化01](/images/article/Games104/08/Games104_08_58.png)
![四元数量化02](/images/article/Games104/08/Games104_08_59.png)

### Error
压缩虽然好用，但会带来误差累积问题。所以需要检测误差是不是被控制在可接受范围内。
最实际可用的误差是visual error视觉误差，但如果对比压缩前后每顶点的误差则计算量太大，所以实际中针对每一个节点joint进行估计：
对节点估计两个互相垂直方向上的点，距离设置为offset（如果精度敏感则offset大一点，如果不敏感或小骨骼的话就offset小一点），
这样只需要比较两个点在压缩前后的error即可
![误差传播](/images/article/Games104/08/Games104_08_60.png)

Error Compensation：在多帧误差累积后反向进行偏移来补偿。其问题就是这一帧和上一帧会很不连贯。
![偏移补偿](/images/article/Games104/08/Games104_08_61.png)

## 动画技术流程
### Mesh building
![网状结构](/images/article/Games104/08/Games104_08_62.png)

### Skeleton Binding
DCC软件通常自带预制骨架，美术可以手动将骨骼附加到指定到Mesh位置。
![骨架图](/images/article/Games104/08/Games104_08_64.png)

### Skinning
![蒙皮](/images/article/Games104/08/Games104_08_63.png)

### Animation Creation
![动画创作](/images/article/Games104/08/Games104_08_65.png)

### Exporting
在DCC软件中完成动画资源制作后，需要将资源导出到游戏引擎中使用。这其中就有许多细节又要注意：
* 尺寸单位一致性
* 坐标系一致性
* 是否附带位移曲线

![导出](/images/article/Games104/08/Games104_08_66.png)

[参考文章1](https://zhuanlan.zhihu.com/p/537220623)

[参考文章2](https://blog.csdn.net/Jason__Y/article/details/124731287)

[课程视频1](https://www.bilibili.com/video/BV1jr4y1t7WR/?spm_id_from=333.788&vd_source=371bc0e94a8c97f991c4ac20af0b2d53)

[课程视频2](https://www.bilibili.com/video/BV1fF411j7hA/?spm_id_from=333.788&vd_source=371bc0e94a8c97f991c4ac20af0b2d53)

[课件PPT](https://cdn.boomingtech.com/games104_static/upload/GAMES104_Lecture%2008_Animation%20System%20-%20Basics%20of%20Animation%20Technology.pdf)
