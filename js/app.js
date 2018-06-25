var map;
var searchMarkers = [];

function toggleNav() {
    var nav = document.querySelector("nav");
    nav.classList.toggle("open");
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.8715926, lng: -122.272747 },
        zoom: 15,
        mapTypeControl: false
    });
}

function setMapOnAll(markers, map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

function createMarkers(markers, results) {
    for (var i = 0; i < results.length; i++) {
        markers.push(new google.maps.Marker({
            position: results[i].geometry.location,
            map: map
        }));
    }
}

function showMarkers(markers) {
    setMapOnAll(markers, map);
}

function hideMarkers(markers) {
    setMapOnAll(markers, null);
}

function deleteSearchMarkers() {
    hideMarkers(searchMarkers);
    searchMarkers = [];
    document.getElementById("search-text").value = '';
}

function searchPlaces() {
    var bounds = map.getBounds();
    var placesService = new google.maps.places.PlacesService(map)
    placesService.textSearch({
        query: document.getElementById("search-text").value,
        bounds: bounds
    }, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            createMarkers(searchMarkers, results);
        }
    });
}
