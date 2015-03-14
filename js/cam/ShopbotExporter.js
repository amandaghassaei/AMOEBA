/**
 * Created by aghassaei on 3/10/15.
 */

function ShopbotExporter() {
}

ShopbotExporter.prototype.makeHeader = function(){
    var data = "";
    data += this.addLine("FG", [], "single step mode");
    data += this.addLine("SA", [], "absolute distances");
    data += this.addLine("SM", [], "move/cut mode");
    var rapidSpeeds = dmaGlobals.assembler.get("rapidSpeeds");
    data += this.addLine("JS", [rapidSpeeds.xy, rapidSpeeds.z], "jog speed xy, z");
    var feedRate = dmaGlobals.assembler.get("feedRate");
    data += this.addLine("MS", [feedRate.xy, feedRate.z], "move speed xy, z");
    data += this.goHome();
    return data;
};

ShopbotExporter.prototype.addLine = function(command, params, comment){
    var data = "";
    data += command + " ";
    var self = this;
    _.each(params, function(param){
        if (isNaN(parseFloat(param))) {
            data += param + ", ";
            return;
        }
        if (dmaGlobals.lattice.get("units") == "mm") param = self.convertToInches(param);//all shopbot stuff must be in inches
        data += param.toFixed(3) + ", ";
    });
    if (comment) data += "'" +comment;
    data += "\n";
    return data;
};

ShopbotExporter.prototype.addComment = function(comment){
    return "'" + comment + "\n";
};

ShopbotExporter.prototype.rapidXYZ = function(x, y, z){
    return this.addLine("J3", [x,y,z]);
};

ShopbotExporter.prototype.rapidXY = function(x, y){
    return this.addLine("J2", [x,y]);
};

ShopbotExporter.prototype.moveXYZ = function(x, y, z){
    return this.addLine("M3", [x,y,z]);
};

ShopbotExporter.prototype.moveXY = function(x, y){
    return this.addLine("M2", [x,y]);
};

ShopbotExporter.prototype.moveZ = function(z){
    return this.moveXYZ("", "", z);
};

ShopbotExporter.prototype.goHome = function(){
    var data = this.moveZ(dmaGlobals.assembler.get("rapidHeight"));
    data += this.moveXY(0,0);
    return data;
};

ShopbotExporter.prototype.makeFooter = function(){
    var data = this.moveZ(dmaGlobals.assembler.get("rapidHeight"));
    data += this.rapidXY(0,0);
    return data;
};

ShopbotExporter.prototype.save = function(data){
    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "ShopbotExport" + ".sbp");
};

ShopbotExporter.prototype.convertToInches = function(mm){
    return mm*0.0393701;
}
