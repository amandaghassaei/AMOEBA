/**
 * Created by aghassaei on 3/10/15.
 */

function GCodeExporter() {
}

GCodeExporter.prototype.makeHeader = function(){
    var data = "";
    if (dmaGlobals.appState.get("units") == "inches") data += this.addLine("G20", [], "units inches");
    else data += this.addLine("G21", [], "units mm");
    data += this.addLine("G90", [], "absolute positioning");
    data += this.addLine("G54", [], "work offset");
//    data += this.addLine("G49", [], "cancel tool length comp");
    data += this.addLine("G40", [], "cancel tool radius comp");
    data += this.addLine("M09", [], "coolant off");



    data += this.goHome();

    //set rapid and feed speeds

    data += "\n";
    data += "\n";
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

GCodeExporter.prototype.rapid3 = function(x, y, z){
    return this.move3(x,y,z);
};

GCodeExporter.prototype.move3 = function(x, y, z){
    if (x !== null) x = "X"+x;
    if (y !== null) y = "Y"+y;
    if (z !== null) z = "Z"+z;
    return this.addLine("G01", [x,y,z]);
};

GCodeExporter.prototype.goHome = function(){
    return this.move3(0,0,0);
};

GCodeExporter.prototype.moveZ = function(z){
    return this.move3(null, null, z);
};

GCodeExporter.prototype.makeFooter = function(){
    var data = "";
    data += this.goHome();
    data += this.addLine("M30", [], "program stop");

    return data;
};

GCodeExporter.prototype.save = function(data){
    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "GCodeExport" + ".g");
};
