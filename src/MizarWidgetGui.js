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
 * MizarWidgetGui contains the GUI of MizarWidget.
 *
 * The GUI of Mizar widget provides the following elements:
 * <ul>
 *     <li>a graphical element to handle the different layer : on/off, opacity</li>
 *     <li>a graphical element to select a background layer</li>
 *     <li>a graphical element to resolve an object name to coordinates</li>
 *     <li>a graphical element to find an object name based on its coordinates</li>
 *     <li>a manager to handle graphical events related to the user picking</li>
 *     <li>a graphical element to display the metadata to the user</li>
 *     <li>a graphical iframe to display external link to the user</li>
 *     <li>a graphical element to display the footprint of the camera in the whole sky</li>
 *     <li>a graphical element to handle features on a displayed image (quicklook, wms or Fits data)</li>
 *     <li>a graphical element to handle specific layer</li>
 *     <li>a graphical element to measure the angular distance between two points</li>
 *     <li>a graphical element to measure the distance and compute the elevation profile between two points
 *     on a planet</li>
 *     <li>a graphical element to switch 2D/3D</li>
 *     <li>a graphical element to order data based on a selected area</li>
 *     <li>a graphical element to display credits of the tool to the user</li>
 *     <li>a graphical element to display error to the user</li>
 *     <li>two services : a sharing service and <a href="http://www.ivoa.net/documents/SAMP/">SAMP</a></li>
 * </ul>
 *
 */
