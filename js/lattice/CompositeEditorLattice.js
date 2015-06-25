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

        makeNewCompositeMaterial: function(dimensions){
            if (this.get("numCells") == 0) {
                console.warn("no cells in this composite");
                return;
            }
            var id = this.get("id");
            materials.setMaterial(id, this.toJSONForSave(dimensions));
        },

        toJSONForSave: function(dimensions){
            var name = this.get("name");
            if (name == "") name = "Composite Material " + compositeNum++;
            if (dimensions) var _dimensions = dimensions.clone();
            var cellsMin = this.get("cellsMin");
            if (cellsMin) cellsMin = cellsMin.clone();
            var cellsMax = this.get("cellsMax");
            if (cellsMax) cellsMax = cellsMax.clone();
            var data = {
                name: name,
                color: this.get("color"),
                altColor: this.get("color"),
                numCells: this.get("numCells"),
                sparseCells: JSON.parse(JSON.stringify(this.sparseCells)),
                cellsMin: cellsMin,
                cellsMax: cellsMax,
                elementaryChildren: this._getChildCellTypes(true),
                compositeChildren: this._getChildCellTypes(false),
                dimensions: _dimensions
            };
            return data;
        },

        _getChildCellTypes: function(elementaryTypes){
            var children = [];
            this._loopCells(this.sparseCells, function(cell){
                if (!cell) return;
                var isComposite = cell.materialName.substr(0,5) == "super";
                if ((elementaryTypes && !isComposite) || (!elementaryTypes && isComposite)) children.push(cell.materialName);
            });
            if (children.length == 0) return null;
            return _.uniq(children);//remove duplicates
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
