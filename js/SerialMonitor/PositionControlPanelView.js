/**
 * Created by aghassaei on 9/11/15.
 */


define(['jquery', 'underscore', 'backbone', 'text!PositionControlPanelView.html'], function($, _, Backbone, template){

    return Backbone.View.extend({

        el: "#positionPanel",

        events: {

        },


        initialize: function(){
            this.render();
        },

        _makeTemplateJSON: function(){
            console.log(this.model);
            var machineState = this.model.getMachineState();
            if (machineState === null) return {};
            return machineState.toJSON();
        },

        render: function(){
            this.$el.html(this.template(this._makeTemplateJSON()));
        },

        template: _.template(template)

    });

});