//TODO Faire MollweideViewer pour la Terre
//TODO faire switch 2D/3D pour le ciel
define(["jquery", "underscore-min",

        // Gui
        "./gui/LayerManagerView", "./gui/BackgroundLayersView",
        "./gui/NameResolverView", "./gui/ReverseNameResolverView",
        "./gui/PickingManager", "./gui/FeaturePopup",
        "./gui/IFrame",
        "./gui/MollweideViewer", "./gui/ImageViewer",
        "./gui/AdditionalLayersView", "./gui/ImageManager",
        "./gui/MeasureToolSky", "./gui/MeasureToolPlanet", "./gui/DistanceNavigationView",
        "./gui/SwitchTo2D", "./gui/ExportTool",
        "gui/dialog/AboutDialog",
        "gui/dialog/ErrorDialog",

        // services
        "service/Share", "service/Samp",

        //Utility class
        "./utils/UtilsCore",

        // Externals
        "jquery.ui", "flot",
        "flot.tooltip", "flot.axislabels"],
    function ($, _,
              LayerManagerView, BackgroundLayersView,
              NameResolverView, ReverseNameResolverView,
              PickingManager, FeaturePopup,
              IFrame,
              MollweideViewer, ImageViewer,
              AdditionalLayersView, ImageManager,
              MeasureToolSky, MeasureToolPlanet,DistanceNavigationView,
              SwitchTo2D, ExportTool,
              AboutDialog, ErrorDialog,
              Share, Samp, UtilsCore) {

        /**
         *    Private variables
         */
        var options;
        var mizarDiv;
        var mizarWidgetAPI;

        /**************************************************************************************************************/

        /**
         * Mizar Widget GUI constructor.
         * @param div
         * @param globalOptions
         * @constructor
         * @listen addFitsEvent#layer:fitsSupported
         */
        //TODO décrire div et global options
        var MizarWidgetGui = function (div, globalOptions) {
            if (!globalOptions.options.gui) {
                return;
            }
            mizarDiv = div;
            this.mode = _.find(globalOptions.options.ctx, function(obj) { return obj.name === globalOptions.options.defaultCtx });

            options = globalOptions.options;

            mizarWidgetAPI = globalOptions.mizarWidgetAPI;

            this.isMobile = globalOptions.options.gui.isMobile;

            this.activatedContext = mizarWidgetAPI.getContext();

            var self = this;

            mizarWidgetAPI.subscribeCtx('layer:fitsSupported', function (layerDesc) {
                self.addFitsEvent(layerDesc);
            });

            // Create data manager
            PickingManager.init(mizarWidgetAPI, globalOptions);

            // Share configuration module init
            Share.init({
                mizar: mizarWidgetAPI,
                configuration: globalOptions.options
            });

            // Initialize SAMP component
            // TODO : Bear in mind that a website may already implement specific SAMP logics, so check that
            // current samp component doesn't break existing SAMP functionality
            Samp.init(mizarWidgetAPI, mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.Samp), globalOptions.options);            

            this.addMouseEvents();

        };

        /**************************************************************************************************************/

        /**
         * Registers all mouse events.
         */
        MizarWidgetGui.prototype.addMouseEvents = function () {
            var body = $( "body" );
            // Fade hover styled image effect
            body.on("mouseenter", "span.defaultImg", function () {
                //stuff to do on mouseover
                $(this).stop().animate({"opacity": "0"}, 100);
                $(this).siblings('.hoverImg').stop().animate({"opacity": "1"}, 100);
            });
            body.on("mouseleave", "span.defaultImg", function () {
                //stuff to do on mouseleave
                $(this).stop().animate({"opacity": "1"}, 100);
                $(this).siblings('.hoverImg').stop().animate({"opacity": "0"}, 100);
            });

            // Close button event
            body.on("click", '.closeBtn', function () {
                switch ($(this).parent().attr("id")) {
                    case "externalIFrame":
                        IFrame.hide();
                        break;
                    case "selectedFeatureDiv":
                        FeaturePopup.hide();
                        break;
                    default:
                        $(this).parent().fadeOut(300);
                }
            });
        };

        /**
         * Adds Fits event to layer if supported
         * @param layerDesc
         */
        //TODO décrire layerDesc
        MizarWidgetGui.prototype.addFitsEvent = function (layerDesc) {

            // Add onready event if FITS supported by layer
            if (layerDesc.fitsSupported) {
                // TODO : Move it..
                layerDesc.onready = function (fitsLayer) {
                    if (fitsLayer.format === "fits" && fitsLayer.levelZeroImage) {
                        if (fitsLayer.div) {
                            // Additional layer
                            // Using name as identifier, because we must know it before attachment to planet
                            // .. but identfier is assigned after layer creation.
                            var shortName = UtilsCore.formatId(fitsLayer.name);
                            $('#addFitsView_' + shortName).button("enable");
                            fitsLayer.div.setImage(fitsLayer.levelZeroImage);
                        }
                        else {
                            // Background fits layer
                            $('#fitsView').button("enable");
                            var backgroundDiv = BackgroundLayersView.getDiv();
                            backgroundDiv.setImage(fitsLayer.levelZeroImage);
                        }
                    }
                };
            }
        };

        /**
         * Adds/removes the angular distance GUI.
         * @param visible
         */
        //TODO décrire visible
        MizarWidgetGui.prototype.setAngleDistanceSkyGui = function (visible) {
            if (visible && !this.measureToolSky) {
                // Distance measure tool lazy initialization
                this.measureToolSky = new MeasureToolSky({
                    mizar: mizarWidgetAPI,
                    isMobile: this.isMobile,
                    mode: mizarWidgetAPI.CONTEXT.Sky
                });
            }

            this.activatedContext.setComponentVisibility("measureSkyContainer", visible);
        };

        /**
         * Adds/removes the distance GUI on the planet
         * @param visible
         */
        //TODO décrire visible
        MizarWidgetGui.prototype.setAngleDistancePlanetGui = function (visible) {
            if (visible) {
                if (!this.measureToolPlanet) {
                    // Distance measure tool lazy initialization
                    this.measureToolPlanet = new MeasureToolPlanet({
                        mizar: mizarWidgetAPI,
                        isMobile: this.isMobile,
                        mode: mizarWidgetAPI.CONTEXT.Planet
                    });
                } else {
                    this.measureToolPlanet.updateContext(mizarWidgetAPI);
                }
            }
            this.activatedContext.setComponentVisibility("measurePlanetContainer", visible);
        };

        /**************************************************************************************************************/

        /**
         * Adds/removes the mode 2D/3D
         * @param visible
         */
        //TODO décrire visible
        //TODO vérifier que c'est bien utiliser et checker l'icone
        MizarWidgetGui.prototype.setSwitchTo2D = function (visible) {
            if (visible && !this.switchTo2D) {
                this.switchTo2D = new SwitchTo2D({mizar: mizarWidgetAPI});
            }
            this.activatedContext.setComponentVisibility("switch2DContainer", visible);
        };

        /**
         * Adds/remove SAMP GUI utility.
         * @param visible
         */
        //TODO décrire visible
        MizarWidgetGui.prototype.setSampGui = function (visible) {
            this.activatedContext.setComponentVisibility("sampContainer", visible);            
        };

        /**
         * Adds/remove the sharing application/
         * @param visible
         */
        //TODO décrire visible
        MizarWidgetGui.prototype.setShortenerUrlGui = function (visible) {
            this.activatedContext.setComponentVisibility("shareContainer", visible);
        };

        /**************************************************************************************************************/

        /**
         * Adds/removes the full sky overview map.
         * @param visible
         */
        //TODO décrire visible
        //TODO détruire le composant ?
        MizarWidgetGui.prototype.setMollweideMapGui = function (visible) {
            if (visible && !this.mollweideViewer) {
                // Mollweide viewer lazy initialization
                this.mollweideViewer = new MollweideViewer({
                    mizar: mizarWidgetAPI,
                    mizarBaseUrl: options.global.mizarBaseUrl
                });
            }
            this.activatedContext.setComponentVisibility("2dMapContainer", visible);
        };

        /**
         * Adds/removes reverse name resolver GUI.
         * @param visible
         */
        //TODO décrire visible
        MizarWidgetGui.prototype.setReverseNameResolverGui = function (visible) {
            if (visible) {
                if (!ReverseNameResolverView.isInitialized())
                    ReverseNameResolverView.init(mizarWidgetAPI);
            }
        };

        MizarWidgetGui.prototype.setDistanceGui = function (visible) {
            if (visible) {
                if (DistanceNavigationView.isInitialized())
                    DistanceNavigationView.update(mizarWidgetAPI);
                else
                    DistanceNavigationView.init(mizarWidgetAPI, "distTracker");
            } else {
                DistanceNavigationView.unregisterEvents();
            }
            this.activatedContext.setComponentVisibility("distanceDiv", visible);
        };

        /**
         * Adds/removes name resolver GUI.
         * @param visible
         */
        //TODO décrire visible
        MizarWidgetGui.prototype.setNameResolverGui = function (visible) {
            if (visible) {
                if(!NameResolverView.isInitialized())
                    NameResolverView.init(mizarWidgetAPI);
            }
            this.activatedContext.setComponentVisibility("searchDiv", visible);
        };

        /**
         * Adds/removes layer manager view.
         * @param visible
         */
        //TODO décrire visibles
        MizarWidgetGui.prototype.setCategoryGui = function (visible) {
            if (visible) {
                if(!LayerManagerView.isInitialized())
                    LayerManagerView.init(mizarWidgetAPI, $.extend({element: $(mizarDiv).find("#categoryDiv")}, options));
            } //else {
              //  LayerManagerView.remove();
            //}
            this.activatedContext.setComponentVisibility("categoryDiv", visible);
        };

        /**
         * Adds/removes image viewer GUI
         * @param visible
         */
        //TODO décrire visible
        MizarWidgetGui.prototype.setImageViewerGui = function (visible) {
            if (!options.isMobile) {
                if (visible) {
                    if(!ImageViewer.isInitialized())
                        ImageViewer.init(mizarWidgetAPI);
                } //else {
                  //  ImageViewer.remove();
                //}
                this.activatedContext.setComponentVisibility("imageViewerDiv", visible);
            }
        };

        /**
         * Adds/removes Export GUI.
         * @param visible
         */
        //TODO décrire visible
        MizarWidgetGui.prototype.setExportGui = function (visible) {
            if (visible) {
                if (!this.exportTool) {
                    this.exportTool = new ExportTool({
                        mizar: mizarWidgetAPI
                    });
                }
            }
            this.activatedContext.setComponentVisibility("exportContainer", visible);
        };

        /**
         * Returns the MizarGlobal object.
         * MizarGlobal is a wrapper between the GUI and the Mizar's cartographic API.
         * @return {MizarGlobal}
         */
        MizarWidgetGui.prototype.getMizarWidgetAPI = function () {
            return mizarWidgetAPI;
        };

        MizarWidgetGui.prototype.setUpdatedActivatedContext = function(ctx) {
            this.activatedContext = ctx;
        };

        return MizarWidgetGui;
    });
