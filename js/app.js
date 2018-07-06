/*
 * Global variables
 */

var CLIENT_ID = "UPFB0B0MOW5N3W5TJAXYO1MGZBBPXTRVYSYUE5Y5IYV0XHDL";
var CLIENT_SECRET = "21VOTJQNGFB1UZ3HWWN4KTVZEECX0PNLZOWDZY4DHL4OR0Q4";
var VERSION = "20180628";
var map;
var searchMarkers = [];
var infoWindow;

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
    infoWindow = new google.maps.InfoWindow();
}

function setMapOnAll(markers, map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

function showMarkers(markers) {
    setMapOnAll(markers, map);
}

function hideMarkers(markers) {
    setMapOnAll(markers, null);
}

function deleteMarkers() {
    hideMarkers(searchMarkers);
    searchMarkers = [];
}

function clearSearch() {
    deleteMarkers();
    document.getElementById("search-text").value = '';
}

function searchPlaces() {
    var bounds = map.getBounds();
    var placesService = new google.maps.places.PlacesService(map);
    infoWindow.close();
    deleteMarkers();
    placesService.textSearch({
        query: document.getElementById("search-text").value,
        bounds: bounds
    }, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            createMarkers(searchMarkers, results);
        }
    });
}

function createMarkers(markers, results) {
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        var marker = new google.maps.Marker({
            position: result.geometry.location,
            map: map,
            title: result.name,
            icon: "img/place_red.svg",
            details: {
                id: result.place_id,
                name: result.name,
                latlong: result.geometry.location.lat() + ',' + result.geometry.location.lng()
            }
        });
        marker.addListener('click', function() {
            getPlaceDetails(this, infoWindow);
            var self = this;
            self.setAnimation(google.maps.Animation.BOUNCE);
            self.setIcon('img/place_green.svg');
            setTimeout(function() {
                self.setAnimation(null);
            }, 750);
        });
        function closeCallback(marker) {
            return function() {
                marker.setIcon('img/place_red.svg');
            }
        }
        infoWindow.addListener('closeclick', closeCallback(marker));
        markers.push(marker);
    }
}

function getPlaceDetails(marker, infoWindow) {
    var service = new google.maps.places.PlacesService(map);
    // Callback from Places Details Service
    function googlePlacesCallback(place, status) {
        var placeInfo = { Google: {}, Foursquare: {} };
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            marker.details.address = place.formatted_address;
            placeInfo.Google.info = place;
            placeInfo.Google.success = true;
        } else {
            placeInfo.Google.success = false;
        }
        // Call Foursquare Venue Search
        foursquareSearch(marker, placeInfo);
    }
    // Call to Google Place Details service
    service.getDetails({
        placeId: marker.details.id
    }, googlePlacesCallback);
}

function foursquareSearch(marker, placeInfo) {
    // Define search parameters for Foursquare Venue Search
    var result;
    var search_params = {
        query: marker.details.name,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        v: VERSION
    }
    if (marker.details.address) {
        search_params.near = marker.details.address;
    } else {
        search_params.ll = marker.details.latlong;
        search_params.radius = 50;
    }
    // AJAX call to Foursquare Venue Search
    $.ajax({
        method: 'GET',
        dataType: "json",
        url: "https://api.foursquare.com/v2/venues/search",
        data: search_params,
        success: function(results) {
            if (results.meta.code == 200 && results.response.venues.length > 0) {
                placeInfo.Foursquare.success = true;
                getFoursquareDetails(marker, results, placeInfo);
            } else {
                placeInfo.Foursquare.success = false;
                populateInfoWindow(marker, placeInfo);
            }
        },
        error: function() {
            placeInfo.Foursquare.success = false;
            populateInfoWindow(marker, placeInfo);
        }
    });
}

function getFoursquareDetails(marker, results, placeInfo) {
    // Call to Foursquare Venue Details API
    var venue_id = results.response.venues[0].id;
    var url = "https://api.foursquare.com/v2/venues/" + venue_id;
    var search_params = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        v: VERSION
    }
    $.ajax({
        dataType: "json",
        url: url,
        data: search_params,
        success: function(results) {
            if (results.meta.code == 200) {
                placeInfo.Foursquare.success = true;
                placeInfo.Foursquare.info = results.response.venue;
            } else {
                placeInfo.Foursquare.success = false;
            }
        },
        error: function() {
            placeInfo.Foursquare.success = false;
        },
        complete: function() {
            // Populate info window with Google and Foursquare data
            // console.log(placeInfo);
            populateInfoWindow(marker, placeInfo);
        }
    });
}

function populateInfoWindow(marker, placeInfo) {
    var innerHTML = '<div id="infoWindow">';
    // Photo, name, address, phone number
    if (placeInfo.Google.success) {
        if (placeInfo.Google.info.photos) {
            var srcURL = placeInfo.Google.info.photos[0].getUrl({ maxHeight: 75, maxWidth: 75 });
            innerHTML += '<img src="' + srcURL + '"><br>';
        }
        if (placeInfo.Google.info.name) {
            innerHTML += '<strong>' + placeInfo.Google.info.name + '</strong><br>';
        }
        if (placeInfo.Google.info.formatted_address) {
            innerHTML += placeInfo.Google.info.formatted_address + '<br>';
        }
        if (placeInfo.Google.info.formatted_phone_number) {
            innerHTML += placeInfo.Google.info.formatted_phone_number + '<br>';
        }
        innerHTML += '<br>';
    } else {
        innerHTML += "Call to Google Place Details API failed or returned no results.<br><br>";
    }
    // Foursquare rating and link to Foursquare page
    if (placeInfo.Foursquare.success) {
        if (placeInfo.Foursquare.info.rating) {
            var rating = placeInfo.Foursquare.info.rating;
            innerHTML += '<div class="rating" style="background-color: #' + placeInfo.Foursquare.info.ratingColor + '">' + rating + '</div>';
            innerHTML += 'Based on ' + placeInfo.Foursquare.info.ratingSignals + ' reviews<br>';
        }
        if (placeInfo.Foursquare.info.canonicalUrl) {
            innerHTML += '<a href="' + placeInfo.Foursquare.info.canonicalUrl + '">Link to Foursquare Site</a><br>';
        }
    } else {
        innerHTML += "Call to Foursquare Venue API failed or returned no results.<br>";
    }
    // Hours of operation
    if (placeInfo.Google.info.opening_hours) {
        innerHTML += '<br><strong>Hours:</strong><br>';
        for (var i = 0; i < 7; i++) {
            innerHTML += placeInfo.Google.info.opening_hours.weekday_text[i] + '<br>';
        }
    }
    innerHTML += '</div>';
    infoWindow.setContent(innerHTML);
    infoWindow.open(map, marker);
}

/*
 * Event Listeners
 */

$("#search-text").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#search-submit").click();
    }
});
