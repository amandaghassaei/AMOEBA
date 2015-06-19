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
            color: null
        }),

        __bindEvents: function(){
        },

        __initialize: function(options, callback){
            if (!options.id || options.id == "") this.set("id", "super" + this.cid);
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

        makeNewCompositeMaterial: function(name, dimensions){
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
                sparseCells: JSON.parse(JSON.stringify(this.sparseCells)),
                cellsMin: this.get("cellsMin").clone(),
                cellsMax: this.get("cellsMax").clone(),
                dimensions: dimensions
            };
            if (!materials[id]) materials[id] = {};
            _.extend(materials[id], data);//todo trigger change on all instances
            if (materials[id].threeMaterial) materials[id].threeMaterial.color = new THREE.Color(this.get("color"));
            else materials[id].threeMaterial = new THREE.MeshLambertMaterial({color:new THREE.Color(this.get("color")), shading:THREE.FlatShading})
        },

        deleteComposite: function(){
            var id = this.get("id");
            delete materials[id];//todo check if being used first
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
