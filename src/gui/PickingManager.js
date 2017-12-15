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
 * PickingManager module
 */
define(["jquery", "underscore-min",
        "./FeaturePopup", "./ImageManager", "./CutOutViewFactory"],
    function ($, _,
              FeaturePopup, ImageManager, CutOutViewFactory) {

        var mizarWidgetAPI;
        var currentContext;
        var self;
        var pickingManagerCore;

        var mouseXStart;
        var mouseYStart;
        var timeStart;

        var isMobile;

        /**
         * The maximum field of view that the camera can reach
         * @type {number} Field of view in degree.
         */
        const FOV_MAX = 25;

        /**
         * The maximum distance from the center of the planet that the camera can reach.
         * @type {number} distance in meters
         */
        const DISTANCE_MAX =  1800000;

        /**
         * Time of the animation in milliseconds.
         * @type {number} time in milliseconds
         */
        const DURATION_TIME = 3000;

        /**************************************************************************************************************/

        /**
         *    Event handler for mouse down
         */
        function _handleMouseDown(event) {
            if (isMobile && event.type.search("touch") >= 0) {
                event.layerX = event.changedTouches[0].clientX;
                event.layerY = event.changedTouches[0].clientY;
            }

            timeStart = new Date();
            mouseXStart = event.layerX;
            mouseYStart = event.layerY;
            pickingManagerCore.clearSelection();
        }

        /**************************************************************************************************************/

        /**
         * Event handler for mouse up
         */
        function _handleMouseUp(event) {
            var timeEnd = new Date();
            var epsilon = 5;
            var diff = timeEnd - timeStart;

            if (isMobile && event.type.search("touch") >= 0) {
                event.layerX = event.changedTouches[0].clientX;
                event.layerY = event.changedTouches[0].clientY;
            }

            // If not pan and not reverse name resolver call
            if (diff < 500 && Math.abs(mouseXStart - event.layerX) < epsilon && Math.abs(mouseYStart - event.layerY) < epsilon) {
                var pickPoint = mizarWidgetAPI.getContext().getLonLatFromPixel(event.layerX, event.layerY);

                // Remove selected style for previous selection
                pickingManagerCore.clearSelection();

                var newSelection = pickingManagerCore.computePickSelection(pickPoint);

                if (!_.isEmpty(newSelection) && newSelection.length > 0) {
                    var navigation = mizarWidgetAPI.getNavigation();
                    // Hide previous popup if any
                    FeaturePopup.hide(function () {
                        // View on center
                        if (navigation.inertia) {
                            navigation.inertia.stop();
                        }

                        var showPopup = function () {
                            var select = pickingManagerCore.setSelection(newSelection);

                            // Add selected style for new selection
                            pickingManagerCore.focusSelection(select);
                            FeaturePopup.createFeatureList(select);
                            if (select.length > 1) {
                                // Create dialogue for the first selection call
                                FeaturePopup.createHelp();
                                pickingManagerCore.stackSelectionIndex = -1;
                            }
                            else {
                                // only one layer, no pile needed, create feature dialogue
                                pickingManagerCore.focusFeatureByIndex(0, {isExclusive: true});
                                $('#featureList div:eq(0)').addClass('selected');
                                FeaturePopup.showFeatureInformation(select[pickingManagerCore.stackSelectionIndex].layer, select[pickingManagerCore.stackSelectionIndex].feature)
                            }
                            var offset = $(mizarWidgetAPI.getRenderContext().canvas).offset();
                            FeaturePopup.show(offset.left + mizarWidgetAPI.getRenderContext().canvas.width / 2, offset.top + mizarWidgetAPI.getRenderContext().canvas.height / 2);
                        };

                        if (navigation.getType() === mizarWidgetAPI.NAVIGATION.AstroNavigation) {
                            // Astro
                            //navigation.moveTo(pickPoint, 800, showPopup);
                            var currentFov = navigation.getFov()[1];
                            var targetFov = (currentFov > FOV_MAX) ? FOV_MAX : currentFov;
                            navigation.zoomTo(pickPoint, {fov: targetFov, duration: DURATION_TIME, callback: showPopup});
                        }
                        else {
                            var currentDistance = navigation.getDistance();
                            var targetDistance = (currentDistance < DISTANCE_MAX) ? currentDistance : DISTANCE_MAX;
                            navigation.zoomTo(pickPoint, {distance: targetDistance, duration: DURATION_TIME, callback: showPopup});
                        }
                    });
                } else {
                    FeaturePopup.hide();
                }
                mizarWidgetAPI.refresh();
            }
        }

        /**************************************************************************************************************/

        /**
         *    Activate picking
         */
        function activate() {
            currentContext.getRenderContext().canvas.addEventListener("mousedown", _handleMouseDown);
            currentContext.getRenderContext().canvas.addEventListener("mouseup", _handleMouseUp);

            if (isMobile) {
                currentContext.getRenderContext().canvas.addEventListener("touchstart", _handleMouseDown);
                currentContext.getRenderContext().canvas.addEventListener("touchend", _handleMouseUp);
            }

            // Hide popup and blur selection when pan/zoom or animation
            mizarWidgetAPI.subscribeCtx(mizarWidgetAPI.EVENT_MSG.NAVIGATION_MODIFIED, function () {
                pickingManagerCore.clearSelection();
                FeaturePopup.hide();
            });
        }

        /**************************************************************************************************************/

        /**
         *    Deactivate picking
         */
        function deactivate() {
            currentContext.getRenderContext().canvas.removeEventListener("mousedown", _handleMouseDown);
            currentContext.getRenderContext().canvas.removeEventListener("mouseup", _handleMouseUp);

            if (isMobile) {
                currentContext.getRenderContext().canvas.removeEventListener("touchstart", _handleMouseDown);
                currentContext.getRenderContext().canvas.removeEventListener("touchend", _handleMouseUp);
            }

            // Hide popup and blur selection when pan/zoom or animation
            mizarWidgetAPI.unsubscribeCtx(mizarWidgetAPI.EVENT_MSG.NAVIGATION_MODIFIED, function () {
                pickingManagerCore.clearSelection();
                FeaturePopup.hide();
            });
        }

        /**************************************************************************************************************/

        return {
            /**
             * Init picking manager
             *
             * @param {Mizar} m mizarWidgetAPI
             * @param {Object} configuration PickingManager configuration
             * @param {Boolean} configuration.isMobile For mobile navigation
             * @param {?Object} configuration.cutout cutout service
             * @param {String} configuration.sitoolsBaseUrl serviceBaseUrl for ImageManager module
             *
             */
            init: function (m, configuration) {
                mizarWidgetAPI = m;
                currentContext = mizarWidgetAPI.getContext();
                self = this;
                isMobile = configuration.isMobile;
                pickingManagerCore = mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.PickingManager);

                activate();

                mizarWidgetAPI.subscribeMizar(mizarWidgetAPI.EVENT_MSG.MIZAR_MODE_TOGGLE, this.updateContext);
                mizarWidgetAPI.subscribeCtx(mizarWidgetAPI.EVENT_MSG.CRS_MODIFIED, this.updateContext);

                // Initialize the fits manager
                ImageManager.init(mizarWidgetAPI, configuration);

                if (configuration.cutOut) {
                    // CutOutView factory ... TODO : move it/refactor it/do something with it...
                    CutOutViewFactory.init(mizarWidgetAPI, this);
                }
                FeaturePopup.init(mizarWidgetAPI, this, ImageManager, configuration);
            },

            /**************************************************************************************************************/

            /**
             *    Update picking context
             */
            updateContext: function () {
                //if(currentContext)
                //    deactivate();
                currentContext = mizarWidgetAPI.getContext();
                pickingManagerCore.updateContext(currentContext);
                activate();
            },

            /**************************************************************************************************************/

            /**
             *    Add pickable layer
             */
            addPickableLayer: function (layer) {
                pickingManagerCore.addPickableLayer(layer);
            },

            /**************************************************************************************************************/

            /**
             *    Remove pickable layers
             */
            removePickableLayer: function (layer) {
                pickingManagerCore.removePickableLayer(layer);
            },

            /**************************************************************************************************************/

            /**
             *    Apply selected style to the given feature
             */
            focusFeature: function (selectedData, options) {
                pickingManagerCore.getSelection().push(selectedData);
                this.focusFeatureByIndex(pickingManagerCore.getSelection().length - 1, options);
            },

            /**************************************************************************************************************/

            getSelectedData: function () {
                return pickingManagerCore.getSelection()[pickingManagerCore.stackSelectionIndex];
            },

            /**************************************************************************************************************/

            getSelection: function () {
                return pickingManagerCore.getSelection();
            },

            /**************************************************************************************************************/

            blurSelectedFeature: function () {
                pickingManagerCore.blurSelectedFeature();
            },

            /**************************************************************************************************************/

            focusFeatureByIndex: function (index, options) {
                pickingManagerCore.focusFeatureByIndex(index, options);
            },

            /**************************************************************************************************************/

            computePickSelection: function (pickPoint) {
                pickingManagerCore.computePickSelection(pickPoint);
            },

            /**************************************************************************************************************/

            blurSelection: function () {
                pickingManagerCore.blurSelection();
            },

            /**************************************************************************************************************/

            activate: activate,
            deactivate: deactivate
        };

    });
