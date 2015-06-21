/**
 * Created by aghassaei on 3/11/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice', 'text!sendMenuTemplate'], function($, _, MenuParentView, plist, lattice, template){

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(){
            //bind events
        },

        _makeTemplateJSON: function(){
            return null;
        },

        template: _.template(template)
    });
});