/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'cam', 'lattice', 'text!camMenuTemplate'], function($, _, MenuParentView, plist, cam, lattice, template){

    return MenuParentView.extend({

        events: {
            "click #saveCam":                               "_save",
            "click #manualSelectOrigin":                    "_selectOrigin"
        },


        _initialize: function(){
            //bind events
            this.listenTo(cam, "change", this.render);
            this.listenTo(this.model, "change", this.render);
            this.listenTo(lattice, "change", this.render);
        },

        getPropertyOwner: function($target){
            if ($target.hasClass("assembler")) return cam;
            return null;
        },

        _selectOrigin: function(e){
            e.preventDefault();
            this.model.set("manualSelectOrigin", !this.model.get("manualSelectOrigin"));
        },

        _save: function(e){
            e.preventDefault();
            cam.save();
        },

        _makeTemplateJSON: function(){
            var data = _.extend(this.model.toJSON(), cam.toJSON(), lattice.toJSON(), plist);
            if (cam.get("stockPositionRelative")){
                var relStockPos = {};
                relStockPos.x = data.stockPosition.x - data.originPosition.x;
                relStockPos.y = data.stockPosition.y - data.originPosition.y;
                relStockPos.z = data.stockPosition.z - data.originPosition.z;
                data.stockPosition = relStockPos;
            }
            if (!cam.get("rapidHeightRelative")){
                data.rapidHeight = data.rapidHeight + data.originPosition.z;
            }
            return data;
        },

        template: _.template(template)
    });
});


//<% if (machineName == "oneBitBot") {%>Rotate Machine: &nbsp;&nbsp;<a class=" btn btn-lg btn-default btn-machineRotation btn-imageCustom"><img src="assets/imgs/clockwise.png"></a>\
//         &nbsp;&nbsp&nbsp;<a class=" btn btn-lg btn-default btn-machineRotation btn-imageCustom"><img src="assets/imgs/counterClockwise.png"></a><br/><br/><% } %>\