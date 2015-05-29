/**
 * Created by aghassaei on 5/28/15.
 */

function DualStaplerAssembler(){
    StaplerAssembler.call(this);
}
DualStaplerAssembler.prototype = Object.create(StaplerAssembler.prototype);

DualStaplerAssembler.prototype._headSTLFile = function(){
    return "assets/stls/stapler/zAxisDual.stl";
};