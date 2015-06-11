/**
 * Created by aghassaei on 6/10/15.
 */


define(['underscore', 'backbone', 'appState', 'lattice', 'globals', 'plist', 'three', 'threeModel'],
    function(_, Backbone, appState, lattice, globals, plist, THREE, three){

    var defaults = {
        compositeId: null,
        compositeColor: makeRandomColor(),
        numCompositeCells:0,
        compositeCellsMin: null,
        compositeCellsMax: null
    };

    function makeRandomColor(){
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    var CompositeEditorLattice = {



        _initCompositeEditor: function(id, data){

            var self = this;
            _.each(_.keys(defaults), function(key){
                self.set(key, defaults[key], {silent:true});
            });
            this.compositeCells = [[[null]]];

            if (data){
                _.each(_.keys(data), function(key){
                    self.set(key, defaults[key], {silent:true});
                });
                this.compositeCells = data.cells;//todo
                this.set("compositeId", id, {silent:true});
            }
        },

        _changeRandomColor: function(){
            this.set("compositeColor", makeRandomColor());
        },

        _makeNewCompositeMaterial: function(name){
            var id = this.get("compositeId");
            var data = {
                name: name,
                color: this.get("compositeColor"),
                altColor: this.get("compositeColor"),
                numCells: this.get("numCompositeCells"),
                dimensions: new THREE.Vector3.subVectors(this.get("compositeCellsMax"), this.get("compositeCellsMin"))
            };
            globals.materials.id = data;//todo trigger change on all instances
        },

        _undoCompositeEditor: function(){
            console.log("undo");
            var self = this;
            _.each(_.keys(CompositeEditorLattice), function(key){
                self[key] = null;
            });
            _.each(_.keys(defaults), function(key){
                self.unset(key, {silent:true});
            });
            this.compositeCells = null;
        }
    };

    return CompositeEditorLattice;
});
