/**
 * Created by aghassaei on 5/25/15.
 */


define(['underscore', 'fileSaverLib', 'lattice'],
    function(_, saveAs, lattice){

    function _saveFile(data, name, extension){
        var jsonString = JSON.stringify(data, null, '\t');
        saveData(jsonString, name, extension);
    }

    function saveData(data, name, extension){
        var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        saveAs(blob, name + "." + extension);
    }

    function save(name) {
        if (!name || name == "" || name == undefined) name = "My Assembly";
        var data = {
            lattice: lattice.toJSON(),
            assembly: _getAssemblyDataToSave()
            // materials: _getMaterialsDataToSave()
        };
        // require(["emSim"], function(emSim){
        //     data.emSim = emSim.getSaveData();
        _saveFile(data, name, "json");
        // });
    }

    // function saveMaterial(material){
    //     var data = {materials:{}};
    //     data.materials[material.getID()] = material.toJSON();
    //     _saveFile(data, material.getName(), "json");
    // }
    //
    function _getAssemblyDataToSave(){
        return lattice.getAssemblySaveData();
    }
    //
    // function _getMaterialsDataToSave(){
    //     var data = {};
    //     _.each(materials.list, function(material, key){
    //         data[key] = material.toJSON();
    //     });
    //     return data;
    // }


    // function loadFile(data){//parsed json todo make this better - load composite
    //     if (!data.materials){
    //         console.warn("no material definitions in this file");
    //         return;
    //     }
    //     _.each(_.keys(data.materials), function(key){
    //         materials.setMaterial(key, data.materials[key]);
    //     });
    //     if (!data.assembly){
    //         console.warn("no assembly in this file");
    //         return;
    //     }
    //     lattice.clearCells();
    //     var cells = data.assembly.cells;
    //     _setData(lattice, _.omit(data.assembly, "cells"));
    //     if (cells) lattice.setCells(cells);
    //     ribbon.render();
    //     menuWrapper.render();
    //     if (data.emSim){
    //         require(["emSim"], function(emSim){
    //             emSim.loadData(data.emSim);
    //         });
    //     }
    // }

    // function _setData(object, data){
    //     _.each(_.keys(data), function(key){
    //         if (data[key] && data[key].x){//vector object
    //             object.set(key, new THREE.Vector3(data[key].x, data[key].y, data[key].z), {silent:true});
    //             return;
    //         }
    //         object.set(key, data[key], {silent:true});
    //     });
    //     object.trigger("change");
    // }

    // function saveSTL(){
    //     require(['stlExport'], function(geometryToSTLBin){
    //         //merge geometry first
    //         var geoArray = [];
    //         lattice.loopCells(function(cell){
    //             if (cell) geoArray = geoArray.concat(cell.getVisibleGeometry());
    //         });
    //         var stlBin = geometryToSTLBin(geoArray);
    //         if (!stlBin) return;
    //         var blob = new Blob([stlBin], {type: 'application/octet-binary'});
    //         saveAs(blob, "DM.stl");
    //     });
    // }

    return {
        save: save,
        saveData: saveData,
        // saveMaterial: saveMaterial
    };
});