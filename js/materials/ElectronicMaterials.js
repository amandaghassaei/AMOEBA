/**
 * Created by aghassaei on 6/3/15.
 */


define(['underscore', 'three', 'appState', 'plist', 'materials'], function(_, THREE, appState, plist, DMAMaterials){
    
    function ElectronicMaterials(){
       DMAMaterials.call(this, plist.allMaterials.electronic);
    }
    ElectronicMaterials.prototype = Object.create(DMAMaterials.prototype);

    return new ElectronicMaterials();
});