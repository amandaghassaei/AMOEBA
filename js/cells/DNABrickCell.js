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


    return DNABrickCell;
});