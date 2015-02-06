/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    //init web workers
    window.workers = persistentWorkers(8);

    //init threeJS and geometry models
    window.three = new ThreeModel();

    //setup ui
    var appState = new AppState();
    var highlighter = new Highlighter({model:appState.get("lattice")});
    new NavBar({model:appState});

    //threeJS View
    new ThreeView({model:window.three, appState:appState, highlighter:highlighter});
});
