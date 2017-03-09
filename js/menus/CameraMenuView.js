/**
 * Created by amandaghassaei on 3/8/17.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'threeModel', 'text!menus/templates/CameraMenuView.html'],
    function($, _, MenuParentView, plist, threeModel, template){

        return MenuParentView.extend({

            events: {
            },

            _initialize: function(){
                this.listenTo(threeModel, "change", this.render);
            },

            _makeTemplateJSON: function(){
                return _.extend(threeModel.toJSON(), plist);
            },

            template: _.template(template)
        });
});