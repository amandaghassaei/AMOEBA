/**
 * Created by aghassaei on 6/16/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'serialComm'], function($, _, MenuParentView, plist, serialComm){




    return MenuParentView.extend({

        events: {
        },


        _initialize: function(){

        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), serialComm.toJSON());
        },

        template: _.template('\
        Setup<br/>\
        Send Test Messages\
            ')

    });
});