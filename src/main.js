/*******************************************************************************
 * Copyright 2012-2018 CNES - CENTRE NATIONAL d'ETUDES SPATIALES
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
        "jquery": "../node_modules/jquery/dist/jquery.min",
        "jquery.ui": "../external/jquery-ui/jquery-ui.min",
        //"jquery.ui.timepicker": "../external/jquery.ui.timepicker/jquery.ui.timepicker",
        //"jquery.datetimepicker": "../external/jquery.ui.timepicker/jquery.ui.timepicker",
        "jquery.datetimepicker": "../node_modules/jquery-datetimepicker/jquery.datetimepicker",
        "jquery-mousewheel": "../node_modules/jquery-mousewheel/jquery.mousewheel",
        "php-date-formatter":"../node_modules/php-date-formatter/js/php-date-formatter.min",
        "jquery.once": "../node_modules/jquery-once/jquery.once.min",
        "underscore-min": "../node_modules/underscore/underscore-min",
        "jszip": "../external/Mizar/node_modules/jszip/dist/jszip.min",
        "saveAs": "../external/fileSaver/FileSaver.min",
        "jquery.nicescroll.min": "../node_modules/jquery.nicescroll/dist/jquery.nicescroll.min",
        "fits": "../external/fits",
        "samp": "../external/samp",
        "gzip": "../external/gzip",
        "crc32": "../external/crc32",
        "deflate-js": "../external/deflate",
        "inflate-js": "../external/inflate",
        "wcs": "../external/wcs",
        "selectize": "../node_modules/selectize/dist/js/standalone/selectize.min",
        "sifter": "../node_modules/sifter/sifter.min",
        "microplugin": "../ node_modules/microplugin/src/microplugin",
        "flot": "../external/flot/jquery.flot.min",
        "flot.tooltip": "../external/flot/jquery.flot.tooltip.min",
        "flot.axislabels": "../external/flot/jquery.flot.axislabels",
        "loadmask": "../external/Mizar/external/loadmask/jquery.loadmask",
        "text": "../node_modules/requirejs-plugins/lib/text",
        "string": "../node_modules/string/dist/string.min",
        "xmltojson": "../external/Mizar/node_modules/xmltojson/lib/xmlToJSON.min",
        "wms-capabilities": "../external/Mizar/node_modules/wms-capabilities/dist/wms-capabilities",
        "moment": "../node_modules/moment/min/moment.min",
        "jsvotable": "../external/Mizar/node_modules/jsvotable/JsVotable.min",	    
        "jscsv": "../external/Mizar/node_modules/jscsv/JsCsv.min",

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
require(["jquery", "underscore-min", "./MizarWidget"], function ($, _, MizarWidget) {

    /**
     * Returns the mizar URL.
     * @return {String}
     * @private
     */
    var getMizarUrl = function () {
        /**
         *    Store the mizar base urlferf
         *    Used to access to images(Compass, Mollweide, Target icon for name resolver)
         *    Also used to define "star" icon for point data on-fly
         *    NB: Not the best solution of my life.... TODO: think how to improve it..
         */
        // Search throught all the loaded scripts for minified version
        var scripts = document.getElementsByTagName('script');
        var mizarSrc = _.find(scripts, function (script) {
            return script.src.indexOf("MizarWidget.min") !== -1;
        });

        // Depending on its presence decide if Mizar is used on prod or on dev
        var mizarBaseUrl;
        if (mizarSrc) {
            // Prod
            // Extract mizar's url
            mizarBaseUrl = mizarSrc.src.split('/').slice(0, -1).join('/') + '/';
        }
        else {
            // Dev
            // Basically use the relative path from index page
            mizarSrc = _.find(scripts, function (script) {
                return script.src.indexOf("MizarWidgetAPI") !== -1;
            });
            mizarBaseUrl = mizarSrc.src.split('/').slice(0, -1).join('/') + '/../';
        }
        return mizarBaseUrl;
    };

    var getUniqueId = function (prefix) {
        var d = new Date().getTime();
        d += (parseInt(Math.random() * 100)).toString();
        return d;
    };

    var getUrl = function(url){
        return $.ajax({
            type: "GET",
            url: url,
            cache: false,
            async: false
        }).responseText;
    };

    /**
     * Removes "C"-like comments lines from string
     * @param string
     * @returns {JSON}
     * @private
     */
    var _removeComments = function (string) {
        var starCommentRe = new RegExp("/\\\*(.|[\r\n])*?\\\*/", "g");
        var slashCommentRe = new RegExp("[^:]//.*[\r\n]", "g");
        string = string.replace(slashCommentRe, "");
        string = string.replace(starCommentRe, "");

        return string;
    };

    /**
     * Returns the parameters of href
     * @param href Url from which parameters lust be extracted
     * @returns parameters from href 
     */
    var getUrlVars = function(href){
        var reg = /[?&]+([^=&]+)=?([^&]*)/gi;
        var map = {};
        href.replace(reg, function(match, key, value) {
            key = decodeURIComponent(key);
            value = value ? decodeURIComponent(value) : true;
            map[key] ? map[key] instanceof Array ? map[key].push(value) : map[key] = [map[key], value] :  map[key] = value;
        });
        return map;
    };

    /**
     * Builds a deynamic url to avail the brwser cache the URL.
     * The URL is build with a uuid parameter
     * @param {url} url 
     * @param {string} uuid 
     */
    var buildUrlNoCacheUrl = function(url, uuid) {
        var delimiter = (url.indexOf("?")>=0) ? "&" : "?";
        return url+delimiter+"uuid="+uuid;
    }    

    /**
     * Returns the mizarWidgetConf related to MizarWidget.
     * Loads the local configuration file
     * (e.g http://127.0.0.1:8080/index.html?ctxurl=http%3A%2F%2F127.0.0.1%3A8080%2Fconf%2FmizarWidget.json)
     * in the URL (using ctxurl parameter)
     * @example
     * {
     * "global": {
     *     "proxyUrl": "http://localhost:8080/?url=",
     *     "proxyUse": false
     * },
     * "gui": {
     *     ...
     * },
     * "ctx": [
     * {
     *      "name": "sky", // context name
     *      "mode": "Sky", 
     *      "context": "./skyCtx.json"
     * },
     * {
     *      "name": "mars",
     *      "mode": "Planet",
     *      "context": "./marsCtx.json"
     * },
     * ...
     * ],
     * "defaultCtx": "sky"
     * }
     * @returns the configuration file of MizarWidget
     */
    var getMizarWidgetConf = function() {
        var uuid = getUniqueId();                           
        var mizarUrl = getMizarUrl();
        var url = buildUrlNoCacheUrl(mizarUrl+"/conf/mizarWidget.json", uuid);
        // retrieve the configuration file
        var mizarWidgetConf = getUrl(url);
        return JSON.parse(_removeComments(mizarWidgetConf));        
    }

    /**
     * Add a new context as default in the configuration file of MizarWidget.
     * The context is defined by the value related to ctxurl in the URL
     * @param {Object} mizarWidgetConf 
     */
    var addNewCtxAsDefault = function(mizarWidgetConf) {
        var href = window.location.search;
        var parameters = getUrlVars(href);
        var distantConfFileUrl = parameters.ctxurl;
        if (distantConfFileUrl === undefined) {
            // no context to add.
        } else {
            mizarWidgetConf.ctx.push({
                "name":"userDefined",
                "mode":"something",
                "context":distantConfFileUrl
            });
            mizarWidgetConf.defaultCtx = "userDefined";
        }
        return mizarWidgetConf;
    }

    var widgetOptions = getMizarWidgetConf();  
    widgetOptions = addNewCtxAsDefault(widgetOptions);

    var mizarWidget = new MizarWidget('mizarWidget-div', widgetOptions);
    var mizarWidgetAPI = mizarWidget.getMizarWidgetAPI();
    mizarWidgetAPI.init();

});
