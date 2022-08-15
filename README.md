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

### 文章置顶

1. 找到 `node_modules\hexo-generator-index\lib\generator.js` 文件，替换成如下代码：

  ```javascript
  'use strict';
  var pagination = require('hexo-pagination');
  module.exports = function (locals) {
    var config = this.config;
    var posts = locals.posts;
    posts.data = posts.data.sort(function (a, b) {
      if (a.top && b.top) {
        if (a.top == b.top) return b.date - a.date;
        else return b.top - a.top;
      } else if (a.top && !b.top) {
        return -1;
      } else if (!a.top && b.top) {
        return 1;
      } else return b.date - a.date;
    });
    var paginationDir = config.pagination_dir || 'page';
    return pagination('', posts, {
      perPage: config.index_generator.per_page,
      layout: ['index', 'archive'],
      format: paginationDir + '/%d/',
      data: {
        __index: true
      }
    });
  };
  ```

2. 在文章的 `Front-matter` 中添加 `top` 字段，指定数值，数值越大，显示越靠前：

  ```markdown
  ---
  title: zhaoo - 主题使用文档
  date: 2020-05-05 09:29:54
  tags: [Hexo, 主题]
  keywords: hexo-theme-zhaoo, zhaoo, hexo, 主题, 使用文档, document
  categories:
  - 项目
  image: /images/theme/post-image.jpg
  top: 10  #添加该字段
  ---
  ```
