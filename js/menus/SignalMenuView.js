/**
 * Created by ghassaei on 2/18/16.
 */


define(['jquery', 'underscore', 'menuParent', 'emSimPlist', 'emSimLattice', 'text!menus/templates/SignalMenuView.html'],
    function($, _, MenuParentView, emPlist, emSimLattice, template){

        var signal = {};

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(options){
            this.signal = options.myObject;
            _.extend(signal, this.signal.toJSON());
        },

        getPropertyOwner: function($target){
            if ($target.hasClass('signal')) return signal;
            return null;
        },

        saveExitMenu: function(){
            this.signal.setAsSignalGenerator(signal.pwm, signal.frequency, signal.waveformType);
            return true;
        },

        _makeTemplateJSON: function(){
            return _.extend({}, signal, emPlist);
        },

        template: _.template(template)
    });
});