/**
 * Created by aghassaei on 3/10/15.
 */

function ShopbotExporter() {

}

ShopbotExporter.prototype.processAndSave = function(){

    var data = "";

    data = this.makeHeader(data);
    data = this.moveZ(data, 3);
    data = this.jog3(data, 1, 4, 5);

    this.save(data);
};

ShopbotExporter.prototype.makeHeader = function(data){
    data = this.addLine(data, "FG", [], "single step mode");
    data = this.goHome(data);
    data = this.addLine(data, "SM", [4, 1], "set to move/cut mode");
    data = this.addLine(data, "JS", [4, 1], "jog speed- xy, z inches per sec");
    data = this.addLine(data, "MS", [4, 1], "move speed- xy, z inches per sec");
    return data;
};

ShopbotExporter.prototype.addLine = function(data, command, params, comment){
    data += command + " ";
    _.each(params, function(param){
        data += param + ", ";
    });
    if (comment) data += "'" +comment;
    data += "\n";
    return data;
};

ShopbotExporter.prototype.jog3 = function(data, x, y, z){
    return this.addLine(data, "J3", [x,y,z]);
};

ShopbotExporter.prototype.move3 = function(data, x, y, z){
    return this.addLine(data, "M3", [x,y,z]);
};

ShopbotExporter.prototype.goHome = function(data){
    return this.addLine(data, "JH", [], "go home");
};

ShopbotExporter.prototype.moveZ = function(data, z){
    return this.move3(data, "", "", z);
};


ShopbotExporter.prototype.save = function(data){
    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "ShopbotExport" + ".sbp");
};
