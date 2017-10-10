/*******************************************************************************
 * Copyright 2012-2015 CNES - CENTRE NATIONAL d'ETUDES SPATIALES
 *
 * This file is part of MIZAR.
 *
 * MIZAR is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MIZAR is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MIZAR. If not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************/

/**
 * Configuration for require.js
 */
require.config({
    paths: {

        // Externals requirements
        "jquery": "../external/jquery/dist/jquery.min",
        "jquery.ui": "../external/jquery-ui/jquery-ui.min",
        "jquery.ui.timepicker": "../external/jquery.ui.timepicker/jquery.ui.timepicker",
        //"jquery.datetimepicker": "../node_modules/jquery-ui-timepicker-addon/dist/jquery-ui-timepicker-addon",
        "jquery.datetimepicker": "../external/jquery.ui.timepicker/jquery.ui.timepicker",
        "jquery.once": "../external/jquery-once/jquery.once.min",
        "underscore-min": "../external/underscore/underscore",
        "jszip": "../external/jszip/jszip.min",
        "saveAs": "../external/fileSaver/FileSaver.min",
        "jquery.nicescroll.min": "../external/jquery.nicescroll/dist/jquery.nicescroll.min",
        "fits": "../external/fits",
        "samp": "../external/samp",
        "gzip": "../external/gzip",
        "crc32": "../external/crc32",
        "deflate-js": "../external/deflate",
        "inflate-js": "../external/inflate",
        "wcs": "../external/wcs",
        "selectize": "../external/selectizejs/selectize",
        "sifter": "../external/selectizejs/sifter",
        "microplugin": "../external/selectizejs/microplugin",
        "flot": "../external/flot/jquery.flot.min",
        "flot.tooltip": "../external/flot/jquery.flot.tooltip.min",
        "flot.axislabels": "../external/flot/jquery.flot.axislabels",
        "loadmask": "../external/loadmask/jquery.loadmask",
        "text": "../node_modules/requirejs-plugins/lib/text",
        "string": "../node_modules/string/dist/string.min",
        "xmltojson" : "../external/Mizar/node_modules/xmltojson/lib/xmltojson",

        // Mizar Core requirements
        "gw": "../external/Mizar/src",
        "glMatrix": "../external/Mizar/external/glMatrix",

        // Mizar_Gui requirements
        "uws": "./uws",
        "gui": "./gui",
        "service": "./service",
        "MizarWidgetGui": "./MizarWidgetGui",
        "provider": "./provider",
        "tracker": "./gui/tracker",
        "templates": "../templates",
        "data": "../data",
        "MizarCore": "./MizarCore"
    },
    shim: {
        'jquery': {
            deps: [],
            exports: 'jQuery'
        },
        'jquery.ui': {
            deps: ['jquery'],
            exports: 'jQuery'
        },
        'jquery.ui.timepicker': {
            deps: ['jquery.ui'],
            exports: 'jQuery'
        },
        'underscore-min': {
            deps: ['jquery'],
            exports: '_',
            init: function () {
                return _.noConflict();
            }
        },
        'jquery.nicescroll.min': {
            deps: ['jquery'],
            exports: ''
        },
        'flot': {
            deps: ['jquery'],
            exports: '$.plot'
        },
        'flot.tooltip': {
            deps: ['flot']
        },
        'flot.axislabels': {
            deps: ['flot']
        },
        'loadmask': {
            deps: ['jquery']
        }
    },
    waitSeconds: 0
});

/**
 * Mizar widget Global main
 */
