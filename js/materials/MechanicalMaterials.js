/**
 * Created by aghassaei on 6/4/15.
 */


define(['underscore', 'three', 'appState', 'plist', 'materials'], function(_, THREE, appState, plist, DMAMaterials){

    function MechanicalMaterials(){
       DMAMaterials.call(this, plist.allMaterials.mechanical);
    }
    MechanicalMaterials.prototype = Object.create(DMAMaterials.prototype);

    var material = new MechanicalMaterials();

    return {
        changeMaterials: material.changeMaterials,
        materials: material.materials
    }
});