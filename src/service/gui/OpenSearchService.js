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
 * OpenSearch service
 */
define(["jquery", "underscore", "moment","text!templates/openSearchService.html", "text!templates/openSearchForm.html", "jquery.ui", "jquery.datetimepicker", "php-date-formatter"],
    function ($, _, moment, openSearchServiceHTMLTemplate, openSearchFormHTMLTemplate) {

        // Template generating the open search service div
        var openSearchServiceTemplate = _.template(openSearchServiceHTMLTemplate);

        // Template generating the form of properties
        var openSearchFormTemplate = _.template(openSearchFormHTMLTemplate);

        var layers = [];

        /**
         *    Handle submit event
         */
        function handleSubmit(event) {
            event.stopPropagation();
            event.preventDefault();
            var layer = $(this).closest(".osForm").data("layer");
            // Get array of changed inputs
            var notEmptyInputs = $(this).find(':input[value!=""]').serializeArray();
            // Create new properties
            var properties = {};
            for (var i = 0; i < notEmptyInputs.length; i++) {
                properties[notEmptyInputs[i].name.toString()] = notEmptyInputs[i].value.toString();
            }

            var selectOptions;
            $(this).find('select').each(function (i) {
                if ($(this).val())
                    properties[$(this).attr("name")] = $(this).val();

            });

            // Modify the request properties of choosen layer
            layer.setRequestProperties(properties);
        }


        /**
         *    Attach open search form to layer
         *
         *    @param layer GlobWeb layer
         */
        function attachForm(layer) {
            layer.openSearchForm = openSearchFormTemplate({ "layer": layer });
        }

        function createOpenSearchServiceInTabs(tabs) {
            if ((typeof $("#OpenSearchService").length === "number") && ($("#OpenSearchService").length === 0)) {
                // Append header
                $('<li style="display: none;"><a href="#OpenSearchService">OpenSearch</a></li>')
                    .appendTo(tabs.children(".ui-tabs-nav"))
                    .fadeIn(300);
                // Append content
                tabs.append('<div id="OpenSearchService"></div>');
                var openSearchService = openSearchServiceTemplate();
                $(openSearchService)
                    .appendTo('#OpenSearchService')
                    .tabs({
                        collapsible: true,
                        hide: { effect: "fadeOut", duration: 300 },
                        show: { effect: "fadeIn", duration: 300 }
                    });
            }
        }

        function handleQueryForm(layer) {
            // create tab for queryform
            var tabs = $('#openSearchTabs').tabs({
                collapsible: true,
                hide: { effect: "slideUp", duration: 300 },
                show: { effect: "slideDown", duration: 300 }
            });

            // append Header
            $('<li><a href="#osForm_' + layer.id + '">' + layer.name + "</a></li>")
                .appendTo(tabs.children(".ui-tabs-nav"));
            // append content
            tabs.append('<div id="osForm_' + layer.id + '">' + layer.openSearchForm + '</div>');
           
            // format date for date time picker
            $.datetimepicker.setDateFormatter({
                parseDate: function (date, format) {
                    var d = moment.utc(date,"YYYY-MM-DDTHH:mm:ss");
                    return d.isValid() ? d.toDate() : false;
                },
                formatDate: function (date, format) {
                    var datetime;
                    if(format === "Y-m-d") {
                        datetime = moment.utc(date).format(format);
                    } else if(format === "H:m") {
                        datetime = String(date.getHours()).padStart(2, "0")+":"+String(date.getMinutes()).padStart(2, "0");                     
                    } else {
                        datetime = moment(date,"Y-m-d H:m").format("YYYY-MM-DDTHH:mm");
                        datetime = datetime+":00";
                    }
                    return datetime;
                }
            });

            // attach data and datetimepicker to queryform
            $('#openSearchTabs')
                .find('#openSearchForm_' + layer.id)
                .data("layer", layer)
                .submit(handleSubmit).end()
                .find(".datetimepicker").datetimepicker({
                    lang: 'en',
                    timepicker: true,
                    format:'Y-m-d H:m',
                    formatDate:'Y-m-d',
                    formatTime:'H:m',                    
                });

            // refresh
            $('#openSearchTabs').tabs("refresh");

            // make enabled the queryform tab
            var index = $('#openSearchTabs').find('.ui-tabs-nav li[aria-controls="osForm_' + layer.id + '"]').index();
            tabs.tabs("option", "active", index);
        }

        return {
            init: function (m) {
                mizarWidgetAPI = m;
            },


            initTab: function (tabs) {
                createOpenSearchServiceInTabs(tabs);
            },

            destroyTab: function (tabs) {
                // if(layers.length === 0) {
                //     var index = $('#layerServices').find('.ui-tabs-nav li[aria-controls="OpenSearchService"]').index();
                //     $("#layerServices").find(".ui-tabs-nav li:eq("+index+")").remove();
                //     $("#layerServices").find("#OpenSearchService").remove();  
                //     $('#layerServices').tabs("refresh");                  
                // }
            },

            /**
             *    Add service to jQueryUI tabs
             *
             *    @param tabs jQueryUI tabs selector
             */
            addService: function (tabs, layer) {
                var isFound = _.find(layers, function (recordedLayer) { return recordedLayer.ID === layer.ID });
                if (isFound === undefined) {
                    layers.push(layer);
                    attachForm(layer);
                    handleQueryForm(layer);
                }
            },

            /**
             *    Remove service from jQueryUI tabs
             *
             *    @param tabs jQueryUI tabs selector
             */
            removeService: function (tabs, layer) {
                for (var i = 0; i < layers.length; i++) {
                    if (layers[i].id === layer.id) {
                        var index = $('#openSearchTabs').find('.ui-tabs-nav li[aria-controls="osForm_' + layer.id + '"]').index();
                        $("#openSearchTabs").find(".ui-tabs-nav li:eq(" + index + ")").remove();
                        $("#openSearchTabs").find("#osForm_" + layer.id).remove();
                        layers.splice(i, 1);
                        $('#openSearchTabs').tabs("refresh");
                        break;
                    }
                }

            }
        }

    });
