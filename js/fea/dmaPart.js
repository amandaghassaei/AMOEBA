/**
 * Created by aghassaei on 1/14/15.
 */


//a part, element with a single material, handled by assembler

(function () {


    var partGeometry1;

    function DMAPart(type) {
    //    this.nodes = nodes;
    //    this.beams = this._createBeams(nodes, config);
        this.scale = 10;
    //    this.geometry = geometry;
    }

    DMAPart.prototype._createBeams = function(nodes, config){
//        var beams = [];
//        _.each(config, function(pair){
//            beams.push(new Beam(nodes[pair[0]], nodes[pair[2]]));
//        });
//        return beams;
    };

    DMAPart.prototype.render = function(){
    };

    self.DMAPart =  DMAPart;

})();

//////////////////////////////////////////////////////////////
/////////////////SUBCLASSES///////////////////////////////////
//////////////////////////////////////////////////////////////



////matt's part
//function PartTriangle(){
//}
//
//PartTriangle.prototype = new DmaPart();