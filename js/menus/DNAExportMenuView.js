/**
 * Created by aghassaei on 9/15/15.
 */


define(['jquery', 'underscore', 'menuParent', 'dnaExport', 'text!menus/templates/DNAExportMenuView.html'],
    function($, _, MenuParentView, dnaExport, template){


    return MenuParentView.extend({

        events: {
            "click #saveSequences":                     "_saveToFile"
        },


        _initialize: function(){
        },

        _saveToFile: function(e){
            e.preventDefault();
            dnaExport.save();
        },

        _makeTemplateJSON: function(){
            return dnaExport.toJSON();
        },

        template: _.template(template)
    });
});