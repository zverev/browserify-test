var foof = require('../external-lib');
var bar = require('./internal-lib');

window.addEventListener('load', function () {
    var el1 = document.createElement('div');
    el1.innerHTML = foof;
    document.body.appendChild(el1);

    var el2 = document.createElement('div');
    el2.innerHTML = bar;
    document.body.appendChild(el2);
});
var layersTreeWidget = require('gmx-common-components/LayersTreeWidget');
console.log(layersTreeWidget);
