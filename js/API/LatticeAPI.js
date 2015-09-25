/**
 * Created by aghassaei on 9/25/15.
 */


define(['lattice', 'plist'], function(lattice){

    return {

        //getters

        getUnits: function(){
            return lattice.getUnits();
        },

        getScale: function(){
            return lattice.getScale();
        },

        getNumCells: function(){
            return lattice.getNumCells();
        },

        getSize: function(){
            return lattice.getSize();
        },

        getBoundingBox: function(){
            return lattice.calculateBoundingBox();
        },

        getAspectRatio: function(){
            return lattice.getAspectRatio();
        },

        getCellType: function(){
            return lattice.getCellType();
        },

        getConnectionType: function(){
            return lattice.getConnectionType();
        },

        getApplicationType: function(){
            return lattice.getApplicationType();
        },

        getPartType: function(){
            return lattice.getPartType();
        },


        //setters

        setAspectRatio: function(x, y, z){
            lattice.setAspectRatio({x:x, y:y, z:z}, false);
        },

        setCellType: function(cellType){
            lattice.setCellType(cellType, false);
        },

        setConnectionType: function(connectionType){
            lattice.setConnectionType(connectionType, false);
        },

        setApplicationType: function(applicationType){
            lattice.setApplicationType(applicationType, false);
        },

        setPartType: function(partType){
            lattice.setPartType(partType, false);
        },

        set: function(data){
            lattice.setLatticeMetaData(data);
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