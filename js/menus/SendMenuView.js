/**
 * Created by aghassaei on 3/11/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice'], function($, _, MenuParentView, plist, lattice){

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