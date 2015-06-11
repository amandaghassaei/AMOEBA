/**
 * Created by aghassaei on 6/10/15.
 */


define(['underscore', 'backbone', 'appState', 'lattice', 'globals', 'plist', 'three', 'threeModel'],
    function(_, Backbone, appState, lattice, globals, plist, THREE, three){

    function makeRandomColor(){
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    var defaults = {};
    var compositeId = 0;

    var CompositeEditorLattice = {

        _initCompositeEditor: function(id, data){

            _.extend(defaults, {
                compositeId: "composite"+compositeId++,//todo real unique id
                compositeColor: makeRandomColor(),
                numCompositeCells:2,
                compositeCellsMin: new THREE.Vector3(0,0,0),//null,
                compositeCellsMax: new THREE.Vector3(2,4,5)//null
            });

            var self = this;
            _.each(_.keys(defaults), function(key){
                self.set(key, defaults[key], {silent:true});
            });
            this.compositeCells = [[[null]]];

            if (data){
                _.each(_.keys(data), function(key){
                    self.set(key, defaults[key], {silent:true});
                });
                this.compositeCells = data.cells;//todo parse cells
                this.set("compositeId", id, {silent:true});
            }
        },

        _changeRandomColor: function(){
            this.set("compositeColor", makeRandomColor());
        },

        makeNewCompositeMaterial: function(name){
            if (this.get("numCompositeCells") == 0) {
                console.warn("no cells in this composite");
                return;
            }
            var id = this.get("compositeId");
            var data = {
                name: name,
                color: this.get("compositeColor"),
                altColor: this.get("compositeColor"),
                numCells: this.get("numCompositeCells"),
                cells: JSON.parse(JSON.stringify(this.compositeCells)),
                cellsMin: this.get("compositeCellsMin").clone(),
                cellsMax: this.get("compositeCellsMax").clone(),
                dimensions: new THREE.Vector3().subVectors(this.get("compositeCellsMax"), this.get("compositeCellsMin"))
            };
            globals.materials.compositeMaterials[id] = data;//todo trigger change on all instances
            console.log(data);
        },

        _undoCompositeEditor: function(){
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
