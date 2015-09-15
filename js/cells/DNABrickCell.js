/**
 * Created by aghassaei on 9/14/15.
 */


define(['gikCell'], function(GIKCell){

    function DNABrickCell(json, superCell){
        GIKCell.call(this, json, superCell);
    }
    DNABrickCell.prototype = Object.create(GIKCell.prototype);

    DNABrickCell.prototype.getCompliment = function(nucleotide){
        if (nucleotide == "a") return "t";
        if (nucleotide == "t") return "a";
        if (nucleotide == "c") return "g";
        if (nucleotide == "g") return "c";
        if (nucleotide == "unassigned") return null;
        console.warn("unknown nucleotide " + nucleotide);
        return null;
    };

    DNABrickCell.prototype.getNucleotideAtIndex = function(index){
        if (this.parts && this.parts[index] && this.parts[index].getNucleotide) return this.parts[index].getNucleotide();
        return "unassigned";
    };

    DNABrickCell.prototype.getSequence = function(){
        if (this._sequence) return this._sequence;
        var sequence = "";
        if (!this.parts || this.parts.length < 16) {
            console.warn("need to calc nucleotides for this cell");
            return sequence;
        }
        for (var i=0;i<16;i++){
            var nucleotide = this.parts[i].getNucleotide();
            if (nucleotide) sequence += nucleotide;
            else console.warn("no nucleotide found for this part");
        }
        this._sequence = sequence;
        return sequence;
    };


    return DNABrickCell;
});