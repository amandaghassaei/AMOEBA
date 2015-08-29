/**
 * Created by aghassaei on 3/11/15.
 */

define(['jquery', 'underscore', 'commParentMenu', 'serialComm', 'commPlist', 'text!sendMenuTemplate', 'cam', 'camPlist'],
    function($, _, CommParentMenu, serialComm, commPlist, template, cam, camPlist){

    return CommParentMenu.extend({


        events: {
        },


        __initialize: function(){
            this.isStreaming = false;
        },

        _makeTemplateJSON: function(){
            console.log("render");
            return _.extend(serialComm.toJSON(), commPlist, cam.toJSON(), camPlist, {streaming: this.isStreaming});
        },

        template: _.template(template)

    });
});