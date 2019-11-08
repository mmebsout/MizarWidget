#!/usr/bin/env bash
docker run --name mizar -d -p 8000:80 mizarweb/mizarwidget
echo "Please launch : http://localhost:8000/"
