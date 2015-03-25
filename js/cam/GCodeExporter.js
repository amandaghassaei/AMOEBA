/**
 * Created by aghassaei on 3/10/15.
 */

function GCodeExporter() {
}

GCodeExporter.prototype.makeHeader = function(){
    var data = "";
    if (dmaGlobals.lattice.get("units") == "inches") data += this.addLine("G20", [], "units inches");
    else data += this.addLine("G21", [], "units mm");
    data += this.addLine("G90", [], "absolute positioning");
    data += this.addLine("G54", [], "work offset");
//    data += this.addLine("G49", [], "cancel tool length comp");
    data += this.addLine("G40", [], "cancel tool radius comp");
//    data += this.addLine("M09", [], "coolant off");

    data += this.goHome();

    //set rapid and feed speeds
    var rapidSpeeds = dmaGlobals.assembler.get("rapidSpeeds");
    var feedRate = dmaGlobals.assembler.get("feedRate");

    return data;
};

GCodeExporter.prototype.addLine = function(command, params, comment){
    var data = "";
    data += command + " ";
    _.each(params, function(param){
        if (!param) return;
        data += param + " ";
    });
    if (comment) data += "(" + comment + ")";
    data += "\n";
    return data;
};

GCodeExporter.prototype.addComment = function(comment){
    return "(" + comment + ")" + "\n";
};

GCodeExporter.prototype.rapidXYZ = function(x, y, z){
    return this.moveXYZ(x,y,z);
};

GCodeExporter.prototype.rapidXY = function(x, y){
    return this.rapidXYZ(x, y, null);
};

GCodeExporter.prototype.rapidZ = function(z){
    return this.rapidXYZ(null, null, z);
};

GCodeExporter.prototype.moveXYZ = function(x, y, z){
    if (x !== null) x = "X"+parseFloat(x).toFixed(3);
    if (y !== null) y = "Y"+parseFloat(y).toFixed(3);
    if (z !== null) z = "Z"+parseFloat(z).toFixed(3);
    return this.addLine("G01", [x,y,z]);
};

GCodeExporter.prototype.moveXY = function(x, y){
    return this.moveXYZ(x, y, null);
};

GCodeExporter.prototype.moveZ = function(z){
    return this.moveXYZ(null, null, z);
};

GCodeExporter.prototype.goHome = function(){
    return this.moveXYZ(0,0,dmaGlobals.assembler.get("rapidHeight"));
};

GCodeExporter.prototype.makeFooter = function(){
    var data = "";
    data += this.addLine("M30", [], "program stop");

    return data;
};

GCodeExporter.prototype.save = function(data){
    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "GCodeExport" + ".nc");
};

GCodeExporter.prototype.simulate = function(line, machine, wcs,  callback){
    if (line == "(get stock)"){
        machine.pickUpStock();
        return callback();
    }
    if (line.substr(0,2) == "({"){
        machine.releaseStock(line.substr(1,line.length-2));
        return callback();
    }
    if (line == "" || line[0] == "(" || line.substr(0,3) != "G01"){
        return callback();
    }
    if (line.substr(0,3) == "G01"){
        //return this._simulateGetPosition(line, dmaGlobals.assembler.get("feedRate"), machine, wcs, callback);
        return this._simulateGetPosition(line, dmaGlobals.assembler.get("rapidSpeeds"), machine, wcs, callback);
    } else {
        console.warn("problem parsing gcode: " + line);
        return callback();
    }
};

GCodeExporter.prototype._simulateGetPosition = function(line, speed, machine, wcs, callback){
    var data = line.split(" ");
    var position = {x:"",y:"",z:""};
    if (data.length<2) console.warn("problem parsing gcode " + line);
    for (var i=1;i<data.length;i++){
        var item = data[i];
        if (item[0] == "X") position.x = item.substr(1);
        if (item[0] == "Y") position.y = item.substr(1);
        if (item[0] == "Z") position.z = item.substr(1);
    }
    machine.moveTo(position.x, position.y, position.z, speed, wcs, callback);
};
