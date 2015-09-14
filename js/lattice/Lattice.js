/**
 * Created by aghassaei on 1/16/15.
 */


define(['underscore', 'backbone', 'appState', 'globals', 'plist', 'three', 'threeModel', 'latticeBase'],
    function(_, Backbone, appState, globals, plist, THREE, three, LatticeBase){

    var Lattice = LatticeBase.extend({

        defaults: _.extend(_.clone(LatticeBase.prototype.defaults), {

            units: "mm",
            scale: 1.0,

            cellType: "cube",
            connectionType: "gik",
            latticeType: "willGik",
            partType: null,

            aspectRatio: null,

            denseCellsMin: null,
            overlapDetected: false,

            nodes: []
        }),


        __initialize: function(){

            this._checkURL();

            this.listenTo(this, "change:partType", this._updatePartType);

            this.listenTo(this, "change:cellType", function(){
                this._cellTypeChanged();
                this._reloadCells();
            });
            this.listenTo(this, "change:connectionType", function(){
                this._connectionTypeChanged();
                this._reloadCells();
            });
            this.listenTo(this, "change:latticeType", function(){
                this._latticeTypeChanged();
                this._reloadCells();
            });
            this.listenTo(this, "change:aspectRatio", function(){
                this._reloadCells();
            });

            this.listenTo(appState, "change:currentNav", this._navChanged);
            this.listenTo(this, "change:cellsMin change:cellsMax", function(){
                this.updateThreeViewTarget();
            });

            this._latticeTypeChanged();
            this._reloadCells();
        },

        _checkURL: function(){
            var path = window.location.path;
//            console.log(path);
        },







        //latticeType

        _cellTypeChanged: function(){
            var cellType = this.get("cellType");
            var connectionType = _.keys(plist.allLattices[cellType].connection)[0];
            this.set("connectionType", connectionType, {silent:true});
            this._connectionTypeChanged();
        },

        _connectionTypeChanged: function(){
            var cellType = this.get("cellType");
            var connectionType = this.get("connectionType");
            var latticeType = _.keys(plist.allLattices[cellType].connection[connectionType].type)[0];
            this.set("latticeType", latticeType, {silent:true});
            this._latticeTypeChanged();
        },

        _latticeTypeChanged: function(){
            var latticeData = this._getLatticePlistData();
            this.set("aspectRatio", latticeData.aspectRatio.clone(), {silent:true});

            var newPartType = null;
            if (latticeData.parts) newPartType = _.keys(latticeData.parts)[0];
            this.set("partType", newPartType, {silent:true});

            var newMaterialClass = (latticeData.materialClasses || _.keys(plist.allMaterialClasses))[0];
            appState.set("materialClass", newMaterialClass);

            if (latticeData.options){
                if (latticeData.options.gikLength) appState.set("gikLength", latticeData.options.gikLength);
            }
        },

        _setDefaultCellMode: function(){//if no part associated with this lattice type
            var latticeData = this._getLatticePlistData();
            if (latticeData.parts === null){
                var currentMode = appState.get("cellMode");
                if (currentMode == "cell" || currentMode == "supercell") return;
                appState.set("cellMode", "cell");
            }
        },

        _getSubclassForLatticeType: function(){
            var cellType = this.get("cellType");
            var connectionType = this.get("connectionType");
            var subclass = plist.allLattices[cellType].connection[connectionType].subclass;
            if (subclass === undefined){
                console.warn("unrecognized cell type " + cellType);
                return null;
            }
            return subclass;
        },

        xScale: function(){
            return this.get("aspectRatio").x;
        },

        yScale: function(){
            return this.get("aspectRatio").y;
        },

        zScale: function(){
            return this.get("aspectRatio").z;
        },







        //events

        __clearCells: function(silent){
            three.removeAllCells();//todo add flag in cell destroy to avoid redundancy here
            this.set("nodes", [], {silent:silent});
            if (globals.basePlane) globals.basePlane.set("zIndex", 0, {silent:silent});
        },

        updateThreeViewTarget: function(target){
            if (target) {
                globals.threeView.setOrbitControlsFor(target);
                return;
            }
            if (!appState.get("focusOnLattice")) return;
            var cellsMin = this.get("cellsMin");
            var cellsMax = this.get("cellsMax");
            if (cellsMax === null || cellsMin === null) return;
            var center = cellsMax.clone().sub(cellsMin).divideScalar(2).add(cellsMin);
            if (globals.threeView && this.getPositionForIndex) globals.threeView.setOrbitControlsFor(this.getPositionForIndex(center));
        },







        //cells array

        _parseSparseCell: function(){

            this.cells = [[[null]]];

            console.log("parse cells");

            if (this.get("numCells") == 0) {
                console.warn("no cells in assembly");
                this.cells = [[[null]]];
                return;
            }

            var bounds = this.calculateBoundingBox();
            this.set("denseCellsMin", bounds.min.clone().add(this.get("cellsMin")));
            var size = bounds.max.sub(bounds.min);

            //create array of nulls
            var cells = [];
            for (var x=0;x<size.x;x++){
                cells.push([]);
                for (var y=0;y<size.y;y++){
                    cells[x].push([]);
                    for (var z=0;z<size.z;z++){
                        cells[x][y].push(null);
                    }
                }
            }

            var min = this.get("cellsMin").sub(bounds.min);
            var overlap = false;
            var forCAM = appState.get("currentNav") == "navAssemble";
            this._loopCells(this.sparseCells, function(cell){
                if (!cell) return;
                overlap |= cell.addToDenseArray(cells, min, forCAM);
            });
            this.set("overlapDetected", overlap);

            this.cells = cells;
        },








        //3d ui

        addHighlightableCell: function(cell){
            three.addCell(cell);
        },

        removeHighlightableCell: function(cell){
            three.removeCell(cell);
        },

        getHighlightableCells: function(){
            return three.getCells();
        },







        //composite Cells

        _navChanged: function(){
            var currentNav = appState.get("currentNav");
            if (currentNav != "navComposite" && this.compositeEditor && this.exitCompositeEditing) this.exitCompositeEditing();
            if (currentNav == "electronicNavSim" || currentNav == "mechanicalNavSim" || currentNav == "navAssemble") this._parseSparseCell();
        },

        getCompositeData: function(){
            if (this.get("numCells") == 0) return null;
            return {
                cellsMin: this.get("cellsMin").clone(),
                cellsMax: this.get("cellsMax").clone(),
                sparseCells: JSON.parse(JSON.stringify(this.sparseCells)),
                numCells: this.get("numCells")
            };
        },

        setToCompositeMode: function(id, data){
            var self = this;
            require(['compositeEditorLattice'], function(CompositeEditorLattice){
                self.hideCells();
                if (self.compositeEditor) {
                    console.warn("composite editor already allocated");
                    self.compositeEditor.destroy();
                }
                self.compositeEditor = new CompositeEditorLattice(_.extend({id:id}, _.omit(data, "sparseCells")), null, function(_self){
                    var cells = null;
                    if (data) cells = data.sparseCells;
                    _self._reloadCells(cells, self._getSubclassForLatticeType());
                    appState.set("currentNav", "navComposite");
                });

            });
        },

        inCompositeMode: function(){
            return this.compositeEditor != null;
        },

        _isSingltonLattice: function(){
            return true;
        },

        exitCompositeEditing: function(){
            if (this.compositeEditor) this.compositeEditor.destroy();
            this.compositeEditor = null;
            this.showCells();
        },

        getUItarget: function(){
            if (this.inCompositeMode()) return this.compositeEditor;
            return this;
        },

        reinitAllCellsOfTypes: function(types){
            this._loopCells(this.sparseCells, function(cell, x, y, z, self){
                if (cell && cell.materialName.substr(0,5) == "super" && types.indexOf(cell.materialName) > -1){
                    //re-init cell;
                    var json = cell.toJSON();
                    json.index = cell.getIndex();
                    self.makeCellForLatticeType(json, function(newCell){
                        self.sparseCells[x][y][z] = newCell;
                        cell.destroy();
                    });
                }
            });
        }
    });



    var lattice = new Lattice();
    appState.setLattice(lattice);
    return lattice;

});