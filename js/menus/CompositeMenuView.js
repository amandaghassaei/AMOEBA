/**
 * Created by aghassaei on 6/10/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice', 'globals', 'materials', 'text!compositeMenuTemplate'],
    function($, _, MenuParentView, plist, lattice, globals, materials, template){

    var dimensions;

    return MenuParentView.extend({

        events: {
            "click #newRandomColor":                                  "_changeRandomColor",
            "click #finishComposite":                                 "_finishComposite",
            "click #saveComposite":                                   "_saveComposite",
            "click #cancelComposite":                                 "_cancelComposite",
            "click #deleteComposite":                                 "_deleteComposite"
        },

        _initialize: function(){

            if (!lattice.compositeEditor) {
                console.warn("no composite editor inited");
                return;
            }
            this.listenTo(lattice.compositeEditor, "change", function(){
                if (lattice.compositeEditor.changedAttributes().numCells !== undefined) dimensions = lattice.compositeEditor.calculateBoundingBox();
                this.render();
            });
            this.listenTo(this.model, "change", this.render);

            dimensions = lattice.compositeEditor.calculateBoundingBox();
        },

        _changeRandomColor: function(e){
            e.preventDefault();
            lattice.compositeEditor._changeRandomColor();
        },

        updateHex: function(hex){
            //update hex without rendering
            $("#compositeColor").css("border-color", hex);
        },

        _finishComposite: function(e){
            e.preventDefault();
            this.stopListening();
            if (!lattice.compositeEditor){
                console.warn("lattice not in composite mode for finish composite call");
                this._exit();
                return;
            }
            lattice.compositeEditor.makeNewCompositeMaterial($("#compositeName").val(), dimensions.clone());
            this._exit();
        },

        _saveComposite: function(e){
            e.preventDefault();
        },

        _cancelComposite: function(e){
            e.preventDefault();
            this._exit();
        },

        _deleteComposite: function(e){
            e.preventDefault();
            if (!lattice.compositeEditor){
                console.warn("lattice not in composite mode for delete composite call");
                this._exit();
                return;
            }
            lattice.compositeEditor.deleteComposite();
            this._exit();
        },

        _exit: function(){
            this.model.set("currentNav", "navDesign");
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), plist, globals, lattice.compositeEditor.toJSON(),
                {
                    dimensions: dimensions,
                    materials: materials
                });
        },

        template: _.template(template)
    });
});