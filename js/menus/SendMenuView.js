/**
 * Created by aghassaei on 3/11/15.
 */

define(['jquery', 'underscore', 'commParentMenu', 'serialComm', 'commPlist', 'text!sendMenuTemplate'],
    function($, _, CommParentMenu, serialComm, commPlist, template){

    return CommParentMenu.extend({


        events: {
        },


        __initialize: function(){
        },

        _makeTemplateJSON: function(){
            console.log("render");
            return _.extend(serialComm.toJSON(), commPlist);
        },

        template: _.template(template)

    });
});