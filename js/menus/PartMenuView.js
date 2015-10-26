/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice', 'text!menus/templates/PartMenuView.html'],
    function($, _, MenuParentView, plist, lattice, template){

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(){
            //bind events
            this.listenTo(lattice, "change", this.render);
            this.listenTo(this.model, "change", this.render);
        },

        _makeTemplateJSON: function(){
            return _.extend(lattice.toJSON(), this.model.toJSON(), plist);
        },

        template: _.template(template)
    });
});