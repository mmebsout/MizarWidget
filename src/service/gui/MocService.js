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
 * Moc display & Moc xMatch services
 */
define(["jquery", "underscore-min", "../../utils/UtilsCore", "text!templates/mocServiceItem.html"],
    function ($, _, UtilsCore, mocServiceHTMLTemplate) {

        // Template generating the services html
        var mocServiceTemplate = _.template(mocServiceHTMLTemplate);

        var mizarWidgetAPI;
        var layers = [];

        /**************************************************************************************************************/

        /**
         *    Event for display button
         */
        function displayClickEvent() {
            var serviceLayer = $(this).parent().data("layer");
            //var IDs = layer.split("#",2);
            //var serviceLayerID = IDs[1];
            //var serviceLayer = mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MocBase).findMocSublayer(serviceLayerID);
            // Change visibility
            if (serviceLayer) {
                if (this.checked) {
                    serviceLayer.setVisible(true)
                }
                else {
                    serviceLayer.setVisible(false);
                }
            }
        }

        function convertToIDJquery(str) {
            return str.replace(/\:/g, "_");
        }

        /**************************************************************************************************************/

        /**
         *    Add HTML of moc layer
         */
        function addHTMLMocLayer(layer) {
            var content = mocServiceTemplate({layer: layer, display: true});
            $(content)
                .appendTo('#MocService .mocLayers')
                .data("layer", layer)
                .find('input[type="checkbox"]')
                .attr("checked", (layer && layer.visible) ? true : false)
                .attr("disabled", (layer) ? false : true)
                .button()
                .click(displayClickEvent);
        }

        /**************************************************************************************************************/

        return {

            init: function (m) {
                mizarWidgetAPI = m;
            },

            /**************************************************************************************************************/

            initTab: function (tabs) {
                
            },

            /**
             *    Add layer to the service
             *    TODO : remove the layers and the MOC in mizarAPI
             */
            addLayer: function (layer) {
                var mocDescribe = layer.getServices().Moc;
                // Create if doesn't exist
                if (mocDescribe && !_.find(layers, function(itemLayer){
                        var layerID = layer.ID;
                        return itemLayer.startsWith(layerID);
                    })) {
                    var serviceID = mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.MocBase).createMocSublayer(mocDescribe,
                        function (layer) {
                            $("#MocService #mocLayer_" + convertToIDJquery(layer.ID)).find('input[type="checkbox"]').removeAttr("disabled").button("refresh");
                            $("#MocService #mocLayer_" + convertToIDJquery(layer.ID)).find('.mocCoverage').html("Sky coverage: " + layer.coverage);
                    }, function (layer) {
                        $("#MocService #mocLayer_" + convertToIDJquery(layer.ID)).find('.mocCoverage').html("Sky coverage: Not available").end()
                            .find('.mocStatus').html('(Not found)');
                    });

                    layers.push(layer.ID+"#"+serviceID);
                    var mocLayer = mizarWidgetAPI.getLayerByID(serviceID);
                    mocLayer.name = layer.name+" MOC";
                    addHTMLMocLayer(mocLayer);
                }
            },

            /**************************************************************************************************************/

            /**
             *    Remove layer from the service
             */
            removeLayer: function (layer) {
                var serviceID="";
                for (var i = 0; i < layers.length; i++) {
                    var registeredLayer = layers[i];
                    var IDs = registeredLayer.split("#",2);
                    if (IDs[0] === layer.ID) {
                        layers.splice(i, 1);
                        serviceID = IDs[1];
                        break;
                    }
                }
                $("#MocService #mocLayer_" + convertToIDJquery(serviceID)).remove();
            },

            /**************************************************************************************************************/

            /**
             *    Add service to jQueryUI tabs
             *
             *    @param tabs jQueryUI tabs selector
             */
            addService: function (tabs) {
                // Append headers
                $('<li style="display: none;"><a href="#MocService">Moc</a></li>')
                    .appendTo(tabs.children(".ui-tabs-nav"))
                    .fadeIn(300);

                // Append content
                tabs.append('<div id="MocService">\
						<div class="mocLayers"></div>\
					</div>');

                for (var i = 0; i < layers.length; i++) {
                    var layerIDs = layers[i].split("#",2);
                    var layer = mizarWidgetAPI.getLayerByID(layerIDs[1]);
                    addHTMLMocLayer(layer);
                }
            },

            /**************************************************************************************************************/

            /**
             *    Remove service from jQueryUI tabs
             *
             *    @param tabs jQueryUI tabs selector
             */
            removeService: function (tabs) {
                // Remove MocService tab(content&header)
                $('li[aria-controls="MocService"]').remove();
                $("#MocService").remove();
                tabs.tabs("refresh");
            }
        }

    });
