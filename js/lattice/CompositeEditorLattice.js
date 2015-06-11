/**
 * Created by aghassaei on 6/10/15.
 */


define(['underscore', 'backbone', 'appState', 'lattice', 'globals', 'plist', 'three', 'threeModel'],
    function(_, Backbone, appState, lattice, globals, plist, THREE, three){

    var defaults = {
        compositeCells:[[[null]]],
        compositeColor: null
    };

    var CompositeEditorLattice = {



        _initCompositeEditor: function(){

            _.each(_.keys(defaults), function(key){
                this.set(key, defaults[key], {silent:true});
            });

        },

        _undoCompositeEditor: function(){
            var self = this;
            _.each(_.keys(CompositeEditorLattice), function(key){
                self[key] = null;
            });
            _.each(_.keys(defaults), function(key){
                this.unset(key, defaults[key], {silent:true});
            });
        }
    };

    return CompositeEditorLattice;
});
