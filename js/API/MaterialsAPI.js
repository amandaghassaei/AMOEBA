/**
 * Created by aghassaei on 9/25/15.
 */


define(['materials', 'console'], function(materials, myConsole){

    function _printGetter(output){
        myConsole.log(output);
    }

    return {

        newMaterial: function(json){//create a new material
            return materials.newMaterial(json);//return DMAMaterial object
        },

        destroy: function(material){
            materials.deleteMaterial(material.getID());
        },

        getMaterialForId: function(id){
            var output = materials.getMaterialID(id);
            _printGetter(output);
            return output;
        },

        getMaterials: function(){

        },

        getCompositeMaterials: function(){

        },

        bulkChangeMaterial: function(startMaterial, endMaterial){

        }

    }

});