/**
 * Created by aghassaei on 2/25/15.
 */

define(['jquery', 'underscore', 'menuParent', 'materialsPlist', 'plist', 'lattice', 'globals', 'materials', 'text!menus/templates/MaterialMenuView.html'],
    function($, _, MenuParentView, materialsPlist, plist, lattice, globals, materials, template){

    return MenuParentView.extend({

        events: {
            "click #newComposite":                                   "_newComposite",
            "click #compositeFromLattice":                           "_latticeToComposite",
            "click .editComposite":                                  "_editComposite",
            "click .editMaterial":                                   "_editMaterial",
            "click #newElementaryMaterial":                          "_newMaterial"
        },

        _initialize: function(){
            //bind events
            this.listenTo(lattice, "change", this.render);
            this.listenTo(this.model, "change", this.render);
        },

        _newComposite: function(e){
            e.preventDefault();
            this._openCompositeEditor();
        },

        _editComposite: function(e){
            e.stopPropagation();
            e.preventDefault();
            this._openCompositeEditor($(e.target).data("id"));
        },

        _latticeToComposite: function(e){
            e.preventDefault();
            this._openCompositeEditor("fromLattice");
        },

        _openCompositeEditor: function(compositeID){
            require(['menuWrapper'], function(menuWrapper){
                menuWrapper.initTabWithObject(compositeID, "composite", "navComposite")
            });
        },

        _editMaterial: function(e){
            e.stopPropagation();
            e.preventDefault();
            this._openMaterialEditor($(e.target).data("id"));
        },

        _newMaterial: function(e){
            e.preventDefault();
            this._openMaterialEditor();
        },

        _openMaterialEditor: function(materialID){
            require(['menuWrapper'], function(menuWrapper){
                menuWrapper.initTabWithObject(materialID, "materialEditor", "navMaterial")
            });
        },

        _makeTemplateJSON: function(){
            return _.extend(lattice.toJSON(), this.model.toJSON(), materialsPlist, plist, globals, {inSimMode:false, materials:materials.list, compositeMaterialsKeys:materials.getCompositeKeys()});
        },

        template: _.template(template)
    });
});