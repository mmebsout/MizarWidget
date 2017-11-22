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
        "xmltojson": "../node_modules/xmltojson/lib/xmlToJSON.min",

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
        "data": "../data"
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
        } else if (mizar.mode === mizar.CONTEXT.Planet) {
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
        } else if (mizar.mode === mizar.CONTEXT.Ground) {
            mizar.setAngleDistanceSkyGui(false);
            mizar.setAngleDistancePlanetGui(false);
            mizar.setSwitchTo2D(false);
            mizar.setSampGui(false);
            mizar.setShortenerUrlGui(false);
            mizar.setMollweideMapGui(false);
            mizar.setReverseNameResolverGui(false);
            mizar.setNameResolverGui(false);
            mizar.setCategoryGui(true);
            mizar.setImageViewerGui(true);
            mizar.setExportGui(false);
        } else {
            throw "Unable to find mizar.mode="+mizar.mode;
        }
    }

    var widgetOptions = {
        "global": {
            "sitoolsBaseUrl": "http://demonstrator.telespazio.com/sitools",
            "proxyUrl": "http://localhost:8080/?url=",
            "proxyUse": false,
            "displayWarning": true
        },
        "gui": {
            "isMobile": false,
            "positionTracker": {
                "position": "bottom"
            },
            "elevationTracker": {
                "position": "bottom"
            },
            "stats": {
                "visible": true
            },
            "debug": true,
            "registry": {
                "hips" :"http://aladin.unistra.fr/hips/globalhipslist?fmt=json&hips_frame=equatorial&hips_frame=galactic"
            },
            "shortener": "${sitoolsBaseUrl}/shortener"
        },
        "ctx": [
            {
                "name": "sky",
                "mode": "Sky",
                "context": "./skyCtx.json"
            },
            {
                "name": "mars",
                "mode": "Planet",
                "context": "./marsCtx.json"
            },
            {
                "name": "moon",
                "mode": "Planet",
                "context": "./moonCtx.json"
            },
            {
                "name": "earth",
                "mode": "Planet",
                "context": "/earthCtx.json"
            },
            {
                "name": "curiosity",
                "mode": "Ground",
                "context": "/curiosityCtx.json"
            }
        ],
        "defaultCtx": "sky"
    };


    var mizarWidget = new MizarWidget('mizarWidget-div', widgetOptions);
    var mizarWidgetAPI = mizarWidget.getMizarWidgetAPI();

    initGuiAndLayers(mizarWidgetAPI);
    mizarWidgetAPI.init();

});
