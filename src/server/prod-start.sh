#!/bin/bash
#nvm use v12.8.0
export NODE_ENV=prod; nohup node app-covid19-cluster.js &> app.out &

# nohup
