/***************************************
 * Copyright 2011, 2012 GlobWeb contributors.
 *
 * This file is part of GlobWeb.
 *
 * GlobWeb is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, version 3 of the License, or
 * (at your option) any later version.
 *
 * GlobWeb is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GlobWeb. If not, see <http://www.gnu.org/licenses/>.
 ***************************************/

define(function () {

    var Utils = {};

    /**
     * Inherits from an object
     */
    Utils.inherits = function (base, sub) {
        function tempCtor() {
        }

        tempCtor.prototype = base.prototype;
        sub.prototype = new tempCtor();
        sub.prototype.constructor = sub;
    };

    /**
     * Checks if "passive" is supported by.
     * @function isPassiveSupported
     * @return {Boolean} true when "passive" mode is supported otherwise false
     */
    Utils.isPassiveSupported = function() {
        var passiveSupported = false;

        try {
            var options = Object.defineProperty({}, "passive", {
                get: function() {
                    passiveSupported = true;
                    return passiveSupported;
                }
            });

            window.addEventListener("test", options, options);
            window.removeEventListener("test", options, options);
        } catch (err) {
            passiveSupported = false;
        }
        return passiveSupported;
    };    

    return Utils;

});
