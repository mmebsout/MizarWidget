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
define(["jquery", "underscore-min", "text!templates/featureList.html", "text!templates/featureDescription.html", "text!templates/descriptionTable.html", "text!templates/datacube.html"],
    function ($, _, featureListHTMLTemplate, featureDescriptionHTMLTemplate, descriptionTableHTMLTemplate, dataCubeHTMLTemplate) {

        var mizarWidgetAPI;
        var featureListHTML = '';
        var pickingManager = null;
        var imageManager = null;
        var configuration;
        var $selectedFeatureDiv;
        var $selectedDatacubeDiv;
        var $leftDiv;
        var $rightDiv;
        var isMobile;

        // Template generating the list of selected features
        var featureListTemplate = _.template(featureListHTMLTemplate);

        // Template generating the detailed description of choosen feature
        var featureDescriptionTemplate = _.template(featureDescriptionHTMLTemplate);

        // Template generating the table of properties of choosen feature
        var descriptionTableTemplate = _.template(descriptionTableHTMLTemplate);

        // Template generating the table of DataCube
        var dataCubeTemplate = _.template(dataCubeHTMLTemplate);

        /**********************************************************************************************/

        /**
         *    Insert HTML code of DataCube
         */
        function createHTMLDataCubeDiv(datacube) {
            var output = dataCubeTemplate({
                dataCubeTemplate: dataCubeTemplate,
                propertiesDataCube : datacube
            });         

            $selectedDatacubeDiv.html(output);
        }

        /**********************************************************************************************/

        /**
         *    Insert HTML code of choosen feature
         */
        function createHTMLSelectedFeatureDiv(layer, feature) {
            if (!layer.hasOwnProperty('dictionary')) {
                createDictionary(layer, feature.properties);
            }
            var output = featureDescriptionTemplate({
                dictionary: layer.dictionary,
                services: feature.properties.services,
                properties: buildProperties(feature.properties, layer.displayProperties),
                descriptionTableTemplate: descriptionTableTemplate,
                hasServiceRunning : layer.hasServicesRunningOnRecord(feature.id),
                mizarWidgetAPI : mizarWidgetAPI,
                isMobile: isMobile,
                dataCube : feature.properties.services.datacube
            });


            $rightDiv.html(output);

            // Stay in canvas
            $rightDiv.find('.featureProperties').css('max-height', computeHeight());

            $selectedFeatureDiv.find('.featureProperties').niceScroll({
                autohidemode: false
            }).hide();
        }

        /**********************************************************************************************/

        /**
         *    Insert HTML code of selected features
         *
         *    @param {<GlobWeb.Feature>[]} selection Array of features
         */
        function createFeatureList(selection) {
            featureListHTML = featureListTemplate({selection: selection});
            $leftDiv.html(featureListHTML);

            if (selection[0].layer.name === "Planets" && selection[0].feature.properties.name === "Mars") {
                var button = $('#goToMarsBtn');

                button.button().once().click(function () {
                    mizarWidgetAPI.createMarsContext();
                    $('#selectedFeatureDiv').hide();
                });
            } else if (selection[0].layer.name === "Landing sites" && selection[0].feature.properties.name === "MSL Curiosity") {
                var button = $('#goToCuriosityBtn');

                button.button().once().click(function () {
                    mizarWidgetAPI.createCuriosityContext();
                    $('#selectedFeatureDiv').hide();
                });
            } else if (selection[0].layer.name === "Planets" && selection[0].feature.properties.name === "Sun") {
                var button = $('#goToSunBtn');

                button.button().once().click(function () {
                    mizarWidgetAPI.createSunContext();
                    $('#selectedFeatureDiv').hide();
                });
            }
        }
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

            var widthScreen = window.screen.availWidth-150 + 'px';
            var heightScreen = window.screen.availHeight-20 + 'px'
            $('#selectedDatacubeDiv').css({
                position: 'absolute',
                left: 20 + 'px',
                top: 40 + 'px',
                width: 1500 + 'px',
                height: heightScreen + 'px'
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
            var cleanedProperties = {};
            for (key in properties) {
                if(properties[key] == null || key === "services" || key === "links" || key === "storage") {
                    // do not display it
                } else {
                    cleanedProperties[key] = properties[key];
                }
            }
            if (displayProperties) {
                var handledProperties = {};
                handledProperties.title = cleanedProperties.title ? cleanedProperties.title : "";
                handledProperties.style = cleanedProperties.style;

                // Fill handledProperties in order
                var key;
                for (var j = 0; j < displayProperties.length; j++) {
                    key = displayProperties[j];
                    if (cleanedProperties[key]) {
                        handledProperties[key] = cleanedProperties[key];
                    }
                }

                handledProperties.others = {};
                // Handle the rest into sub-section "others"
                for (key in properties) {
                    if (!handledProperties[key]) {
                        handledProperties.others[key] = cleanedProperties[key];
                    }
                }

                return handledProperties;
            }
            else {
                return cleanedProperties;
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
         * Show or Hide DataCube
         */
        function showOrHideDataCube() {
            var selectedData = pickingManager.getSelectedData();
            //console.log(selectedData.feature.properties.services.datacube);
            createHTMLDataCubeDiv(selectedData.feature.properties.services.datacube);
            $(this).fadeIn(300, function () {
                $selectedDatacubeDiv.show();
            });          
        }


        /**********************************************************************************************/

        /**
         * Show or Hide a quicklook
         */
        function showOrHideQuicklook() {
            var selectedData = pickingManager.getSelectedData();

            var otherQuicklookOn = false;
            
            if (selectedData.layer.type === "OpenSearch") {
                // Special case OpenSearch
                otherQuicklookOn = selectedData.layer.isQuicklookDisplayed();
                selectedData.isFits = false;
                selectedData.isWms = false;
                if (otherQuicklookOn === true) {
                    imageManager.removeImage(selectedData);
                    // Check if feature id is different
                    if (selectedData.layer.currentIdDisplayed !== selectedData.feature.id) {
                        imageManager.addImage(selectedData);
                    }
                } else {
                    imageManager.addImage(selectedData);
                }
            } else {
                otherQuicklookOn = selectedData.feature.properties.style.fill && !selectedData.feature.properties.style.fillTextureUrl;

                if (otherQuicklookOn === true) {
                    // Remove fits quicklook
                    imageManager.removeImage(selectedData);
                }

                selectedData.isFits = false;
                selectedData.isWms = false;
                if (selectedData.feature.properties.style.fill === true) {
                    imageManager.removeImage(selectedData);
                } else {
                    imageManager.addImage(selectedData);
                }
            }
        }

        function showOrHideQuicklookWms() {
            var selectedData = pickingManager.getSelectedData();
            
            var otherQuicklookOn = false;
            
            if (selectedData.layer.type === "OpenSearch") {
                if (selectedData.layer.hasServicesRunningOnRecord(selectedData.feature.id)) {
                    $('#quicklookWms').removeClass('selected');
                    selectedData.layer.unloadWMS(selectedData);
                } else {
                    $('#quicklookWms').addClass('selected');
                    selectedData.layer.loadWMS(selectedData);
                }
            } else {
                otherQuicklookOn = selectedData.feature.properties.style.fill && !selectedData.feature.properties.style.fillTextureUrl;

                if (otherQuicklookOn === true) {
                    // Remove fits quicklook
                    imageManager.removeImage(selectedData);
                }

                selectedData.isFits = false;
                selectedData.isWms = false;
                if (selectedData.feature.properties.style.fill === true) {
                    imageManager.removeImage(selectedData);
                } else {
                    imageManager.addImage(selectedData);
                }
            }
        }

        
        /**********************************************************************************************/

        /**
         * Show or Hide a quicklook fits
         */
        function showOrHideQuicklookFits() {
            var selectedData = pickingManager.getSelectedData();

            var otherQuicklookOn = selectedData.feature.properties.style.fill && selectedData.feature.properties.style.fillTextureUrl;
            if (otherQuicklookOn) {
                // Remove quicklook
                imageManager.removeImage(selectedData);
            }

            selectedData.isFits = true;
            if (selectedData.feature.properties.style.fill === true) {
                imageManager.removeImage(selectedData);
            }
            else {
                imageManager.addImage(selectedData);
            }
        }

        /**********************************************************************************************/

        /**
         * Send image by Samp
         */
        function sendImageBySamp() {
            var selectedData = pickingManager.getSelectedData();
            var message = mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.Samp).sendImage(selectedData.feature.services.download.url);
            $('#serviceStatus').html(message).slideDown().delay(1500).slideUp();
        }

        /**********************************************************************************************/

        /**
         * Show or Hide HEALPix Service
         * @param {Event} event
         */
        function showOrHideHEALPixService(event) {
            var selectedData = pickingManager.getSelectedData();
            var healpixLayer = selectedData.feature.services.healpix.layer;

            if ($('#healpix').is('.selected')) {
                $('#healpix').removeClass('selected');
                healpixLayer.setVisible(false);
            }
            else {
                $('#healpix').addClass('selected');
                healpixLayer.setVisible(true);
            }
        }
        

        /**********************************************************************************************/

        function showOrHideDynamicImageService() {
            $(this).toggleClass('selected');
            var selectedData = pickingManager.getSelectedData();
            mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.ImageProcessing).setData(selectedData);
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

        /**
         * Choose a feature by clicking on its title
         */
        function selectFeatureOnTitle() {
            pickingManager.blurSelectedFeature();
            $('#featureList div.selected').removeClass('selected');

            var featureIndexToFocus = $(this).index();
            pickingManager.focusFeatureByIndex(featureIndexToFocus, {isExclusive: true});
            var selectedData = pickingManager.getSelectedData();

            $('#featureList div:eq(' + featureIndexToFocus + ')').addClass('selected');
            if (selectedData) {
                showFeatureInformation(selectedData.layer, selectedData.feature);
            }

            mizarWidgetAPI.getRenderContext().requestFrame();

            // TODO highlight is not fully implemented
            // Samp.highlightFeature(selectedData.layer, selectedData.feature);
        }

        /**********************************************************************************************/

        /**
         * Show feature information
         * @param {Layer} layer
         * @param {Feature} feature
         */
        function showFeatureInformation(layer, feature) {
            $rightDiv.find('.featureProperties').getNiceScroll().hide();
            $rightDiv.fadeOut(300, function () {
                $rightDiv.find('.featureProperties').getNiceScroll().remove();
                createHTMLSelectedFeatureDiv(layer, feature);
                $(this).fadeIn(300, function () {
                    $selectedFeatureDiv.find('.featureProperties').getNiceScroll().resize();
                    $selectedFeatureDiv.find('.featureProperties').getNiceScroll().show();
                });
            });
        }

        /**********************************************************************************************/

        /**
         * Generate feature meta data for the given feature
         * @param {Layer} layer
         * @param {Feature} feature
         */
        function generateFeatureMetadata(layer, feature) {
            return featureDescriptionTemplate({
                dictionary: layer.hasOwnProperty('dictionary') ? layer.dictionary : createDictionary(layer, feature.properties),
                services: false,
                properties: buildProperties(feature.properties, layer.displayProperties),
                descriptionTableTemplate: descriptionTableTemplate
            });
        }

        /**********************************************************************************************/

        return {
            init: function (m, selectFeatDiv, pm, im, conf, selectDataCubeDiv) {
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
