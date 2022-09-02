---
title: 现代游戏引擎 - 引擎架构分层（二）
image: /images/background/Engine-Hierarchy.jpg
tags: [游戏引擎, Game104]
date: 2022-08-30 21:51:02
categories:
- 游戏引擎
---
## 前言
* 资源层：负责加载管理资源
* 功能层：就是让画面可见，可动，可交互
* 核心层：提供各种核心服务，比如动画、物理、渲染、脚本、相机
* 工具层：编辑器，最上层
* 平台层：硬件输入适配
* 三方插件：SDK集成、或者工具独立出来

## 资源层
* 核心功能：管理资产的生命周期
* 资源导入引擎：要从资源繁杂的数据中，拿取引擎需要的信息，转变成引擎的资产
* 资源管理器：一个虚拟文件系统，通过路径引用来加载和卸载资源
![资源生命周期](/images/article/Games104/02/Games104_02_01.png)

## 功能层
功能层的两大神兽：tick逻辑和tick渲染
![Tick](/images/article/Games104/02/Games104_02_02.png)

1. 入门版多线程
   * 逻辑线程
   * 渲染线程
   * 模拟线程
2. 主流商业引擎多线程
   * 在入门版基础上，把物理、渲染等可以多线程计算的放到多线程进行处理
3. 前沿技术
   * JobSystem：所有都是一个原子，把线程吃满

![多线程](/images/article/Games104/02/Games104_02_03.png)

## 核心层

* 数学库：矩阵，大学学的线性代数就够用了、物理用的数学比较难
* 数学计算效率：不追求完全精准，极限接近就可以，追求效率高
* 数据结构和容器：
  * 矢量、地图、树木等
  * 使用高效的STL库
  * 避免片段内存
* 内存管理：
  * 内存池，分配
  * 缓存命中率高
  * 内存排列

![内存管理](/images/article/Games104/02/Games104_02_08.png)

内存分配金科玉律：
1. 把数据放在一起
2. 访问数据的时候最好顺序排列
3. 删除的时候最好一批次的删除

![核心层基础](/images/article/Games104/02/Games104_02_04.png)

## 平台层

* 硬件输入适配：键盘、鼠标、手柄、VR等
* 渲染输出适配：不同显卡图形API适配，比如 DirectX 和 OpenGL
* 文件路径适配：ios和windows 文件路径
* 架构：Arm64、Arm32

![平台层](/images/article/Games104/02/Games104_02_05.png)

## 工具层

DCC（Digital Content Creation）：导出和导入

![DCC](/images/article/Games104/02/Games104_02_06.png)

* 解耦和降低复杂性
  * 下层独立于上层
  * 上层不知道底层是如何实现的
* 对不断发展的需求的响应
  * 上层演化迅速，但下层演化稳定

![架构分层](/images/article/Games104/02/Games104_02_07.png)

[参考文章](https://zhuanlan.zhihu.com/p/499674385)

[课程视频](https://www.bilibili.com/video/BV12Z4y1B7th/?spm_id_from=333.788&vd_source=422a2ce23eb94fdbdfc2824aa2898ea5)

[课件PPT](https://cdn.boomingtech.com/games104_static/upload/GAMES104_lecture02Layered%20Architecture%20of%20Game%20Engine.pdf)
