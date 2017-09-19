#!/usr/bin/env bash

echo 'deploy app starting'
mv /etc/nginx/sites-enabled/* /tmp
ln -s /var/www/blog-sanic/blog.nginx /etc/nginx/sites-enabled/blog
cd /var/www/blog-sanic
nohup gunicorn wsgi:application --bind 0.0.0.0:8000 --worker-class sanic.worker.GunicornWorker > /tmp/blog.log 2>&1 &
service nginx restart
echo 'deploy app succeeded'