require(["./MizarWidget"], function (MizarWidget) {
    function initGuiAndLayers(mizar) {
        if (mizar.mode === mizar.CONTEXT.Sky) {
            // Set different GUIs
            mizar.setAngleDistancePlanetGui(false);
            mizar.setAngleDistanceSkyGui(true);
            mizar.setSwitchTo2D(false);
            mizar.setSampGui(true);
            mizar.setShortenerUrlGui(true);
            mizar.setMollweideMapGui(true);
            mizar.setReverseNameResolverGui(true);
            mizar.setNameResolverGui(true);
            mizar.setCategoryGui(true);
            mizar.setImageViewerGui(true);
            mizar.setExportGui(true);
        } else {
            // Set different GUIs
            mizar.setAngleDistanceSkyGui(false);
            mizar.setAngleDistancePlanetGui(true);
            mizar.setSwitchTo2D(true);
            mizar.setSampGui(false);
            mizar.setShortenerUrlGui(false);
            mizar.setMollweideMapGui(false);
            mizar.setReverseNameResolverGui(false);
            mizar.setNameResolverGui(true);
            mizar.setCategoryGui(true);
            mizar.setImageViewerGui(true);
            mizar.setExportGui(false);
        }

        var atmosMarsLayer = {
            "category": "Other",
            "type": mizar.LAYER.Atmosphere,
            "exposure": 1.4,
            "wavelength": [0.56, 0.66, 0.78],
            "name": "Atmosphere",
            "lightDir": [0, 1, 0],
            "visible": true
        };
        var coordLayer = {
            "category": "Other",
            "type": mizar.LAYER.TileWireframe,
            "name": "Coordinates Grid",
            "outline": true,
            "visible": true
        };

        var marsLayer = mizar.getLayerByName("Mars");
        mizar.addLayer(atmosMarsLayer, marsLayer);
        mizar.addLayer(coordLayer, marsLayer);
        mizar.addLayer({
            "category": "Test",
            "type": mizar.LAYER.OpenSearch,
            "dataType": "line",
            "name": "HST_test",
            "serviceUrl": "http://172.17.0.2/sitools/hst",
            "description": "Hubble Space Telescope (HST) is an orbiting astronomical observatory operating from the near-infrared into the ultraviolet. Launched in 1990 and scheduled to operate through 2010, HST carries and has carried a wide variety of instruments producing imaging, spectrographic, astrometric, and photometric data through both pointed and parallel observing programs. MAST is the primary archive and distribution center for HST data, distributing science, calibration, and engineering data to HST users and the astronomical community at large. Over 100 000 observations of more than 20 000 targets are available for retrieval from the Archive.",
            "visible": false,
            "minOrder": 4,
            "attribution": "HST data provided by <a href=\"http://hst.esac.esa.int\" target=\"_blank\"><img src=\"http://172.17.0.2/sitools/upload/esa.svg\" width='28' height='16'/></a>"
        });

        mizar.addLayer({
            type: Mizar.LAYER.OpenSearch,
            afterLoad: function(layer) {
                mizar.getMizarWidgetGui().refreshCategoryGui();

            },
            getCapabilities     :"https://peps.cnes.fr/resto/api/collections/S1/describe.xml",
            availableServices   : [ "OpenSearch" ]
        });

    }

    var widgetOptions = {
        global : {
            sitoolsBaseUrl: "http://demonstrator.telespazio.com/sitools",
            proxyUrl : "http://localhost:8080/?url=",
            proxyUse : false,
            displayWarning : true
        },
        configuration : {
            mizarBaseUrl: "http://localhost",
            guiActivated: true,
            isMobile: false,
            mode: "Sky",
            positionTracker: {
                position: "bottom"
            },
            elevationTracker: {
                position: "bottom"
            },
            stats: {
                visible: true
            },
            debug: true,
            registry: {
                hips :"http://aladin.unistra.fr/hips/globalhipslist?fmt=json&dataproduct_subtype=color"
            },
            shortener: "${sitoolsBaseUrl}/shortener"
        },
        skyCtx : {
            continuousRendering : true,
            coordinateSystem: {
                geoideName: "Equatorial"
            },
            navigation: {
                initTarget: [85.2500, -2.4608],
                initFov: 20,
                inertia: true,
                minFov: 0.001,
                zoomFactor: 0,
                mouse: {
                    "zoomOnDblClick": true
                }
            },
            layers: ["../data/backgroundSurveys.json"],
            nameResolver: {
                zoomFov: 2,
                jsObject: "gw/NameResolver/CDSNameResolver"
            },
            reverseNameResolver: {
                jsObject: "gw/ReverseNameResolver/CDSReverseNameResolver",
                baseUrl: "http://alasky.u-strasbg.fr/cgi/simbad-flat/simbad-quick.py?Ident={coordinates}&SR={radius}"
            },
            webProcessing : [
                {
                    name : "cutOut",
                    baseUrl: "${sitoolsBaseUrl}/cutout"
                },
                {
                    name : "zScale",
                    baseUrl: "${sitoolsBaseUrl}/zscale"
                },
                {
                    name : "healpixcut",
                    baseUrl: "${sitoolsBaseUrl}/healpixcut"
                }
            ]
        },
        planetCtx : [
            {
                layerName: "Mars",
                continuousRendering : false,
                layers: "../data/marsLayers.json",
                nameResolver: {
                    jsObject: "gw/NameResolver/DictionaryNameResolver",
                    baseUrl: "../data/mars_resolver.json"
                },
                navigation: {
                    initTarget: [85.2500, -45.4608],
                    updateViewMatrix : false,
                    inertia: true,
                    mouse: {
                        "zoomOnDblClick": true
                    }
                }
            }
        ]



    };

    var options = {

        guiActivated: true,
        isMobile: false,
        mode: "Sky",
        coordinateSystem: {
            geoideName: "Equatorial"
        },
        navigation: {
            "initTarget": [0, 0],
            "inertia":true
        },
        positionTracker: {
            position: "bottom"
        },
        elevationTracker: {
            "position": "bottom"
        },
        stats: {
            visible: true
        },
        debug : true,
        //sitoolsBaseUrl: 'http://172.17.0.2/sitools/',//'http://sitools.akka.eu:8080',
        hipsServiceUrl: "http://aladin.unistra.fr/hips/globalhipslist?fmt=json&dataproduct_subtype=color",
        backgroundSurveysFiles: ["../data/backgroundSurveys.json"],
        additionalLayersFiles: [{
            layerName: "Mars",
            url: "../data/marsLayers.json"
        }],
        nameResolver: {
            zoomFov: 2,
            jsObject: "gw/NameResolver/CDSNameResolver"
        }
    };

    var mizarWidget = new MizarWidget('mizarWidget-div', widgetOptions);
    var mizarWidgetAPI = mizarWidget.getMizarWidgetAPI();

    initGuiAndLayers(mizarWidgetAPI);
    //mizarWidgetAPI.viewPlanet("Earth");

});
