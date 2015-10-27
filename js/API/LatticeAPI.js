/**
 * Created by aghassaei on 9/25/15.
 */


define(['lattice', 'plist', 'console'], function(lattice, plist, myConsole){

    return {

        //getters

        getUnits: function(){
            myConsole.write("lattice.getUnits()");
            return lattice.getUnits();
        },

        getScale: function(){
            myConsole.write("lattice.getScale()");
            return lattice.getScale();
        },

        getNumCells: function(){
            myConsole.write("lattice.getNumCells()");
            return lattice.getNumCells();
        },

        getSize: function(){
            myConsole.write("lattice.getSize()");
            return lattice.getSize();
        },

        getBoundingBox: function(){
            myConsole.write("lattice.getBoundingBox()");
            return lattice.getBoundingBox();
        },

        getAspectRatio: function(){
            myConsole.write("lattice.getAspectRatio()");
            return lattice.getAspectRatio();
        },

        getCellType: function(){
            myConsole.write("lattice.getCellType()");
            return lattice.getCellType();
        },

        getConnectionType: function(){
            myConsole.write("lattice.getConnectionType()");
            return lattice.getConnectionType();
        },

        getApplicationType: function(){
            myConsole.write("lattice.getApplicationType()");
            return lattice.getApplicationType();
        },

        getPartType: function(){
            myConsole.write("lattice.getPartType()");
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

        setMetaData: function(data){
            lattice.setMetaData(data);
        },


        //cells

        clearCells: function(){
            lattice.clearCells();
        },

        getSparseCells: function(){
            myConsole.write("lattice.getSparseCells()");
            return lattice.sparseCells;
        },

        setSparseCells: function(cells){
            lattice.setSparseCells(cells);
        },

        getCells: function(){
            myConsole.write("lattice.getCells()");
            return lattice.cells;
        },

        loopSparseCells: function(){
            myConsole.write("lattice.loopSparseCells()");
        },

        loopCells: function(){
            myConsole.write("lattice.loopCells()");

        },

        addCellAtIndex: function(x, y, z, data){
            //parse x, y, z
            //check data is valid json

            lattice.addCellAtIndex(new THREE.Vector3(x, y, z), data);
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