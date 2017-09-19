#!/usr/bin/env bash

# 只需要修改这一项
app_name='blog-sanic'

# 保持 nginx 配置文件和项目名称相同
nginx_file="$app_name.nginx"
log_path="/tmp/$app_name.log"

echo "deploy $app_name app starting"
mv /etc/nginx/sites-enabled/* /tmp
ln -s "/var/www/$app_name/$nginx_file" "/etc/nginx/sites-enabled/$app_name"
cd "/var/www/$app_name"
nohup gunicorn wsgi:application --bind 0.0.0.0:8000 --worker-class sanic.worker.GunicornWorker > $log_path 2>&1 &
service nginx restart
echo "deploy $app_name app succeeded"