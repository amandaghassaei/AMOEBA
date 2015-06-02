/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist'], function($, _, MenuParentView, plist){

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(){
        },

        _makeTemplateJSON: function(){
            return plist;
        },

        template: _.template('\
            <div class="btn-group fullWidth">\
                <button data-toggle="dropdown" class="btn btn-default btn-lg dropdown-toggle fullWidth" type="button">Load Script<span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allScripts), function(key){ %>\
                        <li><a data-type="<%= key %>" href="#"><%= allScripts[key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/><!-- /btn-group -->\
            <a href="#" class="clearCells btn btn-block btn-lg btn-danger">Clear All Cells</a><br/>\
            ')

    });
});