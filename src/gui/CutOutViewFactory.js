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
 *    UWS CutOutViewFactory
 *    Designed to share selectionTool & picking manager between views
 */
define(["jquery", "./CutOutView"],
    function ($, CutOutView) {

        var mizarWidgetAPI;
        var selectionTool;
        var pickingManager;
        var views = [];

        /**************************************************************************************************************/

        return {
            init: function (m, pm) {
                mizarWidgetAPI = m;
                pickingManager = pm;

                // Initialize selection tool
                selectionTool = mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.SelectionTool, {
                    ctx: mizarWidgetAPI.getContext(),
                    onselect: function () {
                        $('.cutOutService').slideDown();
                        // Activate picking events
                        pickingManager.activate();
                        selectionTool.toggle();
                    }
                });
                views = [];
            },

            addView: function (element) {
                var view = new CutOutView(element, selectionTool, pickingManager);
                views.push(view);
                return view;
            },

            removeView: function (view) {
                var index = views.indexOf(view);
                views.splice(index, 1);
            }
        };

    });
