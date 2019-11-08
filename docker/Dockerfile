##########################

# MizarWidget for docker #

##########################

FROM debian:latest
LABEL maintainer="Jean-Christophe  Malapert <jean-christophe.malapert@cnes.fr>"

# MizarWidget runtime distribution filename.
ARG BUILD_DATE
ARG BUILD_VERSION=master

# Proxy runtime
ARG HTTP_PROXY
ARG HTTPS_PROXY

ENV http_proxy=$HTTP_PROXY
ENV https_proxy=$HTTPS_PROXY

# Labels (based on http://label-schema.org/rc1/)
LABEL \
        org.label-schema.schema-version="1.0" \
        org.label-schema.build-date=$BUILD_DATE \
        org.label-schema.name="mizarwidget" \
       	org.label-schema.description="MizarWidget is a client to display planetary/sky data on a virtual globe" \       
        org.label-schema.url="https://github.com/MizarWeb/MizarWidget" \
        org.label-schema.vcs-url="https://github.com/MizarWeb/MizarWidget" \
        org.label-schema.vcs-ref=master \
        org.label-schema.vendor="CNES" \
        org.label-schema.version=$BUILD_VERSION \
        org.label-schema.docker.cmd="docker run -p 80:80 mizar" \
        mizarwidget_version=${BUILD_VERSION}

WORKDIR /tmp

USER root

# Install the application.
COPY docker/scripts/ /tmp/
COPY docker/README.md /tmp/
RUN \
	chmod +x /tmp/build.sh && \
        /tmp/build.sh

# Expose the Http server on 80
EXPOSE 80

# Mount conf files
VOLUME ["/opt/mizar/conf"]


# Start the fcgi and web servers.
ENTRYPOINT ["nginx"]

