/*******************************************************************************
 * Copyright 2012-2015 CNES - CENTRE NATIONAL d'ETUDES SPATIALES
 *
 * This file is part of SITools2.
 *
 * SITools2 is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * SITools2 is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with SITools2. If not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************/
/*global define: false */

/**
 * Tool designed to measure the distance between two points in planet mode
 */

define(["jquery", "jquery.ui"],
    function ($) {

        var mizarWidgetAPI, self;
        
        var MeasureToolPlanet = function (options) {
            // Required options
            mizarWidgetAPI = options.mizar;

            if( options.mode !== mizarWidgetAPI.CONTEXT.Planet ) {
                return;
            }

            mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet).init(options);

            this.renderContext = mizarWidgetAPI.getRenderContext();

            self = this;

            var _handleMouseUp = function (event) {

                if (!mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet).activated) {
                    return;
                }
                mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet)._handleMouseUp(event);
                $.proxy(self.displayButtonElevation(event), self);

            };

            $('#elevationTrackingBtn').button()
                .click($.proxy(self.displayPopupElevation, this));

            self.renderContext.canvas.addEventListener("contextmenu", function () {
                return false;
            });
            self.renderContext.canvas.addEventListener("mousedown", $.proxy(mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet)._handleMouseDown, this));
            self.renderContext.canvas.addEventListener("mouseup", $.proxy(_handleMouseUp, this));
            self.renderContext.canvas.addEventListener("mousemove", $.proxy(mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet)._handleMouseMove, this));

            if (options.isMobile) {
                self.renderContext.canvas.addEventListener("touchend", $.proxy(_handleMouseUp, this));
                self.renderContext.canvas.addEventListener("touchmove", $.proxy(mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet)._handleMouseMove, this));
                self.renderContext.canvas.addEventListener("touchstart", $.proxy(mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet)._handleMouseDown, this));
            }

            $('#measurePlanetInvoker').on('click', function () {
                self.toggle();
            }).hover(function () {
                $(this).animate({left: '-10px'}, 100);
            }, function () {
                $(this).animate({left: '-20px'}, 100);
            });
        };

        MeasureToolPlanet.prototype.updateContext = function (pContext) {
            mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet).updateContext(pContext);
        };
        /**
         *    Enable/disable the tool
         */
        MeasureToolPlanet.prototype.toggle = function () {
            mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet).activated = !mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet).activated;
            if (mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet).activated) {
                $(self.renderContext.canvas).css('cursor', 'url(css/images/selectionCursor.png)');
            }
            else {
                $(self.renderContext.canvas).css('cursor', 'default');
                $('#elevationTrackingBtn').hide();
                try {
                    $('#popupElevation').dialog('close');
                } catch (e) {
                }

                mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet).clear();
            }
            $('#measurePlanetInvoker').toggleClass('selected');
        };

        /**************************************************************************************************************/

        /**
         * Display a popup proposing to display elevation tracking
         */
        MeasureToolPlanet.prototype.displayButtonElevation = function (event) {

            $('#elevationTrackingBtn').button()
                .show()
                .position({
                    my: "left+3 bottom-3",
                    of: event,
                    collision: "fit"
                });

        };

        /**************************************************************************************************************/

        /**
         * Display a popup proposing to display elevation tracking
         */
        MeasureToolPlanet.prototype.displayPopupElevation = function (event) {

            var options = {};
            var intermediatePoints = mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet).calculateIntermediateElevationPoint(options, mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet).geoPickPoint, mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet).secondGeoPickPoint);

            mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet).storeDistanceAndElevation(intermediatePoints[0], intermediatePoints[0]);
            for (var i = 0; i < intermediatePoints.length; i++) {
                mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet).storeDistanceAndElevation(intermediatePoints[0], intermediatePoints[i]);
            }

            $("#popupElevation").dialog({
                width: 500,
                height: 400,
                position: {
                    my: "right top",
                    at: "right top",
                    of: window
                }
            });

            $.plot("#popupElevation", [{
                data: mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolPlanet).elevations, label: "elevation (m)"
            }], {
                series: {
                    color: "#F68D12",
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                grid: {
                    hoverable: true
                },
                tooltip: {
                    show: true,
                    content: "Distance: %x | Elevation: %y",
                    cssClass: "flotTip",
                    shifts: {
                        x: -25,
                        y: -60
                    }
                },
                xaxis: {
                    axisLabel: 'Distance (km)',
                    axisLabelUseCanvas: false,
                    axisLabelFontSizePixels: 20
                },
                yaxis: {
                    axisLabel: 'Elevation (m)',
                    axisLabelUseCanvas: false,
                    axisLabelFontSizePixels: 20
                },
                zoom: {
                    interactive: true
                },
                pan: {
                    interactive: true
                }
            });
        };

        return MeasureToolPlanet;

    });
