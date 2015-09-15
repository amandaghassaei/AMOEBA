/**
 * Created by aghassaei on 9/15/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice', 'text!menus/templates/DNAExportMenuView.html'],
    function($, _, MenuParentView, plist, lattice, template){


    return MenuParentView.extend({

        events: {
        },


        _initialize: function(){
        },

        _makeTemplateJSON: function(){
            return {};
        },

        template: _.template(template)
    });
});