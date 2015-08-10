/**
 * Created by aghassaei on 8/10/15.
 */

define(['materialMenu'],
    function(MaterialMenuView){

    return MaterialMenuView.extend({

        _makeTemplateJSON: function(){
            var data = MaterialMenuView.prototype._makeTemplateJSON.call(this);
            data.inSimMode = true;
            return data;
        }

    });
});