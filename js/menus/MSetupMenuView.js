/**
 * Created by aghassaei on 6/30/15.
 */


define(['jquery', 'underscore', 'menuParent', 'lattice', 'plist', 'materialsPlist', 'text!menus/templates/MSetupMenuView.html'],
    function($, _, MenuParentView, lattice, plist, materialsPlist, template){

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(){
            this.listenTo(this.model, "change:materialClass", this._changeSimNav);
        },

        _changeSimNav: function(){
            var materialClass = this.model.get("materialClass");
            this.model.set("currentNav", materialClass + "NavSim");
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), plist, materialsPlist, lattice.toJSON());
        },

        template: _.template(template)
    });
});