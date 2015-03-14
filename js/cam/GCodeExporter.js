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
        if (isNaN(parseFloat(param))) {
            data += param + " ";
            return;
        }
        data += param.toFixed(3) + " ";
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

GCodeExporter.prototype.moveXYZ = function(x, y, z){
    if (x !== null) x = "X"+x;
    if (y !== null) y = "Y"+y;
    if (z !== null) z = "Z"+z;
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
    data += this.goHome();
    data += this.addLine("M30", [], "program stop");

    return data;
};

GCodeExporter.prototype.save = function(data){
    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "GCodeExport" + ".g");
};
