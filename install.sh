#!/usr/bin/env bash

echo 'install requirements starting'

sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install python3 python3-dev python3-pip python3-setuptools mongodb build-essential nginx -y
pip3 install gunicorn
pip3 install -r requirements.txt

echo 'install requirements succeeded'