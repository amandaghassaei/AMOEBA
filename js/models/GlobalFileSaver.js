/**
 * Created by aghassaei on 5/25/15.
 */


function GlobalFilesaver(){

    function _saveFile(data, name, extension){
        var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        saveAs(blob, name + extension);
    }

    function save(name){
        if (!name || name == "" || name == undefined) name = "file";
        var data = JSON.stringify({
            lattice:_getLatticeDataToSave(),
            assembler:_getAssemblerDataToSave()
        });
        _saveFile(data, name, ".json");
    }

    function saveLattice(name){
        if (!name || name == "" || name == undefined) name = "lattice";
        var data = JSON.stringify({
            lattice:_getLatticeDataToSave()
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

    function _getAssemblerDataToSave(){
        var assemblerData = _.omit(globals.cam.toJSON(), ["origin", "stock", "exporter", "appState", "lattice", "machine", "simLineNumber"]);
        if (!globals.cam.get("editsMadeToProgram")) assemblerData.dataOut = "";
        return assemblerData;
    }

    function _getLatticeDataToSave(){
        return globals.lattice.attributes;
    }

    function loadFile(data){//todo make this better
        globals.lattice.clearCells();
        _setData(data, false);
        globals.lattice._updateLatticeType(null, null, null, true);
        globals.lattice.trigger("change:scale");
    }

    function loadUser(data){
        _setData(data, false);
    }

    function _setData(data, silent){
        _.each(_.keys(data.lattice), function(key){
            globals.lattice.set(key, data.lattice[key], {silent:silent});
        });
        _.each(_.keys(data.assembler), function(key){
            globals.cam.set(key, data.assembler[key]);
        });
    }

    return {//return public methods
        save: save,
        saveLattice: saveLattice,
//        saveAssembler: saveAssembler,
        saveUser: saveUser,
        loadFile: loadFile,
        loadUser: loadUser
    }
}