/**
 * Created by aghassaei on 9/25/15.
 */


define(['materials'], function(materials){


    return {

        init: function(json){//create a new material
            return materials.newMaterial(json);//return DMAMaterial object
        },

        destroy: function(material){
            materials.deleteMaterial(material.getID());
        },

        getMaterialForId: function(id){
            return materials.getMaterialForId(id);
        },

        getMaterials: function(){

        },

        getCompositeMaterials: function(){

        },

        bulkChangeMaterial: function(startMaterial, endMaterial){

        }

    }

});