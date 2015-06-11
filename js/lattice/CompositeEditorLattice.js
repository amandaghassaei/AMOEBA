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
            name: "",
            color: null
        }),

        __initialize: function(options, callback){
            if (!options.id || options.id == "") this.set("id", this.cid);
            if (!options.color || options.color == "") this.set("color",  makeRandomColor(), {silent:true});
            if (callback) callback(this);
        },

        initLatticeSubclass: function(subclass){
            var self = this;
            require([subclass], function(subclassObject){
                _.extend(self, subclassObject);

//                //copy over cells to new lattice type
//                var cells = self.cells;
//                self._loopCells(cells, function(cell, x, y, z){
//                    if (!cell) return;
//                    var index = _.clone(cell.index);
//                    if (cell.destroy) cell.destroy();
//                    self.makeCellForLatticeType(index, function(newCell){
//                        cells[x][y][z] = newCell;
//                    });
//                });
//                three.render();
            });
        },



        

        //3d ui

        addHighlightableCell: function(cell){
            three.addCompositeCell(cell);
        },

        removeHighlightableCell: function(cell){
            three.removeCompositeCell(cell);
        },

        getHighlightableCells: function(){
            return three.getCompositeCells();
        },







        _changeRandomColor: function(){
            this.set("color", makeRandomColor());
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
                color: this.get("color"),
                altColor: this.get("color"),
                numCells: this.get("numCells"),
                cells: JSON.parse(JSON.stringify(this.sparseCells)),
                cellsMin: this.get("cellsMin").clone(),
                cellsMax: this.get("cellsMax").clone(),
                dimensions: new THREE.Vector3().subVectors(this.get("cellsMax"), this.get("cellsMin"))
            };
            globals.materials.compositeMaterials[id] = data;//todo trigger change on all instances
        },

        deleteComposite: function(){
            var id = this.get("id");
            delete globals.materials.compositeMaterials[id];//todo trigger change on all instances
        },







        //deallocate

        __clearCells: function(silent){
            three.removeAllCompositeCells();//todo add flag in cell destroy to avoid redundancy here
        },

        destroy: function(){
            this.clearCells(true);
            var self = this;
            _.each(_.keys(this.attributes), function(key){
                self.set(key, null, {silent:true});
                self.unset(key, {silent:true});
            });
        }
    });

    return CompositeEditorLattice;
});
