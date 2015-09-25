/**
 * Created by aghassaei on 9/25/15.
 */


define(['lattice', 'plist'], function(lattice, plist){

    return {

        //getters

        getSize: function(){
            var bBox = lattice.calculateBoundingBox();
            return bBox.max.sub(bBox.min);
        },

        getBoundingBox: function(){
            return lattice.calculateBoundingBox();
        },

        getAspectRatio: function(){
            return lattice.get("aspectRatio").clone();
        },

        getCellType: function(){
            return lattice.get("cellType");
        },

        getConnectionType: function(){
            return lattice.get("connectionType");
        },

        getApplicationType: function(){
            return lattice.get("latticeType");
        },

        getPartType: function(){
            return lattice.get("partType");
        },


        //setters

        setAspectRatio: function(x, y, z){
            if (!x || !y || !z || x<0 || y<0 || z<0) {//no 0, undefined, null, or neg #'s
                console.warn("invalid aspect ratio params");
                return;
            }
            lattice.set("aspectRatio", new THREE.Vector3(x, y, z));
        },

        setCellType: function(cellType){
            if (plist.allLattices[cellType] === undefined){
                console.warn("no cell type " + cellType);
                return;
            }
            return lattice.set("cellType", cellType);
        },

        setConnectionType: function(connectionType){
            var cellType = lattice.get("cellType");
            var plistCellData = plist.allLattices[cellType];
            if (plistCellData[connectionType] === undefined){
                console.warn("no connection type " + connectionType + " for cell type " + plistCellData.name);
                return;
            }
            return lattice.set("connectionType", connectionType);
        },

        setApplicationType: function(applicationType){
            var cellType = lattice.get("cellType");
            var plistCellData = plist.allLattices[cellType];
            var connectionType = lattice.get("connectionType");
            var plistConnectionData = plistCellData[connectionType];
            if (plistConnectionData[applicationType] === undefined){
                console.warn("no application type " + applicationType + " for cell type " + plistCellData.name + " and connection type " + plistConnectionData.name);
                return;
            }
            return lattice.set("latticeType", applicationType);
        },

        setPartType: function(partType){
            var cellType = lattice.get("cellType");
            var plistCellData = plist.allLattices[cellType];
            var connectionType = lattice.get("connectionType");
            var plistConnectionData = plistCellData[connectionType];
            var applicationType = lattice.get("latticeType");
            var plistAppData = plistConnectionData[applicationType];
            if (plistConnectionData[applicationType] === undefined){
                console.warn("no part type " + partType + " for cell type " + plistCellData.name + " and connection type " + plistConnectionData.name + " and application type " + plistAppData.name);
                return;
            }
            return lattice.set("partType", partType);
        },

        setLatticeType: function(cellType, connectionType, applicationType, partType){

        },


        //cells

        clearCells: function(){
            lattice.clearCells();
        },

        getSparseCells: function(){
            return lattice.sparseCells;
        },

        setSparseCells: function(cells){
            lattice.reloadCells(cells);
        },

        getCells: function(){
            return lattice.cells;
        },

        loopSparseCells: function(){

        },

        loopCells: function(){

        },

        addCellAtIndex: function(){

        },

        removeCell: function(cell){
            lattice.removeCell(cell);
        },

        removeCellAtIndex: function(){

        },




        //general

        save: function(filename){

        }
    }

});