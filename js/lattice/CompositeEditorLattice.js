/**
 * Created by aghassaei on 6/10/15.
 */


define(['underscore', 'backbone', 'appState', 'globals', 'plist', 'three', 'threeModel', 'latticeBase', 'materials'],
    function(_, Backbone, appState, globals, plist, THREE, three, LatticeBase, materials){

    function makeRandomColor(){
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    var compositeNum = 1;

    var CompositeEditorLattice = LatticeBase.extend({

        defaults: _.extend(LatticeBase.prototype.defaults, {
            name: "",
            color: null,
            origin: new THREE.Vector3(0,0,0)
        }),

        __initialize: function(options, callback){

            if (!options.id || options.id == "") this.set("id", "super" + this.cid);
            else {
                //change material type to allowed type
                var currentMaterial = appState.get("materialType");
                if (currentMaterial.substr(0,5) == "super"){
                    if (materials.getVaildAvailableCompositeKeys(options.id).indexOf(currentMaterial) < 0){
                        materials.setToDefaultMaterial(true);
                    }
                }
            }



            if (!options.color || options.color == "") this.set("color",  makeRandomColor(), {silent:true});

            if (callback) callback(this);
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






        //composite events

        _changeRandomColor: function(){
            this.set("color", makeRandomColor());
        },


        makeNewCompositeMaterial: function(bounds){
            if (this.get("numCells") == 0) {
                console.warn("no cells in this composite");
                return;
            }
            var id = this.get("id");
            var data = this.toJSONForSave(bounds);
            materials.setMaterial(id, data);
        },

        toJSONForSave: function(bounds){
            var name = this.get("name");
            if (name == "") name = "Composite Material " + compositeNum++;
            if (bounds) var _dimensions = bounds.max.clone().sub(bounds.min);
            var cellsMin = this.get("cellsMin");
            var cellsMax = this.get("cellsMax");
            if (cellsMax) {
//                console.log(bounds.min);
                cellsMax = cellsMax.clone();
                cellsMax.sub(cellsMin).sub(bounds.min);
                cellsMin = new THREE.Vector3(0,0,0).sub(bounds.min);
            }
            var data = {
                name: name,
                color: this.get("color"),
                altColor: this.get("color"),
                numCells: this.get("numCells"),
                sparseCells: JSON.parse(JSON.stringify(this.sparseCells)),
                cellsMin: cellsMin,
                cellsMax: cellsMax,
                elementaryChildren: materials.getChildCellTypes(this.sparseCells, true),
                compositeChildren: materials.getChildCellTypes(this.sparseCells, false),
                dimensions: _dimensions,
                properties: {

                }
            };
            return data;
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
