# readfree.me自动登录
基本要求：有豆瓣账号

基本原理：　模拟readfree.me使用豆瓣登录情景

目的：　使用定时任务实现自动签到　然后可以免费获取下载数目；
# 使用
在配置`config.json`中填写豆瓣的账号密码：
```
"user_alias": "xxx",　//　豆瓣账号  
"user_passwd": "xxx", // 豆瓣密码
```

然后使用node执行　`index.js`

或者使用　`crontab`　新增一个定时任务：
```
0 0 * * * /xxx/xxx/autologin-readfree.me/index.js
```

ps：　crontab　需要使用 `service crond start`或者`service cron start`启动