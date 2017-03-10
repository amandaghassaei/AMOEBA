/**
 * Created by amandaghassaei on 3/9/17.
 */

//all stls
//all textures
//all materials
define(["underscore", "materialsPlist", "Material"], function(_, materialPlist, Material){

    var allSTLs = {};
    var allTextures = {};
    var allMaterials = {};

    //init default materials
    _.each(materialPlist.allMaterials, function(materialJSON, id){
        allMaterials[id] = new Material(materialJSON);
    });

});