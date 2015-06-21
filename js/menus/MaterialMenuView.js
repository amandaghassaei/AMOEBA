/**
 * Created by aghassaei on 2/25/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice', 'globals', 'materials', 'text!materialMenuTemplate'],
    function($, _, MenuParentView, plist, lattice, globals, materials, template){

    return MenuParentView.extend({

        events: {
            "click #navToCompositeMenu":                             "_navToCompositeMenu",
            "click #compositeFromLattice":                           "_latticeToComposite",
            "click .editComposite":                                  "_editComposite"
        },

        _initialize: function(){
            //bind events
            this.listenTo(lattice, "change", this.render);
            this.listenTo(this.model, "change", this.render);
        },

        _navToCompositeMenu: function(e){
            e.preventDefault();
            lattice.setToCompositeMode();
        },

        _editComposite: function(e){
            e.stopPropagation();
            e.preventDefault();
            var id = $(e.target).data("id");
            lattice.setToCompositeMode(id, materials[id]);
        },

        _latticeToComposite: function(e){
            lattice.setToCompositeMode(null, lattice.getCompositeData());
            lattice.clearCells();
            e.preventDefault();
        },

        _makeTemplateJSON: function(){
            return _.extend(lattice.toJSON(), this.model.toJSON(), plist, globals, {materials:materials});
        },

        template: _.template(template)
    });
});