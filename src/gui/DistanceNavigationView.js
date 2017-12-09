/*******************************************************************************
 * Copyright 2017 CNES - CENTRE NATIONAL d'ETUDES SPATIALES
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
 * along with SITools2. If not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************/
define(["jquery"],
    function ($) {

        var mizarWidgetAPI = null;
        var opts = null;
        var elt = null;
        var distanceDivHTML = "<input type=\"submit\" id=\"distanceButtom\" value=\"\" /><div id=\"distTracker\"></div>";

        var _formatDistance = function(distance) {
            var dist;
            var unit;
            if(distance >= 10000) {
                dist = distance/1000.0;
                dist = dist.toFixed(1);
                unit = "Km";
            } else {
                dist = distance;
                dist = dist.toFixed(0);
                unit = "m";
            }
            return dist+" "+unit;
        };

        var _distanceEvent = function(distance) {
            var result;
            if(distance) {
                result = _formatDistance(distance);
            } else {
                result = "waiting ..."
            }
            document.getElementById(elt).innerHTML = result;
        };

        return {
            init: function (m, element, options) {
                opts = options;
                elt = element;
                mizarWidgetAPI = m;
                $(distanceDivHTML).appendTo("#distanceDiv");
                var ctx = mizarWidgetAPI.getContext();
                var initNav = ctx.getNavigation();
                var initDistance = initNav.getDistance();
                document.getElementById(elt).innerHTML = _formatDistance(initDistance);
                ctx.subscribe("navigation:changedDistance", _distanceEvent)
            },
            isInitialized: function() {
                return mizarWidgetAPI ? true : false
            },
            update : function(m) {
                mizarWidgetAPI = m;
                var ctx = mizarWidgetAPI.getContext();
                ctx.subscribe("navigation:changedDistance", _distanceEvent)
            },
            remove: function() {
                if(mizarWidgetAPI) {
                    var ctx = mizarWidgetAPI.getContext();
                    ctx.unsubscribe("navigation:changedDistance", _distanceEvent);
                }
            }

        };

    });
