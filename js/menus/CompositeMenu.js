/**
 * Created by aghassaei on 6/10/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice'], function($, _, MenuParentView, plist, lattice){

    return MenuParentView.extend({

        events: {
            "click #newRandomColor":                                "_changeRandomColor"
        },

        _initialize: function(){
            this.material = {
                color: this._makeRandomColor(),
                dimensions: {x:0,y:0,z:0}
            }
        },

        _updateDimensions: function(cells){
            this.material.dimensions.x = cells.length;
            this.material.dimensions.y = cells[0].length;
            this.material.dimensions.z = cells[0][0].length;
        },

        _changeRandomColor: function(e){
            e.preventDefault();
            this.material.color = this._makeRandomColor();
            this.render();
        },

        _makeRandomColor: function(){
            return '#' + Math.floor(Math.random()*16777215).toString(16);
        },

        _makeTemplateJSON: function(){
            return _.extend(this.material);
        },

        template: _.template('\
            Name: &nbsp;&nbsp;<input value="" placeholder="Enter Name" class="halfWidth form-control" type="text"><br/><br/>\
            Bounding Box: ()<br/><br/>\
            Display Color:<br/>\
            <div style="background-color: <%= color %> ;" id="compositeDisplayColor"></div>\
            <input value="<%= color %>" placeholder="Enter HEX" class="halfWidth form-control" type="text"><br/>\
            <a id="newRandomColor" href="#" class="btn btn-block btn-lg btn-default">New Random Color</a><br/>\
            ')

    });
});