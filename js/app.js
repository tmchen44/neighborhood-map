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

function createMarkers(markers, results) {
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        var marker = new google.maps.Marker({
            position: result.geometry.location,
            map: map,
            title: result.name,
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
            setTimeout(function() {
                self.setAnimation(null);
            }, 750);
        });
        markers.push(marker);
    }
}

function getPlaceDetails(marker, infoWindow) {
    var service = new google.maps.places.PlacesService(map);
    // Callback from Places Details Service
    function googlePlacesCallback(place, status) {
        var googleInfo = {};
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            marker.details.address = place.formatted_address;
            googleInfo = place;
            googleInfo.successful = true;
        } else {
            googleInfo.successful = false;
        }
        // Call Foursquare Venue Search Service
        foursquareSearch(marker, googleInfo);
    }
    // Call to Google Place Details service
    service.getDetails({
        placeId: marker.details.id
    }, googlePlacesCallback);
}

function foursquareSearch(marker, googleInfo) {
    // Define search parameters for call to Foursquare Venue Search
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
    var result = {}
    $.ajax({
        method: 'GET',
        dataType: "json",
        url: "https://api.foursquare.com/v2/venues/search",
        data: search_params,
        success: function(results) {
            if (results.meta.code == 200) {
                // Populate info window with Google and Yelp data
                populateInfoWindow(googleInfo, foursquareInfo, marker);
                getFoursquareDetails(results, googleInfo);
            } else {
                result = { successful: false };
            }
        },
        error: function() {
            result = { successful: false };
        }
    });
}

function getFoursquareDetails(results) {
    // Call to Yelp Venue Details API
    if (results.response.venues.length > 0) {
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
                results.successful = true;
                return results;
            },
            error: function() {
                return { successful: false };
            }
        });
    } else {
        return { successful: false };
    }
}

function populateInfoWindow(googleInfo, yelpInfo, marker) {
    var innerHTML = '<div id="infoWindow">';
    // Photo, name, address, phone number
    if (googleInfo.successful) {
        if (googleInfo.photos) {
            var srcURL = googleInfo.photos[0].getUrl({ maxHeight: 75, maxWidth: 75 });
            innerHTML += '<img src="' + srcURL + '"><br>';
        }
        if (googleInfo.name) {
            innerHTML += '<strong>' + googleInfo.name + '</strong><br>';
        }
        if (googleInfo.formatted_address) {
            innerHTML += googleInfo.formatted_address + '<br>';
        }
        if (googleInfo.formatted_phone_number) {
            innerHTML += googleInfo.formatted_phone_number + '<br>';
        }
    } else {
        innerHTML += "Call to Google Place Details API failed or returned no results.<br>";
    }
    // Yelp rating info and link to Yelp business page
    if (yelpInfo.successful) {
        // star rating
        var rating = yelpInfo.rating;
        var main = Math.floor(rating / 1);
        var num_string = main.toString();
        if (rating - main > 0) {
            num_string += "_half";
        }
        var img_url = "small_" + num_string + ".png";
        innerHTML += '<img src="img/stars/small/' + img_url + '">';
        innerHTML += '<a href="' + yelpInfo.url + '"><img id=yelp-logo src="img/yelp_logo_tm/yelp.png"></a><br>';
        innerHTML += yelpInfo.review_count + ' reviews';
    } else {
        innerHTML += "Call to Yelp Business API failed or returned no results.<br>";
    }
    // Hours of operation
    if (googleInfo.opening_hours) {
        innerHTML += '<br><strong>Hours:</strong><br>';
        for (var i = 0; i < 7; i++) {
            innerHTML += googleInfo.opening_hours.weekday_text[i] + '<br>';
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
