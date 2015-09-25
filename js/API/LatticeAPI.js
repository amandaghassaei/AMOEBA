/**
 * Created by aghassaei on 9/25/15.
 */


define(['lattice', 'plist'], function(lattice, plist){

    return {

        //getters

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
            lattice.setAspectRatio(x, y, z);
        },

        setCellType: function(cellType){
            lattice.setCellType(cellType);
        },

        setConnectionType: function(connectionType){
            lattice.setConnectionType(connectionType);
        },

        setApplicationType: function(applicationType){
            lattice.setApplicationType(applicationType);
        },

        setPartType: function(partType){
            lattice.setPartType(partType);
        },

        setLatticeType: function(cellType, connectionType, applicationType, partType){
            lattice.setLatticeType(cellType, connectionType, applicationType, partType);
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