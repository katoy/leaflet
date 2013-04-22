// var map = L.map('map').setView([51.505, -0.09], 13);
var map = L.map('map').setView(new L.LatLng(35.71014, -220.19116), 15);  // 東京スカイツリー

L.tileLayer(
    'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png',
    {maxZoom: 18}
).addTo(map);

var popup = L.popup();
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent(",クリック位置 " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);

