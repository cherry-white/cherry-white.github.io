---
title: Gitalk 评论踩坑
image: /images/background/gitalk-error.jpg
tags: [Gitalk, 踩坑, 报错]
date: 2022-05-24 17:57:13
categories: 
- 博客
- 踩坑
---

# 起因

我的博客关于页面没有开通评论，就想给文章开通评论区，点击登录功能发现，GitHub 登录总是失败。
![登陆报错](/images/article/gitalk/error.png)

# 初步解决
[参考文章](https://zhuanlan.zhihu.com/p/350735142)

找到对应的 GitHub 仓库，Issue 区往往能找到一些有效答案。

gitalk中用到的 cors-anywhere.herokuapp.com 这个网站原本是用来演示用的，但是现在已经被滥用了。

从2021.1.31开始用户必须手动先访问这个网站获取临时的访问权限，然后才能使用，作者建议开发者自己维护一个代理网站。

在gitalk的issue中看到别人分享的一个在线代理，先拿来用下
```http
https://netnr-proxy.cloudno.de/https://github.com/login/oauth/access_token
```

我用的是zhaoo主题，在布局模板中找到代理gitalk.ejs文件，如果其他模板可以搜索gitalk关键字应该也能找到差不多的代码。

在模板里加上proxy配置和在主题的_config.yml文件上也加上proxy配置:
```js
 var gitalk = new Gitalk({
      clientID: '<%= theme.gitalk.clientID %>',
      clientSecret: '<%= theme.gitalk.clientSecret %>',
      id: window.location.pathname,
      repo: '<%= theme.gitalk.repo %>',
      owner: '<%= theme.gitalk.owner %>',
      admin: '<%= theme.gitalk.admin %>',
      proxy: '<%= theme.gitalk.proxy %>',
    });
```
重新部署后发现依然有问题。

查看了对应请求的应答码 429，表示请求太多，我个人估计是白嫖这个在线代理的人太多导致的。
既然白嫖的代理不能用，那我们就自己搭一个在线代理吧。

# 最终解决
[参考文章](https://www.chenhanpeng.com/create-own-cors-anywhere-to-resolve-the-request-with-403/)
利用CloudFlare Worker创建在线代理，不需要我们有服务器，也不需要搭建Node.js服务，只需要注册一个CloudFlare账号，创建一个Worker，部署一个JS脚本就可以了，简单方便，下面我们就来看看如何创建吧。

首先你需要一个 CloudFlare 的账号，如果还没有的话就先注册一个吧：[点我注册](https://dash.cloudflare.com/)

选择Workers，创建一个免费的Worker。
![创建Workers](/images/article/gitalk/register.png)

免费版本每天10万次请求也足以应对个人使用或者是小范围分享了。

填写自己喜欢的二级域名，然后创建worker。

进入github项目的 [index.js](https://github.com/Hanpeng-Chen/cloudflare-cors-anywhere/blob/master/index.js)，复制代码。

清除脚本编辑器中的示例代码，将复制的代码粘贴进去。
```text
这里有个点需要注意：我们可以设置请求的黑白名单，这里的白名单我只设置了自己博客
大家可以根据自己的情况修改，当然也可以设置为whitelist = [ ".*" ]
这样的话知道你代理地址的人都可以用了，然而免费版本的每天只有10万次请求
如果用的人多了很容易就用完了，所以还是建议大家设置 whitelist
```
![创建Workers](/images/article/gitalk/edit.png)
修改好之后，点击 保存并部署，如果部署正常的话，我们就可以使用我们创建的在线代理了。

从右侧获取到你的worker域名并记下来，在上面提到_confix.yml文件的proxy配置项修改为如下代码：
```yaml
proxy: https://sakura.cherrywhite.workers.dev/?https://github.com/login/oauth/access_token
```
一定要注意连接的地方，要加?,不然会出现no access token的错误
还有一个点要注意的是，如果还是有问题，index.js文件可以使用：
```js
myHeaders.set("Access-Control-Allow-Origin", "*");
// myHeaders.set("Access-Control-Allow-Origin", event.request.headers.get("Origin"));
```

重新部署我们的博客，再次点击 使用Github登录，这次登录成功，没有报错。
至此，个人在线代理就搭建成功了，博客的评论功能也能正常使用了，撒花！！！
