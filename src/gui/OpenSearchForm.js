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
/*global define: false */

/**
 * FeaturePopup module
 */
define(["jquery", "underscore", "text!templates/openSearchParamList.html"],
    function ($, _, openSearchParamList) {

        var mizarWidgetAPI;
        var configuration;
        var $leftDiv;
        var $rightDiv;
        var isMobile;

        // Template generating the list of parameters
        var openSearchParamListTemplate = _.template(openSearchParamList);

        /**********************************************************************************************/

        /**
         *    Selected feature div position calculations
         *
         *    @param clientX event.clientX
         *    @param clientY event.clientY
         */
        function computeDivPosition(clientX, clientY) {

            var mousex = clientX; //Get X coodrinates
            var mousey = clientY; //Get Y coordinates

            mousex += 20;
            mousey -= 100;

            // Positionning
            $('#selectedFeatureDiv').css({
                position: 'absolute',
                left: mousex + 'px',
                top: mousey + 'px'
            });
        }

        /**********************************************************************************************/

        /**
         *    Compute optimal height of current viewport
         */
        function computeHeight() {
            return 2 * $('#' + mizarWidgetAPI.getRenderContext().canvas.id).height() / 5;
        }

        /**********************************************************************************************/

        /**
         *    Appropriate layout of properties depending on displayProperties
         *
         *    @param properties Feature properties to modify
         *    @param {String[]} displayProperties Array containing properties which must be displayed at first
         *
         *    @return Properties matching displayProperties
         */
        function buildProperties(properties, displayProperties) {
            if (displayProperties) {
                var handledProperties = {};

                handledProperties.identifier = properties.identifier;
                handledProperties.title = properties.title ? properties.title : "";
                handledProperties.style = properties.style;

                // Fill handledProperties in order
                var key;
                for (var j = 0; j < displayProperties.length; j++) {
                    key = displayProperties[j];
                    if (properties[key]) {
                        handledProperties[key] = properties[key];
                    }
                }

                handledProperties.others = {};
                // Handle the rest into sub-section "others"
                for (key in properties) {
                    if (!handledProperties[key]) {
                        handledProperties.others[key] = properties[key];
                    }
                }

                return handledProperties;
            }
            else {
                return properties;
            }
        }

        /**********************************************************************************************/

        /**
         *    Add property description to the dictionary
         *
         *    @param describeUrl Open Search describe document url
         *    @param property Property
         *    @param dictionary Dictionary to complete
         */
        function addPropertyDescription(describeUrl, property, dictionary) {
            $.ajax({
                type: "GET",
                url: describeUrl + property,
                dataType: 'text',
                success: function (response) {
                    dictionary[property] = response;
                    $('#' + property).attr("title", response);
                },
                error: function (xhr) {
                    console.error(xhr);
                }
            });
        }

        /**********************************************************************************************/

        /**
         *    Create dictionary
         *
         *    @param {Layer} layer
         *    @param properties Feature properties
         */
        function createDictionary(layer, properties) {
            layer.dictionary = {};
            // Get dictionary template from open search description document
            $.ajax({
                type: "GET",
                url: layer.serviceUrl,
                dataType: "xml",
                success: function (xml) {
                    var dicodesc = $(xml).find('Url[rel="dicodesc"]');
                    var describeUrl = $(dicodesc).attr("template");

                    if (describeUrl) {
                        // Cut unused part
                        var splitIndex = describeUrl.indexOf("{");
                        if (splitIndex !== -1) {
                            describeUrl = describeUrl.substring(0, splitIndex);
                        }
                        for (var key in properties) {
                            addPropertyDescription(describeUrl, key, layer.dictionary);
                        }
                    }
                    //else
                    //{
                    // No dico found
                    //}
                },
                error: function (xhr) {
                    // No dico found
                    //console.error(xhr);
                }
            });
        }

        /**********************************************************************************************/

        /**
         *    Hide popup
         *
         *    @param callback Callback
         */
        function hide(callback) {
            if ($selectedFeatureDiv.css('display') !== 'none') {
                $selectedFeatureDiv.find('.featureProperties').getNiceScroll().hide();

                $selectedFeatureDiv.fadeOut(300, function () {
                    $selectedFeatureDiv.find('.featureProperties').getNiceScroll().remove();

                    if (callback) {
                        callback();
                    }
                });
            }
            else if (callback) {
                callback();
            }
        }

        /**********************************************************************************************/

        /**
         *    Show popup
         *
         *    @param x X in window coordinate system
         *    @param y Y in window coordinate system
         *    @param callback Callback
         */
        function show(x, y, callback) {
            computeDivPosition(x, y);
            $selectedFeatureDiv.fadeIn(500, function () {
                $selectedFeatureDiv.find('.featureProperties').getNiceScroll().resize();
                if (callback) {
                    callback();
                }
            });
            var maxHeight = computeHeight();
            var popupMaxHeight = maxHeight - 60;
            $('#featureListDiv').css('max-height', popupMaxHeight);
            if ($leftDiv.find('#featureList').height() > popupMaxHeight) {
                $leftDiv.find('.scroll-arrow-up, .scroll-arrow-down').css('display', 'block');
            }
        }

        /**********************************************************************************************/

        /**********************************************************************************************/

        return {
            init: function (m, selectFeatDiv, pm, im, conf) {
                mizarWidgetAPI = m;
                pickingManager = pm;
                imageManager = im;
                configuration = conf;
                isMobile = conf.isMobile;

                $selectedFeatureDiv = selectFeatDiv;
                $leftDiv = $('#leftDiv');
                $rightDiv = $('#rightDiv');
            },
            createFeatureList: createFeatureList,
            createDictionary: createDictionary,
            computeDivPosition: computeDivPosition,
            computeHeight: computeHeight,
            buildProperties: buildProperties,
            showOrHideQuicklook: showOrHideQuicklook,
            showOrHideQuicklookWms: showOrHideQuicklookWms,
            showOrHideQuicklookFits: showOrHideQuicklookFits,
            sendImageBySamp: sendImageBySamp,
            showOrHideHEALPixService: showOrHideHEALPixService,
            showOrHideDynamicImageService: showOrHideDynamicImageService,
            showFeatureInformation: showFeatureInformation,
            selectFeatureOnTitle: selectFeatureOnTitle,
            hide: hide,
            show: show
        }
    });
