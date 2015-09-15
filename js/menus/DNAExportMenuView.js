/**
 * Created by aghassaei on 9/15/15.
 */


define(['jquery', 'underscore', 'menuParent', 'dnaExport', 'lattice', 'text!menus/templates/DNAExportMenuView.html'],
    function($, _, MenuParentView, dnaExport, lattice, template){


    return MenuParentView.extend({

        events: {
            "click #saveSequences":                     "_saveToFile",
            "click #calcSequences":                     "_calcSequences"
        },


        _initialize: function(){
            this.listenTo(dnaExport, "change", this.render);
        },

        _saveToFile: function(e){
            e.preventDefault();
            dnaExport.save();
        },

        _calcSequences: function(e){
            e.preventDefault();
            dnaExport.generateSequences();
        },

        _makeTemplateJSON: function(){
            return _.extend(dnaExport.toJSON(), lattice.toJSON());
        },

        template: _.template(template)
    });
});