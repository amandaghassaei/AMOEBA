/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'text!menus/templates/SketchMenuView.html', 'globals'],
    function($, _, MenuParentView, plist, template, globals){

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(){

        },

        getPropertyOwner: function($target){
            if ($target.hasClass('baseplane')) return globals.baseplane;
            return null;
        },

        _makeTemplateJSON: function(){
            return globals.baseplane.toJSON();
        },

        _render: function(){
        },

        template: _.template(template)
    });
});