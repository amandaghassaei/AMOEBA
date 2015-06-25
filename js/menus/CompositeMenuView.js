/**
 * Created by aghassaei on 6/10/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice', 'globals', 'materials', 'text!compositeMenuTemplate', 'fileSaver'],
    function($, _, MenuParentView, plist, lattice, globals, materials, template, fileSaver){

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

        getPropertyOwner: function($target){
            if ($target.hasClass("compositeEditor")) return lattice.compositeEditor;
            return null;
        },

        updateHex: function(hex, $target){
            //update hex without rendering
            $target.css("border-color", hex);
        },

        _finishComposite: function(e){
            e.preventDefault();
            this.stopListening();
            if (!lattice.compositeEditor){
                console.warn("lattice not in composite mode for finish composite call");
                this._exit();
                return;
            }
            lattice.compositeEditor.makeNewCompositeMaterial(dimensions.clone());
            this._exit();
        },

        _saveComposite: function(e){
            e.preventDefault();
            fileSaver.saveMaterial(lattice.compositeEditor.get("id"), lattice.compositeEditor.toJSONForSave(dimensions));
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
            var deleted = materials.setMaterial(lattice.compositeEditor.get("id"), null);
            if (deleted) this._exit();
        },

        _exit: function(){
            this.model.set("currentNav", "navDesign");
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), plist, globals, lattice.compositeEditor.toJSON(),
                {
                    dimensions: dimensions,
                    materials: materials.list,
                    validCompositeMaterials: materials.getVaildAvailableCompositeKeys(lattice.compositeEditor.get("id"))
                });
        },

        template: _.template(template)
    });
});