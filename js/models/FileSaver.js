/**
 * Created by aghassaei on 5/25/15.
 */


define(['underscore', 'fileSaverLib', 'lattice', 'materials', 'ribbon', 'menuWrapper'], function(_, saveAs, lattice, materials, ribbon, menuWrapper){

    function _saveFile(data, name, extension, noQuotes){
//        require(['jsonFn'], function(JSONfn){
//        console.log(data.toString());
            var jsonString = JSON.stringify(data, null, '\t');

            if (noQuotes){
                jsonString = jsonString.replace(/"/g, '');
            }

            var blob = new Blob([jsonString], {type: "text/plain;charset=utf-8"});
            saveAs(blob, name + extension);
            if (data.assembler){
                jsonString.replace(/\\"/g,"\uFFFF"); //U+ FFFF
                jsonString = jsonString.replace(/\"([^"]+)\":/g,"$1:").replace(/\uFFFF/g,"\\\"");
                var blob = new Blob([jsonString], {type: "text/plain;charset=utf-8"});
                saveAs(blob, name + "-forAmanda" + extension);
            }
//        });
    }

//    function save(name){
//        if (!name || name == "" || name == undefined) name = "file";
//        var data = {
//            lattice:_getLatticeDataToSave(),
////            assembler:_getAssemblerDataToSave()
//        };
//        _saveFile(data, name, ".json");
//    }

    function save(name){
        if (!name || name == "" || name == undefined) name = "DM Assembly";
        var data = {
            assembly:_getLatticeDataToSave(),
            materials:_getMaterialsDataToSave()
        };
        _saveFile(data, name, ".json");
    }

    function saveAssembler(){

    }

    function saveUser(name){
        if (!name || name == "" || name == undefined) name = "user";
        var latticeData = _.omit(_getLatticeDataToSave(), ["cells", "cellsMin", "cellsMax", "numCells"]);
        var assemblerData = _.omit(_getAssemblerDataToSave(), ["dataOut", "needsPostProcessing", "editsMadeToProgram"]);
        var data = {
            lattice:latticeData,
            assembler:assemblerData
        };
        _saveFile(data, name, ".user");
    }

    function saveSequences(seqArray, name){
        _saveFile(seqArray, name || "seqs", ".txt", true);
    }

    function saveMaterial(id, material){
        var data = {materials:{}};
        data.materials[id] = material || _getMaterialDataToSave(id);
        _saveFile(data, data.materials[id].name, ".json");
    }

    function saveMachineConfig(data){
        _saveFile(data, "Machine Config", ".json");
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
        if (data.assembler) {
            _loadAssembler(data.assembler);
            return;
        }
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
        if (sparseCells) lattice._updateLatticeConfig(sparseCells);
        ribbon.render();
        menuWrapper.render();
    }

    function _loadAssembler(data){
        require(['cam'], function(cam){
            cam.selectMachine(data);
            console.log("loaded");
        });
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
        saveMachineConfig: saveMachineConfig,
//        saveAssembler: saveAssembler,
//        saveUser: saveUser,
        loadFile: loadFile,
//        loadUser: loadUser
        saveSequences: saveSequences
    }
});