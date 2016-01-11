/**
 * Created by aghassaei on 1/11/16.
 */


define(['jquery', 'underscore', 'menuParent', 'emSimPlist', 'text!menus/templates/EmRunMenuView.html'],
    function($, _, MenuParentView, emPlist, template){

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(){
        },

        _makeTemplateJSON: function(){
            return null;
        },

        template: _.template(template)
    });
});