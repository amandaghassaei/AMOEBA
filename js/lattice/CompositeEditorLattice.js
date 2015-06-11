/**
 * Created by aghassaei on 6/10/15.
 */


define(['underscore', 'backbone', 'appState', 'lattice', 'globals', 'plist', 'three', 'threeModel'],
    function(_, Backbone, appState, lattice, globals, plist, THREE, three){

    var defaults = {
        compositeColor: makeRandomColor(),
        numCompositeCells:0,
        compositeCellsMin: null,
        compositeCellsMax: null
    };

    function makeRandomColor(){
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    var CompositeEditorLattice = {



        _initCompositeEditor: function(){

            var self = this;
            _.each(_.keys(defaults), function(key){
                self.set(key, defaults[key], {silent:true});
            });

            this.compositeCells = [[[null]]];

        },

        _changeRandomColor: function(){
            this.set("compositeColor", makeRandomColor());
        },

        _undoCompositeEditor: function(){
            console.log("undo");
            var self = this;
            _.each(_.keys(CompositeEditorLattice), function(key){
                self[key] = null;
            });
            _.each(_.keys(defaults), function(key){
                self.unset(key, {silent:true});
            });
            this.compositeCells = null;
        }
    };

    return CompositeEditorLattice;
});
