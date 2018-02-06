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
 * Histogram module : create histogram to the given image
 */
define([], function () {

    // Private variables
    //var nbBins;

    //var hist = [];
    //var hmax; // histogram max to scale in image space

    // Origin histogram point
    //var originX = 5.;
    //var originY;
    //var hwidth;
    //var paddingBottom = 15.;
    var mizarWidgetAPI;
    var serviceHisto;

    /**************************************************************************************************************/

    /**
     *    TODO: split on HistogramView and Histogram
     *    Histogram contructor
     *    @param options Histogram options
     *        <ul>
     *            <li>image: The image which is represented by current histogram(required)</li>
     *            <li>nbBins: Number of bins, representing the sampling of histogram(optional)</li>
     *            <li>onUpdate: On update callback
     *            <li>accuracy: The accuracy of histogram(numbers after floating point)
     *        </ul>
     */
    var Histogram = function (options) {
        //nbBins = options.nbBins || 256;
        mizarWidgetAPI = options.mizar;
        serviceHisto = mizarWidgetAPI.getServiceByName(mizarWidgetAPI.SERVICE.Histogram);
        this.image = options.image;
        this.onUpdate = options.onUpdate;
        this.accuracy = options.accuracy || 6;

        serviceHisto.init(options);

    };

    /**************************************************************************************************************/

    /**
     *    Get histogram value from the given X-position on canvas
     */
    Histogram.prototype.getHistValue = function (position) {
        serviceHisto.getHistValue(position)
    };

    /**************************************************************************************************************/

    /**
     *    Draw threshold controls(two triangles which represents min/max of current histogram)
     */
    Histogram.prototype.drawThresholdControls = function () {
        serviceHisto.drawThresholdControls()
    };

    /**************************************************************************************************************/

    /**
     *    Draw histogram
     */
    Histogram.prototype.drawHistogram = function (options) {
        serviceHisto.drawHistogram(options)
    };

    /**************************************************************************************************************/

    /**
     *    Draw histogram axis
     */
    Histogram.prototype.drawAxes = function () {
        serviceHisto.drawAxes()
    };

    /**************************************************************************************************************/

    /**
     *    Draw transfer function(linear, log, asin, sqrt, sqr)
     */
    Histogram.prototype.drawTransferFunction = function (options) {
        serviceHisto.drawTransferFunction(options)
    };

    /**************************************************************************************************************/

    /**
     *    Draw the histogram in canvas
     */
    Histogram.prototype.draw = function () {
        serviceHisto.draw()
    };

    /**************************************************************************************************************/

    /**
     *    TODO : create different module
     *    Compute histogram values
     */
    Histogram.prototype.compute = function () {
        serviceHisto.compute()
    };

    /**************************************************************************************************************/

    /**
     *    Set image
     */
    Histogram.prototype.setImage = function (image) {
        serviceHisto.setImage(image)
    };

    /**************************************************************************************************************/

    return Histogram;
});
