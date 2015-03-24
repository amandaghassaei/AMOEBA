/**
 * Created by aghassaei on 3/10/15.
 */

function ShopbotExporter() {
}

ShopbotExporter.prototype.makeHeader = function(){
    var data = "";
    //data += this.addLine("FG", [], "single step mode");
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
        data += parseFloat(param).toFixed(3) + ", ";
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

ShopbotExporter.prototype.rapidZ = function(z){
    return this.rapidXYZ("", "", z);
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
    var data = this.rapidZ(dmaGlobals.assembler.get("rapidHeight"));
    data += this.rapidXY(0,0);
    return data;
};

ShopbotExporter.prototype.makeFooter = function(){
    return "";
};

ShopbotExporter.prototype.save = function(data){
    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "ShopbotExport" + ".sbp");
};

ShopbotExporter.prototype.convertToInches = function(mm){
    return mm*0.0393701;
};

ShopbotExporter.prototype.convertToMM = function(inches){
    return inches*25.4;
};


ShopbotExporter.prototype.simulate = function(line, machine, wcs,  callback){
    if (line == "'get stock"){
        machine.pickUpStock();
        return callback();
    }
    if (line[1] == "{"){
        machine.releaseStock(line.substr(1));
        return callback();
    }
    if (line == "" || line[0] == "'" || (line[0] != "J" && line[0] != "M")) {
        return callback();
    }
    if (line[0] == "J"){
        return this._simulateGetPosition(line, dmaGlobals.assembler.get("rapidSpeeds"), machine, wcs, callback);
    } else if (line[0] == "M"){
        return this._simulateGetPosition(line, dmaGlobals.assembler.get("feedRate"), machine, wcs, callback);
    } else {
        console.warn("problem parsing sbp " + line);
        return callback();
    }
};

//todo mm support
ShopbotExporter.prototype._simulateGetPosition = function(line, speed, machine, wcs, callback){
    if (line[1] == 3 || line[1] == 2) {
        var data = line.split(" ");
        for (var i=0;i<data.length;i++){
            var item = data[i];
            if (item[item.length-1] == ",") data[i] = item.substring(0, item.length - 1)
        }
        if (line[1] == 3){
            if (dmaGlobals.lattice.get("units") == "inches") machine.moveTo(data[1], data[2], data[3], speed, wcs, callback);
            else machine.moveTo(this.convertToMM(data[1]), this.convertToMM(data[2]), this.convertToMM(data[3]), speed, wcs, callback);
        } else {
            if (dmaGlobals.lattice.get("units") == "inches") machine.moveTo(data[1], data[2], "", speed, wcs, callback);
            else return machine.moveTo(this.convertToMM(data[1]), this.convertToMM(data[2]), "", speed, wcs, callback);
        }
    } else if (line[1] == "S"){
        return callback();
    } else {
        console.warn("problem parsing sbp " + line);
        return callback();
    }
};
