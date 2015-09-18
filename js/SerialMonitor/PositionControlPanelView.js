/**
 * Created by aghassaei on 9/11/15.
 */

//this.model == serialComm

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

            this.listenTo(this.model.getMachineState(), "change", this._renderPositionData);
            this.render();
            this._askForPosition();

            this.model.send('{"sr":{"stat":t, "posx":t, "posy":t, "posz":t, "posa":t, "line":t}}');
            this.model.send('$ej=1');
            this.model.send('$sv=2');
        },

        _renderPositionData: function(){
            var machineState = this.model.getMachineState();
            $("#positionData").html(_.template(positionTemplate)(machineState.toJSON()));
        },

        _askForPosition: function(e){//todo should be in machine state init
            if (e) e.preventDefault();
            this.model.send('{"sr":n}');
        },

        _stopMachine: function(e){
            e.preventDefault();
            this.model.send("!");
        },

        _pause: function(e){
            e.preventDefault();
            this.model.pauseStream();
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