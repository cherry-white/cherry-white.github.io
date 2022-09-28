---
title: Mathf.Lerp 使用
image: /images/background/Mathf-Lerp.jpg
tags:
  - Unity
  - Unity API
categories:
  - Unity
  - Unity API
abbrlink: 6ab666a7
date: 2022-08-06 15:05:15
---

### 参数解析
```C#
Mathf.Lerp(float a, float b, float t)
```
| 参数  |   解析 |
|:----|-----:|
| a   |  开始值 |
| b   |  结束值 |
| t   |  插值值 |

返回一个 float ，开始值和结束值之间根据浮点数插值的结果。

通过 t 线性插值在A和B之间。

参数 t 夹紧到[0，1]范围内。

* 当t = 0返回a时
* 当t = 1返回b
* 当t = 0.5返回a和b的中点。

### 使用方式
```C#
public float LerpContinuedTime =  3.0F;     // 需要插值的持续时间
public float LerpTime;  // 当前插值的时间
public AnimationCurve Curve;    //可以配置的运动曲线
public float CurValue;  //记录当前的值

public void Update()
{
    if(LerpTime < LerpContinuedTime)
    {
        LerpTime += Time.deltaTime;
        
        // 匀速从 0 插值到 100 
        Mathf.Lerp(0f, 100f, LerpTime/LerpContinuedTime);
        
        // 递减插值，开始的值一直改变，当插值百分比固定的时候，计算出来的值每次比上一次计算的小
        CurValue = Mathf.Lerp(CurValue, 100f, 0.1f);
        
        // 根据运动曲线插值，可以实现减速、加速、值先增加再减小等效果
        Mathf.Lerp(0f, 100f, LerpTime/LerpContinuedTime, Curve.Evaluate(LerpTime / LerpContinuedTime));
    }
}
```
