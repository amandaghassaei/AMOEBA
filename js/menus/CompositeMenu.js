/**
 * Created by aghassaei on 6/10/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice'], function($, _, MenuParentView, plist, lattice){

    return MenuParentView.extend({

        events: {
            "click #newRandomColor":                                  "_changeRandomColor",
            "click #finishComposite":                                 "_finishComposite",
            "click #saveComposite":                                   "_saveComposite",
            "click #cancelComposite":                                 "_cancelComposite",
            "click #deleteComposite":                                 "_deleteComposite"
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

        updateHex: function(hex){
            //update hex without rendering
            $("#compositeColor").css("border-color", hex);
        },

        _finishComposite: function(e){
            e.preventDefault();
            this.stopListening();
            if (!lattice.makeNewCompositeMaterial){
                console.warn("lattice not in composite mode for finish composite call");
                this._exit();
                return;
            }
            lattice.makeNewCompositeMaterial($("#compositeName").val());
            this._exit();
        },

        _saveComposite: function(e){
            e.preventDefault();
        },

        _cancelComposite: function(e){
            e.preventDefault();
            this._exit();
        },

        _deleteComposite: function(e){
            e.preventDefault();
            if (!lattice.deleteComposite){
                console.warn("lattice not in composite mode for delete composite call");
                this._exit();
                return;
            }
            lattice.deleteComposite();
            this._exit();
        },

        _exit: function(){
            this.model.set("currentNav", "navDesign");
        },

        _makeTemplateJSON: function(){
            return _.extend(lattice.compositeEditor.toJSON());
        },

        template: _.template('\
            <a href="#" class="btn btn-halfWidth btn-lg btn-default importJSON">Load Composite</a>\
            <a id="saveComposite" href="#" class="btn btn-halfWidth btn-lg pull-right btn-default">Save Composite</a><br/><br/>\
            Name: &nbsp;&nbsp;<input id="compositeName" data-property="name" value="<%= name %>" placeholder="Enter Name" class="seventyFiveWidth form-control textInput lattice" type="text"><br/><br/>\
            Bounding Box: ()<br/><br/>\
            Display Color: &nbsp;&nbsp;\
            <input id="compositeColor" style="border-color: <%= color %> ;" data-property="color" value="<%= color %>" placeholder="Enter HEX" class="halfWidth lattice form-control hexInput" type="text"><br/><br/>\
            <a id="newRandomColor" href="#" class="btn btn-block btn-lg btn-default">New Random Color</a><br/><br/>\
            <a id="finishComposite" href="#" class="btn btn-block btn-lg btn-success">Finish Composite</a><br/>\
            <a id="cancelComposite" href="#" class="btn btn-halfWidth btn-lg btn-default">Cancel / Exit</a>\
            <a id="deleteComposite" href="#" class="btn btn-halfWidth pull-right btn-lg btn-default"><span class="fui-trash"></span> Delete</a><br/>\
            ')

    });
});