<table><tr valign="middle"><td><img src="favicon.ico"></td><td><b>MizarWidget, a webGL client to display geographical data on planets or sky</b></td></tr></table>

# MizarWidget

MIZAR is a CNES web application, developed in collaboration with IAS (Institut d'Astrophysique Spatial d'Orsay) for the requirements, with the support of CDS (Centre de Données astronomique de Strasbourg) as data provider.

## Getting started ##

These instructions will get you a copy of the project up and running on your local machine for development.

### Prerequisities

What things you need to install the software and how to install them

    nodejs
    npm

### Installing for developers

    git clone https://github.com/MizarWeb/MizarWidget.git
    cd MizarWidget
    git submodule init
    git submodule update

    # Build
    cd external/Mizar
    npm install
    cd ../..
    npm install

### Running the server

    npm start

## Installing for end-users

### Using docker

    cd docker
    sh ./build.sh

### Without docker

    cd external/Mizar
    npm run build:prod
    npm run doc:create
    npm run license
    cd ../..
    npm run build:dist

Then copy all the dist directory to your web server.
