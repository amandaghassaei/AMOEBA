/**
 * Created by aghassaei on 10/23/15.
 */


define(['jquery', 'underscore', 'menuParent', 'lattice', 'materials', 'materialsPlist', 'appState', 'text!menus/templates/ViewMenuView.html'],
    function($, _, MenuParentView, lattice, materials, materialsPlist, appState, template){


    return MenuParentView.extend({

        events: {
        },

        __initialize: function(){
        },

        _makeTemplateJSON: function(){
            return _.extend(appState.toJSON(), materialsPlist, {materials:materials.list, compositeMaterialsKeys:materials.getCompositeKeys()});
        },

        template: _.template(template)
    });
});