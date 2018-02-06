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
 * Tool designed to measure the distance between two points
 */

define(["jquery", "underscore-min", "jquery.ui"],
    function ($, _) {

        var mizarWidgetAPI, self;

        var MeasureToolSky = function (options) {
            // Required options
            mizarWidgetAPI = options.mizar;

            if( options.mode !== mizarWidgetAPI.CONTEXT.Sky ) {
                return;
            }

            var measureToolSkyOptions = $.extend({}, options);
            measureToolSkyOptions['mizar'] = mizarWidgetAPI.getMizarAPI();

            mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolSky).init(measureToolSkyOptions);

            mizarWidgetAPI.subscribeMizar(mizarWidgetAPI.EVENT_MSG.MIZAR_MODE_TOGGLE, function() {
                if(mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolSky).activated) {
                    self.toggle();
                }
            });
            mizarWidgetAPI.subscribeCtx(mizarWidgetAPI.EVENT_MSG.CRS_MODIFIED, function() {
                if(mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolSky).activated) {
                    self.toggle();
                }
            });

            this.renderContext = mizarWidgetAPI.getRenderContext();

            self = this;

            self.renderContext.canvas.addEventListener("mousedown", $.proxy(mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolSky)._handleMouseDown, this));
            self.renderContext.canvas.addEventListener("mouseup", $.proxy(mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolSky)._handleMouseUp, this));
            self.renderContext.canvas.addEventListener("mousemove", $.proxy(mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolSky)._handleMouseMove, this));

            if (options.isMobile) {
                self.renderContext.canvas.addEventListener("touchend", $.proxy(mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolSky)._handleMouseUp, this));
                self.renderContext.canvas.addEventListener("touchmove", $.proxy(mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolSky)._handleMouseMove, this));
                self.renderContext.canvas.addEventListener("touchstart", $.proxy(mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolSky)._handleMouseDown, this));
            }
            $('#measureSkyInvoker').on('click', function () {
                self.toggle();
            }).hover(function () {
                $(this).animate({left: '-10px'}, 100);
            }, function () {
                $(this).animate({left: '-20px'}, 100);
            });
        };


        /**
         *    Enable/disable the tool
         */
        MeasureToolSky.prototype.toggle = function () {
            mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolSky).activated = !mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolSky).activated;
            if (mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolSky).activated) {
                $(self.renderContext.canvas).css('cursor', 'url(css/images/selectionCursor.png)');
            }
            else {
                $(self.renderContext.canvas).css('cursor', 'default');
                mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolSky).clear();
            }
            $('#measureSkyInvoker').toggleClass('selected');
        };

        MeasureToolSky.prototype.remove = function() {
            mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolSky).remove();
            mizarWidgetAPI.unsubscribeMizar(mizarWidgetAPI.EVENT_MSG.MIZAR_MODE_TOGGLE, function() {
                if(mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolSky).activated) {
                    self.toggle();
                }
            });
            mizarWidgetAPI.unsubscribeCtx(mizarWidgetAPI.EVENT_MSG.CRS_MODIFIED, function() {
                if(mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MeasureToolSky).activated) {
                    self.toggle();
                }
            });
        };

        return MeasureToolSky;

    });
