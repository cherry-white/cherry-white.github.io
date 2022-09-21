---
title: docker-maven插件问题 
date: 2021-12-04 19:56:47 
image: /images/background/docker-maven.jpg 
tag: [java, maven, 插件]
categories:
- 踩坑
---

个人在使用docker-maven-plugin来构建镜像的时候出现报错消息

报错 Connection reset by peer ，具体错误日志如下所示：

```log
[ERROR] Failed to execute goal com.spotify:docker-maven-plugin:1.2.2:build (default-cli)
on project parkinglot: Exception caught: java.util.concurrent.ExecutionException: 
com.spotify.docker.client.shaded.javax.ws.rs.ProcessingException:
com.spotify.docker.client.shaded.org.apache.http.client.ClientProtocolException: 
Cannot retry request with a non-repeatable request entity: Connection reset by peer -> [Help 1]
```

```xml
<plugin>
    <groupId>com.spotify</groupId>
    <artifactId>docker-maven-plugin</artifactId>
    <version>1.2.2</version>
    <dependencies>
        <dependency>
            <groupId>javax.activation</groupId>
            <artifactId>activation</artifactId>
            <version>1.1.1</version>
        </dependency>
    </dependencies>
    <configuration>
        <imageName>oldBookShare</imageName>
        <!-- 指定 Dockerfile 所在的文件目录 -->
        <dockerDirectory>${project.basedir}</dockerDirectory>
        <resources>
            <resource>
                <targetPath>/</targetPath>
                <directory>${project.build.directory}</directory>
                <include>${project.build.finalName}.jar</include>
            </resource>
        </resources>
    </configuration>
</plugin>
```

解决方法：将图中的oldBookShare改成old-book-share就好了，容器名称不能有大写。

报错 Permission denied ，具体错误日志如下所示：

```log
[ERROR] Failed to execute goal com.spotify:docker-maven-plugin:1.2.2:build (default-cli)
on project tomcat-container: Exception caught: java.util.concurrent.ExecutionException: 
com.spotify.docker.client.shaded.javax.ws.rs.ProcessingException: java.io.IOException:
Permission denied -> [Help 1]
```

遇到了权限不足的情况习惯性的切换到root用户执行，结果一直被阻塞，疯狂打印日志（我所用操作系统：VM-20-7-debian）。
[经过苦苦探寻，最终找到了解决该问题的方法。](https://www.cnblogs.com/goWithHappy/p/solve-docker-maven-permission-deny.html)

/var/run/docker.sock文件,它是默认情况下docker守护程序侦听的UNIX套接字侦听，它可用于与容器内与守护程序通信。 普通用户是没有权限的，先查看docker.sock的文件权限

```bash
sudo ls -al /var/run/docker.sock
```
执行结果如下：

```bash
srw-rw---- 1 root docker 0 Dec  1 20:42 /var/run/docker.sock
```

发现普通用户果然没有权限操作该文件的，因此考虑修改文件权限，执行如下命令：

```bash
sudo chmod 666 /var/run/docker.sock
```

然后我们重新执行docker的命令发现可以出现正常的结果，服务器重启的时候docker.sock文件可能会恢复，遇到这个问题再修改一下权限就可以了。
