/**
 * Created by aghassaei on 9/9/15.
 */


define(['jquery', 'underscore', 'commParentMenu', 'text!SerialMonitorView.html'], function($, _, CommParentMenu, template){

    return CommParentMenu.extend({

        el: "#serialMonitorView",

        __initialize: function(){
            $("#serialMonitorOutput").html("flksadlfkj<br/>flksadlfkj<br/>flksadlfkj<br/>)flksadlfkj<br/>flksadlfkj<br/>flksadlfkj<br/>flksadlfkj<br/>flksadlfkj<br/>flksadlfkj<br/>flksadlfkj<br/>)flksadlfkj<br/>flksadlfkj<br/>flksadlfkj<br/>flksadlfkj<br/>");
        },

        _makeTemplateJSON: function(){
            console.log("render");
            return this.model.toJSON();
        },

        template: _.template(template)

    });
});