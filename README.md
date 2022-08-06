# my-site

#### 介绍
个人博客

## 软件架构
* Hexo 框架和 zhaoo主题搭建的博客界面
* Taro 框架搭建的小程序

## 使用说明

* 使用 yarn 命令进行初始化项目
* 前端界面使用 yarn start 即可启动
* 小程序需要 Taro 进行构建
  - 需要安装 npm install -g @tarojs/cli
  - 构建命令 yarn build:weapp

### 小程序初始化的时候一般会失败，解决方案：

1. 使用低版本的 nodejs 即可
2. 如果安装过程出现sass相关的安装错误，请在安装

`npm install -g mirror-config-china`

再进行初始化操作
`npn i` 或者`yarn`
