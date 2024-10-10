---
title: 网站SEO搜索指令大概
date: 2024-10-08
description: 使用搜索引擎的一些优化技巧
tags:
  - web
---

![](/static/life_pics/girl_blue_sea_2.jpg)

## 双引号
完全匹配搜索。
示例：
```
"use std::function"
```


## 减号
告诉搜索引擎不搜索减号后面的词的页面。
```
常用c++算法 -csdn
```
这样，就不会搜索到csdn的关于"常用c++算法"的内容


## 星号
星号是通配符，就是支持模糊搜索


## inurl:
`inurl:` 指令用于搜索查询词出现的URL中的页面。
```
inurl:muduo
```
比如搜索“inurl:SEO优化”，返回的结果的网址URL中包含“SEO优化”的页面，一般有的标签里面带有这个词，还有文件夹或者文档有可能带有这个词，  
因为关键词存在URL中会影响到排名，所以利用inurl:指令可以更准确的找到你的竞争对手。


## site:
`site:` 用以指定搜索网站
```
site:youtube.com 博客
```


## link:
`link:` 用以搜索某个url的反向链接，既包含内部链接，也包含外部链接。
```
# 查询所有相关域
link:example.com

```

查询网站的外部链接:
```
link:example.com -site:example.com
```
用link:example.com查询example.com不包括自己的网站的反向链接



## info:
`info:` google专用，可以查询某个特定网站的收录信息、最近的快照情况、相似网页、站点链接、网站内链及包含域名的网页。
```
info:www.huidian.net
```


## related:
`related:` google专用。
返回与某个网站有关联的页面
```
related:www.huidian.net
```


## define:
`define:` 查询特定关键词