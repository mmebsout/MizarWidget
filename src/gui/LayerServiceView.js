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
 *    Layer service view
 *    The view representing the services for each layer
 */
define(["jquery", "service/gui/OpenSearchService", "../service/gui/MocService", "../service/gui/XMatchService", "uws/HEALPixCutService", "jquery.ui"],
    function ($, OpenSearchService, MocService, XMatchService, HEALPixCutService) {

        var layerServiceView = '<div id="layerServiceView" title="Available services">\
							<div id="layerServices">\
								<ul>\
								</ul>\
							</div>\
						</div>';

// jQuery selectors
        var $layerServiceView;
        var tabs;

        var services = [OpenSearchService, MocService, XMatchService];

        var serviceMapping = {
            "OpenSearch": OpenSearchService,
            "Moc": MocService,
            "XMatch": XMatchService,
            "HEALPixCut": HEALPixCutService
        };

        var currentLayer;

        /**
         *    Get service object from configuration
         *    (could be string or object)
         */
        function getServiceFromConf(service) {
            if (typeof service === "string") {
                return serviceMapping[service];
            }
            else {
                if (service.name) {
                    return serviceMapping[service.name];
                }
                else {
                    console.error("Service must have name property in configuration");
                    return null;
                }
            }
        }

        /**
         *    Adds a service "key" related to the layer to the toolbar tabs
         *    Returns true when the service is added otherwise false
         */
		function addServiceToGUI(layer, tabs, key) {
			var serviceAdded;
			var service = getServiceFromConf(key);
			if (service == null) {
				serviceAdded = false;
			} else {
				service.addLayer(layer);
				service.addService(tabs, key);
				serviceAdded = true;
			} 
			return serviceAdded;
		}

        /**
         *    Removes a service "key" related to the layer to the toolbar tabs
         *    Returns true when the service is removed otherwise false
         */
		function removeServiceFromGUI(layer, tabs, key) {
			var serviceRemoved;
			var service = getServiceFromConf(key);
			if (service == null) {
				serviceRemoved = false;
			} else {
                service.removeLayer(currentLayer);
                service.removeService(tabs, key);
				serviceRemoved = true;
			} 
			return serviceRemoved;
		}

        /**
         *    Removes services from GUI
         */
		function removesServicesFromGUI(currentLayer, tabs) {		
			if (currentLayer.type === "OpenSearch") {
				removeServiceFromGUI(currentLayer, tabs, "OpenSearch");
			} else {
                Object.keys(currentLayer.getServices()).forEach(function (key) {
					removeServiceFromGUI(currentLayer, tabs, key);
                });
			}
		}

        /**
         *    Creates services to GUI
         */
		function createServicesToGUI(layer, tabs) {
			if (layer.type === "OpenSearch") {
				addServiceToGUI(layer, tabs, "OpenSearch");               					
			} else {
	            Object.keys(layer.getServices()).forEach(function (key) {
					addServiceToGUI(layer, tabs, key);
	            });
			}
		}		

        return {
            /**
             *    Initilize layer service view
             */
            init: function (mizar, configuration) {
                // Create jQuery UI dialog to represent layer service view
                $layerServiceView = $(layerServiceView)
                    .appendTo('body')
                    .dialog({
                        autoOpen: false,
                        resizable: false,
                        width: '600px',
                        show: {
                            effect: "fade",
                            duration: 300
                        },
                        hide: {
                            effect: "fade",
                            duration: 300
                        },
                        minHeight: 'auto',
                        position: ['middle', 20],
                        open: function () {
                            // Remove auto-focus
                            $(this).find('li:first-child').blur();
                        }
                    });

                tabs = $layerServiceView.find('#layerServices').tabs({
                    collapsible: true,
                    hide: {effect: "slideUp", duration: 300},
                    show: {effect: "slideDown", duration: 300}
                });
                OpenSearchService.init(mizar);
                MocService.init(mizar);
                XMatchService.init(mizar, configuration);
                HEALPixCutService.init(mizar);
                document.layerServiceView = this;
                
            },

            /**
             *    Remove created dialog
             */
            remove: function () {
                $layerServiceView.find('#layerServices').tabs("destroy");
                $layerServiceView.dialog("destroy").remove();
            },

            show: function (layer) {
                var service;			
                // Remove previous services
                if (currentLayer) {
					removesServicesFromGUI(currentLayer, tabs);
                }
				createServicesToGUI(layer, tabs);
                currentLayer = layer;

                tabs.tabs('refresh');
                tabs.tabs("option", "active", 0);

                $layerServiceView.dialog("open");
            },
            hide : function() {
                $(layerServiceView).end();
            }
        }

    });
