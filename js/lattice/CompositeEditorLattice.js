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

            if (!id) id = "composite" + ++compositeId;//todo real unique id here
            this.set("compositeId", id, {silent:true});

            _.extend(defaults, {
                compositeName: "",
                compositeColor: makeRandomColor(),
                compositeNumCells:2,
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
                    self.set("composite" + key.charAt(0).toUpperCase() + key.slice(1), data[key]);
                });
                this.compositeCells = data.cells;//todo parse cells
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
            if (name == "") name = "Composite Material " + compositeId;
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
        },

        deleteComposite: function(){
            var id = this.get("compositeId");
            delete globals.materials.compositeMaterials[id];//todo trigger change on all instances
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
            this.showCells();
        },
    };

    return CompositeEditorLattice;
});
