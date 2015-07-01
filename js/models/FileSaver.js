/**
 * Created by aghassaei on 5/25/15.
 */


define(['underscore', 'fileSaverLib', 'lattice', 'materials', 'ribbon', 'menuWrapper'], function(_, saveAs, lattice, materials, ribbon, menuWrapper){

    function _saveFile(data, name, extension){
        var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        saveAs(blob, name + extension);
    }

//    function save(name){
//        if (!name || name == "" || name == undefined) name = "file";
//        var data = JSON.stringify({
//            lattice:_getLatticeDataToSave(),
////            assembler:_getAssemblerDataToSave()
//        });
//        _saveFile(data, name, ".json");
//    }

    function save(name){
        if (!name || name == "" || name == undefined) name = "DM Assembly";
        var data = JSON.stringify({
            assembly:_getLatticeDataToSave(),
            materials:_getMaterialsDataToSave()
        });
        _saveFile(data, name, ".json");
    }

    function saveAssembler(){

    }

    function saveUser(name){
        if (!name || name == "" || name == undefined) name = "user";
        var latticeData = _.omit(_getLatticeDataToSave(), ["cells", "cellsMin", "cellsMax", "numCells"]);
        var assemblerData = _.omit(_getAssemblerDataToSave(), ["dataOut", "needsPostProcessing", "editsMadeToProgram"]);
        var data = JSON.stringify({
            lattice:latticeData,
            assembler:assemblerData
        });
        _saveFile(data, name, ".user");
    }

    function saveMaterial(id, material){
        var data = {materials:{}};
        data.materials[id] = material || _getMaterialDataToSave(id);
        _saveFile(JSON.stringify(data), data.materials[id].name, ".json");
    }

    function _getAssemblerDataToSave(){
        var assemblerData = _.omit(globals.cam.toJSON(), ["origin", "stock", "exporter", "appState", "lattice", "machine", "simLineNumber"]);
        if (!globals.cam.get("editsMadeToProgram")) assemblerData.dataOut = "";
        return assemblerData;
    }

    function _getLatticeDataToSave(){
        return lattice.getSaveJSON();
    }

    function _getMaterialsDataToSave(){
        var data = {};
        _.each(_.keys(materials.list), function(key){
            data[key] = _getMaterialDataToSave(key);
        });
        return data;
    }

    function _getMaterialDataToSave(id){
        return _.omit(materials.list[id], "threeMaterial", "transparentMaterial");
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
        var sparseCells = data.assembly.sparseCells;
        _setData(lattice, _.omit(data.assembly, "sparseCells"));
        if (sparseCells) lattice._updateLatticeType(sparseCells);
        ribbon.render();
        menuWrapper.render();
    }

    function loadUser(data){
        _setData(data);
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

    return {//return public methods
//        save: save,
        save: save,
        saveMaterial: saveMaterial,
//        saveAssembler: saveAssembler,
//        saveUser: saveUser,
        loadFile: loadFile
//        loadUser: loadUser
    }
});