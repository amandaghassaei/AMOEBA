/**
 * Created by aghassaei on 9/25/15.
 */


define(['lattice'], function(lattice){

    return {

        //getters

        getSize: function(){

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

        },

        setConnectionType: function(connectionType){

        },

        setApplicationType: function(applicationType){

        },

        setPartType: function(partType){

        },

        setLatticeType: function(cellType, connectionType, applicationType, partType){

        },


        //cells

        clearCells: function(){
            lattice.clearCells();
        },

        getSparseCells: function(){

        },

        getCells: function(){

        },

        loopSparseCells: function(){

        },

        loopCells: function(){

        },

        addCellAtIndex: function(){

        },

        removeCellAtIndex: function(){

        },




        //general

        save: function(filename){

        }
    }

});