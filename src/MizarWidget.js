/**
 * Mizar widget is a relatively simple and easy-to-use cartographic application with a GUI.
 * This widget is composed of :
 * <ul>
 *     <li>a cartographic element, called Mizar</li>
 *     <li>a GUI to handle the different layers and contexts</li>
 * </ul>
 *
 * Mizar widget can handle two contexts :
 * <ul>
 *     <li>a globe representing the sky with the camera is located at the center of the globe</li>
 *     <li>a globe representing a planet</li>
 *     <li>a hybrid context where the panet is representing whith the sky in background</li>
 * </ul>
 *
 * The GUI of Mizar widget provides the following elements:
 * <ul>
 *     <li>a graphical element to handle the different layer : on/off, opacity</li>
 *     <li>a graphical element to select a background layer</li>
 *     <li>a graphical element to resolve an object name to coordinates</li>
 *     <li>a graphical element to find an object name based on its coordinates</li>
 *     <li>a manager to handle graphical events related to the user picking</li>
 *     <li>a graphical element to display the metadata to the user</li>
 *     <li>a graphical iframe to display external link to the user</li>
 *     <li>a graphical element to display the footprint of the camera in the whole sky</li>
 *     <li>a graphical element to handle features on a displayed image (quicklook or Fits data)</li>
 *     <li>a graphical element to handle specific layer</li>
 *     <li>a graphical element to measure the angular distance between two points</li>
 *     <li>a graphical element to measure the distance and compute the elevation profile between two points
 *     on a planet</li>
 *     <li>a graphical element to switch 2D/3D</li>
 *     <li>a graphical element to order data based on a selected area</li>
 *     <li>a graphical element to display credits of the tool to the user</li>
 *     <li>a graphical element to display error to the user</li>
 *     <li>two services : a sharing service and <a href="http://www.ivoa.net/documents/SAMP/">SAMP</a></li>
 * </ul>
 *
 */
define(["./MizarWidgetAPI"], function (MizarWidgetAPI) {

    /**
     @name MizarWidget
     @class
         Entry point to manage Mizar Widget.
     @param div Div to use for the Widget.
     @param options Configuration properties for the Widget.
     */
    //TODO décrire les options
    var MizarWidget = function (div, options) {
        this.mizarWidgetAPI = new MizarWidgetAPI(div, options);
    };

    /**************************************************************************************************************/
    /**
     * Returns the wrapper between mizarWidget and the mizarWidgetAPI
     * @function getMizarGlobal
     * @memberof MizarWidget.prototype
     * @return {MizarGlobal|*}
     */
    MizarWidget.prototype.getMizarWidgetAPI = function () {
        return this.mizarWidgetAPI;
    };

    window.MizarWidget = MizarWidget;

    return MizarWidget;

});
