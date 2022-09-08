---
title: GPU 工作原理
image: /images/background/GPU-Working-Principle.jpg
tags: [GPU]
date: 2022-09-04 10:13:02
categories:
- GPU
- 原理
---
## 为什么GUP计算是可行的（我的数据在哪里）
Flops(每秒种浮点运算次数)跟机器的算力有关
在购买机器的时候 nobody cares about flops 或者说 almost nobody really cares about flops

CPU大约每秒能进行2万次的双精度（FP64）运算。
内存将数据传送到CPU，每秒传输大约200G字节，也就是每秒25G的FP64数值。
因为每个FP64是8字节，所以内存每秒可以提供250亿个FP64值，CPU每秒能处理2万亿个FP64数据

每秒内存需要同时传输80次数据给CPU才能让CPU满载
![计算强度](/images/article/GPUWorkingPrinciple/ComputeIntensity.png)

不同CPU的计算强度都差不多，Flops处理能力越强就会有更大的内存带宽来平衡它，
当Flops的速度比内存宽带的速度块，计算强度就会上升
![CPU vs GPU](/images/article/GPUWorkingPrinciple/CPUVSGPU.png)

因为Flops被内存带宽完全的限制住了，随意每次加载100个程序是十分困难的，
这还不是全部，我们更关心的是延迟（Latency）而不是内存带宽（Memory bandwidth）
![Because](/images/article/GPUWorkingPrinciple/Because.png)

通过方程aX + Y = Z，分别加载X和Y等待延迟读取到数据后进行计算得到结果，这就是核心的指令流水线
![数乘(daxpy)](/images/article/GPUWorkingPrinciple/Daxpy.png)

在一个时钟周期内光传播的距离只有10厘米，所以时钟频率太快而光走不了多远。
电流在硅中的传播速度只有光的五分之一（6万公里/秒），
一个时钟周期内，电流的移动只有20毫米。
内存到CPU的路程需要有5-7个时钟周期的延迟，因为物理上的原因，
在内存中提取数据时需要5-10个时钟周期才能放回到CPU。
![内存到CPU距离](/images/article/GPUWorkingPrinciple/Distance.png)

[参考视频](https://www.bilibili.com/video/BV17L4y1a7Xy?spm_id_from=333.880.my_history.page.click&vd_source=371bc0e94a8c97f991c4ac20af0b2d53)
