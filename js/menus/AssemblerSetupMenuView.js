/**
 * Created by aghassaei on 8/11/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'cam', 'text!assemblerSetupMenuTemplate'],
    function($, _, MenuParentView, plist, cam, template){

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(){

        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), cam.toJSON());
        },

        template: _.template(template)
    });
});
