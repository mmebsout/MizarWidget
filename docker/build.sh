#!/usr/bin/env bash

#sudo -E \
  docker build --no-cache \
  --build-arg https_proxy=$HTTP_PROXY --build-arg http_proxy=$HTTP_PROXY \
  --build-arg HTTP_PROXY=$HTTP_PROXY --build-arg HTTPS_PROXY=$HTTP_PROXY \
  -t mizar .

