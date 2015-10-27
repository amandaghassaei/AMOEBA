/**
 * Created by aghassaei on 9/25/15.
 */


define(['lattice', 'plist', 'console'], function(lattice, plist, myConsole){

    function _printGetter(output){
        myConsole.log(output);
    }

    return {

        //getters

        getUnits: function(){
            var output = lattice.getUnits();
            _printGetter(output);
            return output;
        },

        getScale: function(){
            var output = lattice.getScale();
            _printGetter(output);
            return output;
        },

        getNumCells: function(){
            var output = lattice.getNumCells();
            _printGetter(output);
            return output;
        },

        getSize: function(){
            var output = lattice.getSize();
            _printGetter(output);
            return output;
        },

        getBoundingBox: function(){
            var output = lattice.getBoundingBox();
            _printGetter(output);
            return output;
        },

        getAspectRatio: function(){
            var output = lattice.getAspectRatio();
            _printGetter(output);
            return output;
        },

        getCellType: function(){
            var output = lattice.getCellType();
            _printGetter(output);
            return output;
        },

        getConnectionType: function(){
            var output = lattice.getConnectionType();
            _printGetter(output);
            return output;
        },

        getApplicationType: function(){
            var output = lattice.getApplicationType();
            _printGetter(output);
            return output;
        },

        getPartType: function(){
            var output = lattice.getPartType();
            _printGetter(output);
            return output;
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