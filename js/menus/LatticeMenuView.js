/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice', 'text!menus/templates/LatticeMenuView.html'],
    function($, _, MenuParentView, plist, lattice, template){

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(){
            this.listenTo(lattice, "change", this.render);
        },

        _makeTemplateJSON: function(){
            return _.extend(lattice.toJSON(), plist);
        },

        template: _.template(template)
    });
});