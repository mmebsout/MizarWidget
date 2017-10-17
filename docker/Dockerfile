FROM node:8.7.0-wheezy

# Tells to apt-get we're not interactive
ENV DEBIAN_FRONTEND=noninteractive

	# Configure npm by allowing root to use npm
RUN echo "unsafe-perm=true" > ~/.npmrc
# \
	# Use REGARDS registry
# && npm config set strict-ssl false \
# && npm config set registry "https://172.26.46.158:8443/repository/NPM-proxy/"

#ENV NO_PROXY=172.26.46.158

# Install nginx to serve static files - BEGIN
RUN echo "deb http://nginx.org/packages/debian/ wheezy nginx" >> /etc/apt/sources.list.d/nginx.list
RUN apt-key adv --fetch-keys "http://nginx.org/keys/nginx_signing.key"

RUN apt-get update && apt-get -y dist-upgrade
RUN apt-get -y install nginx openssl ca-certificates

RUN rm -rf /etc/nginx/conf.d/*

ADD nginx.conf /etc/nginx/nginx.conf
ADD mizar.nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
# Install nginx to serve static files - END

# Install Mizar
RUN mkdir -p /var/www/html/demo && env

# change directory
WORKDIR /var/www/html/demo

RUN git clone https://github.com/MizarWeb/MizarWidget \
 && cd MizarWidget \
 && git checkout sprint03 \
 && git submodule init \
 && git submodule update \
 && npm install \
 && cd external/Mizar \
 && npm install

ENTRYPOINT ["nginx"]