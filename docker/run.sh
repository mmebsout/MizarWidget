#!/usr/bin/env bash
docker run --name mizar -d -p 8000:80 mizar
echo "Please launch : http://localhost:8000/demo/MizarWidget/examples/Basic_dev.html"