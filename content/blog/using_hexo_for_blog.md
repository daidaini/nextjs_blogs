---
title: 使用hexo搭建个人博客
date: 2024-08-05
description: 技术杂记
tags: 
    - hexo
    - reactjs
    - nodejs
---

## 基础
1. 安装npm
```shell
apt install -y npm
```
确认安装完成
```shell
node -v
npm -v
```

2. 安装hexo-cli
```shell
npm install -g hexo-cli
```
验证
```shell
hexo -v
```

3. 创建自己的博客目录
```shell
mkdir blogs
cd blogs
hexo init
```

目录结构:
> ├── _config.landscape.yml  
> ├── _config.yml  
> ├── db.json  
> ├── node_modules  
> ├── package-lock.json  
> ├── package.json  
> ├── public  
> ├── scaffolds  
> ├── source  
> └── themes  


4. 添加博客文章，并发布
```shell
root@vultr:/home/linuxuser/blogs# cd source/_posts/
root@vultr:/home/linuxuser/blogs/source/_posts# ls
回调函数的理解.md  理解CPP的移动语义.md
root@vultr:/home/linuxuser/blogs/source/_posts# 
```

生成和发布：
```shell
root@vultr:/home/linuxuser/blogs# hexo clean
INFO  Validating config
root@vultr:/home/linuxuser/blogs# hexo g
root@vultr:/home/linuxuser/blogs# hexo s
```
三个命令：
- hexo clean    清理
- hexo g/generate 创建
- hexo s/server  开启服务

## 主题
进入`themes`目录，然后拷贝主题：
```shell
git clone -b master https://github.com/probberechts/hexo-theme-cactus.git
```


## 自动部署
### github
修改`_config.yml`，如下：
```shell
deploy:
  #type: git
  #repo: https://gitee.com/daidaini/daidaini.gitee.io
  #branch: master

  type: git
  repo: https://github.com/daidaini/daidaini.github.io
  branch: master
```

然后通过命令进行推送部署：
```shell
hexo deploy/d
```

## 配置Web服务器
1. _使用nginx_:
```shell
apt install nginx
```

```shell
sudo systemctl start nginx
sudo systemctl enable nginx  # 设置开机自启
```
2. _配置Nginx_:
	> 编辑Nginx配置文件,通常位于 `/etc/nginx/nginx.conf` 或 `/etc/nginx/sites-available/default`
```shell
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /path/to/your/hexo/public;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```
暂时没有域名，则：
```shell
server {
    listen 80 default_server;
    server_name _;
    root /path/to/your/hexo/public;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```
3. 验证：
```shell
sudo nginx -t

# 重新加载 (如果启动后调整了配置，需要reload)
sudo systemctl reload nginx
```

4. _确保防火墙打开：_
```shell
# Ubuntu/Debian
sudo ufw allow 'Nginx HTTP'
#or 
sudo ufw allow 80/tcp
# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

## 添加域名
设置域名并将其DNS记录指向您的云服务器IP地址是一个重要的步骤。以下是详细的流程：

1. 购买域名：
    - 选择一个域名注册商（如GoDaddy、Namecheap、阿里云、腾讯云等）
    - 搜索并购买您想要的域名
2. 获取云服务器IP地址：
    - 登录您的云服务器控制面板
    - 找到并记录下服务器的公网IP地址
3. 访问域名管理面板：
    - 登录您购买域名的注册商网站
    - 找到域名管理或DNS设置部分
4. 设置DNS记录：
    - A记录：将域名直接指向IP地址
        - 主机记录：通常使用"@"表示根域名
        - 记录类型：选择"A"
        - 值：输入您的服务器IP地址
    - CNAME记录：如果要设置"www"子域名
        - 主机记录：输入"www"
        - 记录类型：选择"CNAME"
        - 值：输入您的根域名（如example.com）
5. 保存更改：
    - 确认并保存您的DNS设置
6. 等待DNS传播：
    - DNS更改可能需要几分钟到48小时才能完全生效
    - 可以使用在线DNS查询工具检查传播状态
7. 配置Web服务器：
    - 更新Nginx配置，添加您的域名
    ```nginx
    server {     
	    listen 80;    
	    server_name yourdomain.com www.yourdomain.com;    
	    root /path/to/your/hexo/public;    
	    index index.html;     
	    
	    location / {        
		    try_files $uri $uri/ =404;    
		} 
	}
	```
    - 重新加载Nginx配置：`sudo nginx -t && sudo systemctl reload nginx`
8. 测试：
    - 在浏览器中输入您的域名，确保网站可以正常访问

