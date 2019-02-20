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
 * Layer manager view module
 */
define(["jquery", "underscore-min", "../utils/UtilsCore",
        "./dialog/ErrorDialog", "./LayerServiceView", "./BackgroundLayersView", "./AdditionalLayersView", "./ImageProcessing", "jquery.ui"],
    function ($, _, UtilsCore,
              ErrorDialog, LayerServiceView, BackgroundLayersView, AdditionalLayersView, ImageProcessing) {

        /**
         * Private variables
         */
        var mizarWidgetAPI;
        var configuration;

        // GeoJSON data providers
        var votable2geojsonBaseUrl;
        var parentElement;
        var $el;




        /**
         * Private functions
         */

        /**************************************************************************************************************/

        /**
         *    Drop event
         */
        function handleDrop(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            $.event.props.push('dataTransfer');

            var files = evt.dataTransfer.files; // FileList object.

            // Files is a FileList of File objects.
            loadLayersFromFITSFile(files);
        }

        function loadLayersFromFITSFile(files) {
            $.each(files, function (index, f) {

                var name = f.name;
                var reader = new FileReader();
                $('#loading').show();

                if (f.type === "image/fits") {
                    // Handle fits image
                    reader.onloadend = function (e) {
                        var arrayBuffer = this.result;
                        var fits = mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.FitsVisu).parseFits(arrayBuffer);

                        var gwLayer = mizarWidgetAPI.createLayerFromFits(name, fits);

                        // Add fits texture
                        var featureData = {
                            layer: gwLayer,
                            feature: gwLayer.features[0],
                            isFits: true
                        };
                        var fitsData = fits.getHDU().data;
                        mizarWidgetAPI.publish("image:added", featureData);

                        var image = mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.FitsVisu).handleFits(fitsData, featureData);
                        ImageProcessing.setImage(image);

                        $('#loading').hide();
                    };
                    reader.readAsArrayBuffer(f);
                }
                else {
                    reader.onloadend = function (e) {
                        if (this.result.search('<?xml') > 0) {
                            // Handle xml votable
                            UtilsCore.convertVotable2JsonFromXML(this.result, function (response) {
                                var gwLayer = mizarWidgetAPI.addLayerByDragNDrop(name, response);
                                $('#loading').hide();
                            });
                        }
                        else {
                            // Handle as json if possible
                            var response;
                            //try {
                                response = $.parseJSON(this.result);
                                mizarWidgetAPI.addLayerByDragNDrop(name, response);
                                $('#loading').hide();
                            /*} catch (e) {
                                var message = (e.type) ? e.type : e;
                                ErrorDialog.open("JSON parsing error : " + message + "<br/> For more details see http://jsonlint.com/.");
                                $('#loading').hide();
                                return false;
                            }*/
                        }
                    };
                    reader.readAsText(f);
                }
            });
        }

        /**************************************************************************************************************/

        /**
         *    Drag over event
         */
        function handleDragOver(evt) {
            evt.stopPropagation();
            evt.preventDefault();
        }

        /**
         *    Drag enter event
         */
        function handleDragEnter(evt) {
            evt.stopPropagation();
            evt.preventDefault();
        }        

        /**************************************************************************************************************/

        /**
         *    Initialize view with layers stored in <LayerManager>
         */
        function initLayers(context) {
            mizarWidgetAPI.getMizarWidgetGui().setUpdatedActivatedContext(context);
            var sum=0;
            var layers = context.getLayers();

            // Add view depending on category of each layer
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                if (layer.isBackground()) {
                    BackgroundLayersView.addView(layer);
                } else {
                    AdditionalLayersView.addView(layer);
                }
            }
            //var backLayerSelect = $el.find('#backgroundLayersSelect');
            //if(backLayerSelect != null) {
            //    backLayerSelect.iconselectmenu("refresh");
            //}
        }

        return {

            /**
             *    Init
             *
             *    @param m
             *        Mizar API object
             *    @param conf
             *        Mizar configuration
             */
            init: function (widget, conf) {
                mizarWidgetAPI = widget;
                configuration = conf;
                parentElement = configuration.element;
                // Add invoker
                $('<input type="button" id="lmInvoker" />').appendTo(parentElement);
                $el = $('<div id="accordion" style="display: none;"></div>').appendTo(parentElement);
                configuration.element = $el;

                BackgroundLayersView.init({mizar: mizarWidgetAPI, configuration: configuration});
                AdditionalLayersView.init({mizar: mizarWidgetAPI, configuration: configuration});

                mizarWidgetAPI.subscribeCtx(mizarWidgetAPI.EVENT_MSG.LAYER_BACKGROUND_ADDED, BackgroundLayersView.addView);
                mizarWidgetAPI.subscribeCtx(mizarWidgetAPI.EVENT_MSG.LAYER_ADDED, AdditionalLayersView.addView);
                mizarWidgetAPI.subscribeMizar(mizarWidgetAPI.EVENT_MSG.MIZAR_MODE_TOGGLE, this.toggleMode);

                mizarWidgetAPI.subscribeCtx(mizarWidgetAPI.EVENT_MSG.LAYER_UPDATE_STATS_ATTRIBUTES, this.updateStatsAttributes);
                mizarWidgetAPI.subscribeCtx(mizarWidgetAPI.EVENT_MSG.LAYER_TOGGLE_WMS, this.toggleWMS);
                                    
                

                // Necessary to drag&drop option while using jQuery
                $.event.props.push('dataTransfer');

                // Due to scroll initialization which corrumps accordion UI init in additional layers view,
                // accordion UI must be initialized before
                $el.accordion({
                    header: "> div > h3",
                    autoHeight: false,
                    active: 0,
                    collapsible: true,
                    heightStyle: "content"
                }).show().accordion("refresh");

                LayerServiceView.init(mizarWidgetAPI, configuration);

                // Setup the drag & drop listeners.
                $('canvas').on('dragover', handleDragOver);
                $('canvas').on('dragenter', handleDragEnter);
                $('canvas').on('drop', handleDrop);

                // Layer manager invoker onclick animations
                $('#lmInvoker').click(function () {
                    if (parseFloat($(this).siblings('#accordion').css('left')) < 0) {
                        // Show layer manager
                        $(this).animate({left: '-10px'}, 300).addClass('selected');
                        $(this).siblings('#accordion').animate({left: '15px'}, 300);
                    }
                    else {
                        // Hide layer manager
                        $(this).animate({left: '0px'}, 300).removeClass('selected');
                        $(this).siblings('#accordion').animate({left: '-255px'}, 300);
                    }
                });

                if (!configuration.isMobile) {
                    $('#lmInvoker').trigger("click");
                }

                if (configuration.votable2geojson) {
                    votable2geojsonBaseUrl = configuration.votable2geojson.baseUrl;
                }
            },
            updateStatsAttributes: function(options) {                
                // if (typeof options.nb_loaded !== "undefined") {
                //     $(".labelLoaded_"+options.shortName)[0].innerText = "loaded : "+ options.nb_loaded;
                // }
                // if (typeof options.nb_total !== "undefined") {
                //     $(".labelTotal_"+options.shortName)[0].innerText = "total : ~ "+ options.nb_total;
                // }
                if (typeof options.page !== "undefined") {
                    $(".labelPage_"+options.shortName)[0].innerText = "Page "+options.page;
                }
            },
            toggleWMS: function(options) {
                if ( (typeof options.layer_name !== "undefined") && (typeof options.visible !== "undefined") ) {
                    $(".QLWMS_"+options.layer_name)[0].style = (options.visible === true) ? "display:inline" : "display:none";
                }
            },
            refresh: function() {
                $el.find('#backgroundLayersSelect').iconselectmenu("refresh");
            },
            /**
             *    Unregister all event handlers and remove view
             */
            remove: function () {
                AdditionalLayersView.remove();
                BackgroundLayersView.remove();
                LayerServiceView.remove();
                $(parentElement).empty();

                mizarWidgetAPI.unsubscribeCtx(mizarWidgetAPI.EVENT_MSG.LAYER_BACKGROUND_ADDED, BackgroundLayersView.addView);
                mizarWidgetAPI.unsubscribeCtx(mizarWidgetAPI.EVENT_MSG.LAYER_ADDED, AdditionalLayersView.addView);
                mizarWidgetAPI.unsubscribeMizar(mizarWidgetAPI.EVENT_MSG.MIZAR_MODE_TOGGLE, this.toggleMode);

                $('canvas').off('dragover', handleDragOver);
                $('canvas').off('dragenter', handleDragEnter);
                $('canvas').off('drop', handleDrop);
            },

            /**
             *    Update view depending on mizar mode
             *
             *    @param context
             */
            toggleMode: function (context) {
                BackgroundLayersView.remove();
                AdditionalLayersView.remove();
                BackgroundLayersView.init({mizar: mizarWidgetAPI, configuration: configuration});
                AdditionalLayersView.init({mizar: mizarWidgetAPI, configuration: configuration});
                initLayers(context);
                mizarWidgetAPI.subscribeCtx(mizarWidgetAPI.EVENT_MSG.LAYER_BACKGROUND_ADDED, BackgroundLayersView.addView);
                mizarWidgetAPI.subscribeCtx(mizarWidgetAPI.EVENT_MSG.LAYER_ADDED, AdditionalLayersView.addView);
                $el.accordion("option", "active", 0).accordion("refresh");
            },

            /**
             *    Returns the state of view
             */
            isInitialized: function () {
                return mizarWidgetAPI ? true : false;
            }
        };

    });
