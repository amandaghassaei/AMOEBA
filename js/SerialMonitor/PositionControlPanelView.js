/**
 * Created by aghassaei on 9/11/15.
 */


define(['jquery', 'underscore', 'backbone', 'text!PositionControlPanelView.html', 'text!PositionDataView.html'],
    function($, _, Backbone, template, positionTemplate){

    return Backbone.View.extend({

        el: "#positionPanel",

        events: {
            "click #stopMachine":                           "_stopMachine",
            "click #pauseOutput":                           "_pause",
            "click #askForPosition":                        "_askForPosition"
        },


        initialize: function(){
            this.render();
        },

        _renderPositionData: function(){
            var machineState = this.model.getMachineState();
            if (machineState === null) {
                $("#positionData").html("<div id='positionDataError'>no position data available</div>");
                return;
            }
            $("#positionData").html(_.template(positionTemplate)(machineState.toJSON()));
        },

        _makeTemplateJSON: function(){
            return {};
        },

        render: function(){
            this.$el.html(this.template(this._makeTemplateJSON()));
            this._renderPositionData();
        },

        template: _.template(template)

    });

});