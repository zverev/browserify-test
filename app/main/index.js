var L = require('leaflet');

window.addEventListener('load', function() {
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

    var map = window.map = L.map(document.body, {
        center: {
            lat: 49.95121990866206,
            lng: 42.1435546875
        },
        zoom: 4
    })

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
});
