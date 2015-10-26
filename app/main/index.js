var cm = require('gmx-common-components/ComponentsManager');

cm.define('layoutManager', [], function(cm) {
    var L = require('leaflet');

    var LM = L.Class.extend({
        initialize: function(options) {
            var rootEl = options.rootEl;
            this.mapContainerEl = L.DomUtil.create('div', 'mapContainer', rootEl);
            this.widgetsContainerEl = L.DomUtil.create('div', 'widgetsContainer', rootEl);
        },
        getMapContainer: function() {
            return this.mapContainerEl;
        },
        getLayersTreeContainer: function() {
            return this.widgetsContainerEl;
        }
    });

    return new LM({
        rootEl: document.body
    });
});

cm.define('leafletProductionIssues', [], function(cm) {
    var L = require('leaflet');

    L.Icon.Default = L.Icon.Default.extend({
        options: {
            iconUrl: 'resources/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [15, 37],
            popupAnchor: [0, -25],
            shadowUrl: 'resources/marker-icon.png',
            shadowSize: [0, 0],
            shadowAnchor: [0, 0]
        }
    });

    L.Icon.Default.imagePath = 'resources';

    L.Marker = L.Marker.extend({
        options: {
            icon: new L.Icon.Default()
        }
    });

    return null;
});

cm.define('map', ['leafletProductionIssues', 'layoutManager'], function(cm) {
    var L = require('leaflet');
    var lm = cm.get('layoutManager');

    var map = L.map(lm.getMapContainer(), {
        center: {
            lat: 49.95121990866206,
            lng: 42.1435546875
        },
        zoom: 4
    })

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    return map;
});

cm.define('gmxMap', ['map'], function(cm, cb) {
    var lGmx = require('leaflet-geomixer');
    var map = cm.get('map');

    lGmx.loadMap('37TYY').then(function(gmxMap) {
        for (var i = 0; i < gmxMap.layers.length; i++) {
            map.addLayer(gmxMap.layers[i]);
        }
        cb(gmxMap);
    }, function(err) {
        console.error('error', err);
        cb(false);
    });
});

cm.define('rawTree', ['gmxMap'], function(cm) {
    return cm.get('gmxMap').rawTree;
});

cm.define('layersTree', ['rawTree'], function(cm) {
    var LayersTreeNode = require('../../external/GMXCommonComponents/LayersTree');
    var rawTree = cm.get('rawTree');

    return new LayersTreeNode({
        content: rawTree
    });
});

cm.define('layersTreeWidget', ['layersTree', 'layoutManager'], function(cm) {
    var GmxWidget = require('gmx-common-components/GmxWidget');
    var layersTree = cm.get('layersTree');
    var layoutManager = cm.get('layoutManager');
    var $ = require('jquery');

    var MyWidget = GmxWidget.extend({
        el: $('<div>'),
        initialize: function() {
            this.$el.html('hello world');
        }
    });

    var wgt = new MyWidget();
    wgt.appendTo(layoutManager.getLayersTreeContainer());

    return null;
});

cm.define('globals', ['map', 'layersTree'], function(cm) {
    window.cm = cm;
    window.map = cm.get('map');
    window.lt = cm.get('layersTree');
    return null;
});

window.addEventListener('load', function() {
    cm.create().then(function() {
        console.log('ready');
    });
});