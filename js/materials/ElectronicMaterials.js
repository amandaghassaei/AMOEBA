/**
 * Created by aghassaei on 6/3/15.
 */


define(['underscore', 'three', 'appState', 'plist'], function(_, THREE, appState, plist){
    
    var materials = {};
    var materialList = plist.allMaterialTypes.cube.gik;
    
    function changeMaterials(){
        _.each(_.keys(materialList), function(material){
            if (appState.get("realisticColorScheme")) {
                if (materials[material]) materials[material].color = new THREE.Color(materialList[material].color);
                else materials[material] = new THREE.MeshLambertMaterial({color:materialList[material].color});
                if (materialList[material].opacity){
                    materials[material].transparent = true;
                    materials[material].opacity = materialList[material].opacity;
                } else {
                    materials[material].transparent = false;
                }
            }
            else {
                if (materials[material]) materials[material].color = new THREE.Color(materialList[material].altColor);
                else materials[material] = new THREE.MeshLambertMaterial({color:materialList[material].altColor});
                materials[material].transparent = false;
            }
        });
    }
    changeMaterials();
    
    return {
        changeMaterials: changeMaterials,
        materials: materials
    }
});