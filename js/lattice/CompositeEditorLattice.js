/**
 * Created by aghassaei on 6/10/15.
 */


define(['underscore', 'backbone', 'appState', 'globals', 'plist', 'three', 'threeModel', 'latticeBase'],
    function(_, Backbone, appState, globals, plist, THREE, three, LatticeBase){

    function makeRandomColor(){
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    var compositeNum = 1;

    var CompositeEditorLattice = LatticeBase.extend({

        defaults: _.extend(LatticeBase.prototype.defaults, {
            compositeName: "",
            compositeColor: makeRandomColor()
        }),

        __initialize: function(options){
            console.log(options);
            this.set("id", this.cid);
        },

        initLatticeSubclass: function(subclass){
            var self = this;
            require([subclass], function(subclassObject){

                _.extend(self, subclassObject);

                //copy over cells to new lattice type
                var cells = self.cells;
                self._loopCells(cells, function(cell, x, y, z){
                    if (!cell) return;
                    var index = _.clone(cell.index);
                    if (cell.destroy) cell.destroy();
                    self.makeCellForLatticeType(index, function(newCell){
                        cells[x][y][z] = newCell;
                    });
                });
                three.render();
            });
        },

        _changeRandomColor: function(){
            this.set("compositeColor", makeRandomColor());
        },

        makeNewCompositeMaterial: function(name){
            if (this.get("numCells") == 0) {
                console.warn("no cells in this composite");
                return;
            }
            if (name == "") name = "Composite Material " + compositeNum++;
            var id = this.get("id");
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
            var id = this.get("id");
            delete globals.materials.compositeMaterials[id];//todo trigger change on all instances
        },

        destroy: function(){
            var self = this;
            _.each(_.keys(CompositeEditorLattice), function(key){
                self[key] = null;
            });
            _.each(_.keys(defaults), function(key){
                self.unset(key, {silent:true});
            });
            this.compositeCells = null;
            lattice.showCells();
        }
    });

    return CompositeEditorLattice;
});
