/**
 * Created by aghassaei on 5/25/15.
 */


define(['underscore', 'fileSaverLib', 'lattice', 'materials', 'ribbon', 'menuWrapper', 'globals'],
    function(_, saveAs, lattice, materials, ribbon, menuWrapper, globals){

    function _saveFile(data, name, extension){
//        require(['jsonFn'], function(JSONfn){
//        console.log(data.toString());
            var jsonString = JSON.stringify(data, null, '\t');

            //if (noQuotes){
            //    jsonString = jsonString.replace(/"/g, '');
            //}

            saveData(jsonString, name, extension);
//        });
    }

    function saveData(data, name, extension){
        var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        saveAs(blob, name + "." + extension);
    }

//    function save(name){
//        if (!name || name == "" || name == undefined) name = "file";
//        var data = {
//            lattice:_getLatticeDataToSave(),
////            assembler:_getAssemblerDataToSave()
//        };
//        _saveFile(data, name, "json");
//    }

    function save(name){
        if (!name || name == "" || name == undefined) name = "DM Assembly";
        var data = {
            assembly:_getLatticeDataToSave(),
            materials:_getMaterialsDataToSave()
        };
        require(["emSim"], function(emSim){
            data.emSim = emSim.getSaveData();
            _saveFile(data, name, "json");
        });
    }

    function generateSaveString(){
        var data = {
            assembly:_getLatticeDataToSave(),
            materials:_getMaterialsDataToSave()
        };
        var jsonString = JSON.stringify(data, null, '\t');
        return jsonString;
    }



    function saveMaterial(material){
        var data = {materials:{}};
        data.materials[material.getID()] = material.toJSON();
        _saveFile(data, material.getName(), "json");
    }

    function saveMachineConfig(data){
        _saveFile(data, "Machine Config", "json");
    }

    function _getLatticeDataToSave(){
        return lattice.getSaveJSON();
    }

    function _getMaterialsDataToSave(){
        var data = {};
        _.each(materials.list, function(material, key){
            data[key] = material.toJSON();
        });
        return data;
    }


    function loadFile(data){//parsed json todo make this better - load composite
        if (!data.materials){
            console.warn("no material definitions in this file");
            return;
        }
        _.each(_.keys(data.materials), function(key){
            materials.setMaterial(key, data.materials[key]);
        });
        if (!data.assembly){
            console.warn("no assembly in this file");
            return;
        }
        lattice.clearCells();
        var cells = data.assembly.cells;
        _setData(lattice, _.omit(data.assembly, "cells"));
        if (cells) lattice.setCells(cells);
        ribbon.render();
        menuWrapper.render();
        if (data.emSim){
            require(["emSim"], function(emSim){
                emSim.loadData(data.emSim);
            });
        }
    }

    function _setData(object, data){
        _.each(_.keys(data), function(key){
            if (data[key] && data[key].x){//vector object
                object.set(key, new THREE.Vector3(data[key].x, data[key].y, data[key].z), {silent:true});
                return;
            }
            object.set(key, data[key], {silent:true});
        });
        object.trigger("change");
    }

    function saveSTL(){
        require(['stlExport'], function(geometryToSTLBin){
            //merge geometry first
            var geoArray = [];
            lattice.loopCells(function(cell){
                if (cell) geoArray = geoArray.concat(cell.getVisibleGeometry());
            });
            var stlBin = geometryToSTLBin(geoArray);
            if (!stlBin) return;
            var blob = new Blob([stlBin], {type: 'application/octet-binary'});
            saveAs(blob, "DM.stl");
        });
    }

    function saveConsoleScript(data){
        saveData(data, "script", "js");
    }

    var publicMethods = {//return public methods
//        save: save,
        save: save,
        saveData: saveData,
        generateSaveString: generateSaveString,
        saveMaterial: saveMaterial,
        saveMachineConfig: saveMachineConfig,
        loadFile: loadFile,
        saveSTL: saveSTL,
        saveConsoleScript: saveConsoleScript
    };

    globals.set("fileSaver", publicMethods);

    return publicMethods;
});