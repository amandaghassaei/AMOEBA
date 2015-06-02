/**
 * Created by aghassaei on 3/11/15.
 */

define(['jquery', 'underscore', 'menuParent', 'cam', 'lattice', 'plist'], function($, _, MenuParentView, cam, lattice, plist){

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(){
            //bind events
        },

        _makeTemplateJSON: function(){
            return null;
        },


        template: _.template('realtime communication with machine')

    });
});