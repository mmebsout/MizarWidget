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
 * Image manager
 */
define(["jquery", "./ImageProcessing"],
    function ($, ImageProcessing) {

        var mizarWidgetAPI;
        var fitsVisu;

        /**********************************************************************************************/

        /**
         *    Handle fits data on the given feature
         */
        function handleFits(fitsData, featureData) {

            var image = fitsVisu.handleFits(fitsData, featureData);

            // Set image on image processing popup
            ImageProcessing.setImage(image);
        }

        /**********************************************************************************************/

        /**
         *    Parse fits file
         *
         *    @param response XHR response containing fits
         *
         *    @return Parsed data
         */
        function parseFits(response) {
            fitsVisu.parseFits(response);
        }

        /**********************************************************************************************/

        return {

            /**
             *    Initialize
             */
            init: function (mizar, configuration) {
                mizarWidgetAPI = mizar;
                fitsVisu = mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.FitsVisu);
                fitsVisu.init(mizarWidgetAPI.getMizarAPI(), configuration);
                // Enable float texture extension to have higher luminance range
                var ext = mizarWidgetAPI.getRenderContext().gl.getExtension("OES_texture_float");
            },

            /**********************************************************************************************/

            /**
             *    Hide image
             */
            hideImage: function () {
                fitsVisu.hideImage()
            },

            /**********************************************************************************************/

            /**
             *    Show image
             */
            showImage: function () {
                fitsVisu.showImage()
            },

            /**********************************************************************************************/

            /**
             *    Remove image from renderer
             */
            removeImage: function () {
                fitsVisu.removeImage()
            },

            /**********************************************************************************************/

            /**
             *    Start download of texture
             */
            addImage: function () {
                fitsVisu.addImage()
            },

            computeFits: function () {
                fitsVisu.computeFits()
            },
            handleFits: handleFits
        };

        /**********************************************************************************************/

    });
