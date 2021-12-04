---
title: Hexo 搭建静态博客
date: 2021-12-04 11:22:50
tags: [Hexo, 主题]  #设置标签
categories:  #设置分类
- 博客
---

欢迎来到[我的博客](https://cherry-white.github.io/)! 这是我的第一篇文章。
本博客是使用 [Hexo](https://hexo.io/zh-cn/) 搭建的静态博客， 主题使用了[zhaoo](https://github.com/zhaoo/hexo-theme-zhaoo)

## 快速建站

### 前期装备

1. 安装 [nodejs](https://nodejs.org/zh-cn/download/)
2. 配置nodejs环境变量
3. 安装Hexo脚手架，代码如下：

``` bash
$ npm install hexo-cli -g
```

### 创建项目

``` bash
$ hexo init "MyBlog"
$ cd MyBlog
$ npm install
```

更多信息: [写作](https://hexo.io/zh-cn/docs/writing.html)

### 运行

``` bash
$ hexo server
```

更多信息: [服务器](https://hexo.io/zh-cn/docs/server.html)

### 生成静态文件

``` bash
$ hexo generate
```

更多信息: [生成文件](https://hexo.io/zh-cn/docs/generating.html)

### 部署到远程站点

``` bash
$ hexo deploy
```

更多信息: [部署](https://hexo.io/zh-cn/docs/one-command-deployment.html)

### 加入主题

``` bash
$ git clone https://github.com/zhaoo/hexo-theme-zhaoo.git themes/zhaoo
```

### 使用

修改 Hexo 根目录下的 _config.yml 文件启用 zhaoo 主题

```yml
theme: zhaoo
```

具体使用方式：[查看](https://github.com/zhaoo/hexo-theme-zhaoo)
