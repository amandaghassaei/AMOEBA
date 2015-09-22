/**
 * Created by aghassaei on 6/10/15.
 */

define(['jquery', 'underscore', 'menuParent', 'compositeEditorLattice', 'plist', 'lattice', 'globals', 'materials', 'text!compositeMenuTemplate'],
    function($, _, MenuParentView, CompositeEditorLattice, plist, lattice, globals, materials, template){

    var bounds;

    return MenuParentView.extend({

        events: {
            "click #newRandomColor":                                  "_changeRandomColor",
            "click #saveComposite":                                   "_saveCompositeToFile"
        },

        _initialize: function(options){

            var id = options.myObject;
            if (!id) {
                console.warn("no composite editor id");
                return;
            }
            var compositeData = {};
            if (id == "fromLattice"){
                id = materials.getNextCompositeID();
                compositeData = lattice.getCompositeData();
                lattice.clearCells();
            } else if (options.myObject == "new"){
                id = materials.getNextCompositeID();
            } else {
                compositeData = materials.getMaterialForId(id);
            }

            this.composite = this._setToCompositeMode(id, compositeData);

            var self = this;
            this.listenTo(this.composite, "change", function(){
                if (this.composite.changedAttributes().numCells !== undefined) bounds = this.composite.calculateBoundingBox();
                self.render();
            });
            bounds = this.composite.calculateBoundingBox();
            this.listenTo(this.model, "change", this.render);
        },

        _setToCompositeMode: function(id, data){
            lattice.hideCells();
            if (lattice.inCompositeMode()) {
                console.warn("composite editor already allocated");
                lattice.exitCompositeEditing();
            }
            var compositeLattice = new CompositeEditorLattice(_.extend({id:id}, _.omit(data, "sparseCells")), null, function(_composite){
                var cells = null;
                if (data) cells = data.sparseCells;
                _composite._reloadCells(cells, lattice._getSubclassForLatticeType());
            });

            lattice.setToCompositeMode(compositeLattice);
            return compositeLattice;
        },



        _changeRandomColor: function(e){
            e.preventDefault();
            this.composite._changeRandomColor();
        },

        getPropertyOwner: function($target){
            if ($target.hasClass("compositeEditor")) return this.composite;
            return null;
        },

        updateHex: function(hex, $target){
            //update hex without rendering
            $target.css("border-color", hex);
        },

        _saveCompositeToFile: function(e){
            e.preventDefault();
            require(['fileSaver'], function(fileSaver){
                fileSaver.saveMaterial(this.composite.get("id"), this.composite.toJSONForSave(bounds));
            });
        },

        saveExitMenu: function(){
            this.stopListening();
            if (!this.composite){
                console.warn("lattice not in composite mode for finish composite call");
                return false;
            }
            this.composite.makeNewCompositeMaterial(bounds);
            return true;
        },

        deleteExitMenu: function(){
            if (!this.composite){
                console.warn("lattice not in composite mode for delete composite call");
                return true;
            }
            var deleted = materials.deleteMaterial(this.composite.get("id"));
            return deleted;
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), plist, globals, this.composite.toJSON(),
                {
                    dimensions: bounds.max.clone().sub(bounds.min),
                    materials: materials.list,
                    validCompositeMaterials: materials.getVaildAvailableCompositeKeys(this.composite.get("id"))
                });
        },

        template: _.template(template)
    });
});