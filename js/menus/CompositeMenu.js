/**
 * Created by aghassaei on 6/10/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice'], function($, _, MenuParentView, plist, lattice){

    return MenuParentView.extend({

        events: {
            "click #newRandomColor":                                  "_changeRandomColor",
            "click #finishComposite":                                 "_finishComposite",
            "click #saveComposite":                                   "_saveComposite",
            "click #cancelComposite":                                 "_cancelComposite"
        },

        _initialize: function(){

            this.listenTo(lattice, "change", this.render);
        },

        _updateDimensions: function(cells){
            this.material.dimensions.x = cells.length;
            this.material.dimensions.y = cells[0].length;
            this.material.dimensions.z = cells[0][0].length;
        },

        _changeRandomColor: function(e){
            e.preventDefault();
            lattice._changeRandomColor();
        },

        _finishComposite: function(e){
            e.preventDefault();
            this.stopListening();
            lattice.makeNewCompositeMaterial($("#compositeName").val());
            this.model.set("currentNav", "navDesign");
        },

        _saveComposite: function(e){
            e.preventDefault();

        },

        _cancelComposite: function(e){
            e.preventDefault();
            this.model.set("currentNav", "navDesign");
        },

        _makeTemplateJSON: function(){
            return _.extend(lattice.toJSON());
        },

        template: _.template('\
            <a href="#" class="btn btn-halfWidth btn-lg btn-default importJSON">Load Composite</a>\
            <a id="saveComposite" href="#" class="btn btn-halfWidth btn-lg pull-right btn-default">Save Composite</a><br/><br/>\
            Name: &nbsp;&nbsp;<input id="compositeName" value="" placeholder="Enter Name" class="halfWidth form-control" type="text"><br/><br/>\
            Bounding Box: ()<br/><br/>\
            Display Color: &nbsp;&nbsp;\
            <input style="border-color: <%= compositeColor %> ;" value="<%= compositeColor %>" placeholder="Enter HEX" class="halfWidth form-control" type="text"><br/><br/>\
            <a id="newRandomColor" href="#" class="btn btn-block btn-lg btn-default">New Random Color</a><br/><br/>\
            <a id="finishComposite" href="#" class="btn btn-halfWidth btn-lg btn-success">Finish Composite</a>\
            <a id="cancelComposite" href="#" class="btn btn-halfWidth pull-right btn-lg btn-default">Cancel / Exit</a><br/>\
            \
            ')

    });
});