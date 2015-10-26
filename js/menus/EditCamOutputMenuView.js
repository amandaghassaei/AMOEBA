/**
 * Created by aghassaei on 7/12/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'text!menus/templates/EditCamOutputMenuView.html'],
    function($, _, MenuParentView, plist, template){


    return MenuParentView.extend({

        events: {
        },


        _initialize: function(){
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), plist);
        },

        template: _.template(template)
    });
});