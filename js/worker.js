/**
 * Created by aghassaei on 1/12/15.
 */


self.onmessage = function(e) {
  var data = e.data;

  if (data.url) {
    var url = data.url.href;
    var index = url.indexOf('main.html');//url of landing page
    if (index != -1) {
      url = url.substring(0, index);
    }
    //load all scripts
    importScripts(url + 'dependencies/three.js');
//    importScripts(url + 'js/element.js');
  }


};