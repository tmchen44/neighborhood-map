/*
 *  Knockout variables and functions
 */

function Place(place_id, name, categories) {
    var self = this;
    self.place_id = place_id;
    self.name = name;
    // set of category types
    self.categories = categories;
    self.categoryString = "";
    var myArr = Array.from(categories).forEach(function(category, index, array) {
        if (index < array.length - 1) {
            self.categoryString += category + ", ";
        } else {
            self.categoryString += category;
        }
    });
    self.highlighted = ko.observable(false);
    self.selected = ko.observable(false);
    self.show = ko.observable(true);
    console.log(self.categoryString);
}

function NavListViewModel() {
    var self = this;
    self.savedPlaces = ko.observableArray();
    self.createSavedPlaces = function(places) {
        places.forEach(function(place, index, array) {
            savedPlace = new Place(place.place_id, place.name, place.categories);
            self.savedPlaces.push(savedPlace);
        });
        for (var i = 0; i < places.length; i++) {
            var place = places[i];
            var marker = new google.maps.Marker({
                position: place.location,
                map: map,
                title: place.name,
                icon: "img/place_blue.svg",
                details: {
                    id: place.place_id,
                    name: place.name,
                    latlong: place.location.lat + ',' + place.location.lng
                }
            });
            marker.addListener('click', self.getMarkerDetails(marker.details.id));
            marker.addListener('mouseover', self.highlightPlace(marker.details.id));
            marker.addListener('mouseout', self.undoHighlightPlace(marker.details.id));
            savedMarkers.set(marker.details.id, marker);
        }
    }
    self.getMarkerDetails = function(place_id) {
        return function() {
            var marker = savedMarkers.get(place_id);
            if (infoWindow.marker != marker) {
                getPlaceDetails(marker);
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    marker.setAnimation(null);
                }, 750);
                self.savedPlaces().forEach(function(place) {
                    if (place.place_id === place_id) {
                        place.selected(true);
                    } else {
                        place.selected(false);
                    }
                });
            }
        }
    }
    self.highlightPlace = function(place_id) {
        return function() {
            var marker = savedMarkers.get(place_id);
            marker.setIcon('img/place_green.svg');
            self.savedPlaces().forEach(function(place) {
                if (place.place_id === place_id) {
                    place.highlighted(true);
                }
            });
        }
    }
    self.undoHighlightPlace = function(place_id) {
        return function() {
            var marker = savedMarkers.get(place_id);
            marker.setIcon('img/place_blue.svg');
            self.savedPlaces().forEach(function(place) {
                if (place.place_id === place_id) {
                    place.highlighted(false);
                }
            });
        }
    }
    self.filterPlaces = function() {
        closeInfoWindow();
        queryString = document.getElementById("filter-text").value.toLowerCase();
        if (queryString == "") {
            self.showAllPlaces();
            return;
        }
        var queryTerms = [queryString];
        queryString.split(" ").forEach(function(word) {
            queryTerms.push(word);
        });
        self.savedPlaces().forEach(function(place) {
            place.show(false);
            savedMarkers.get(place.place_id).setMap(null);
        });
        queryTerms.forEach(function(query) {
            self.savedPlaces().forEach(function(place) {
                if (place.name.toLowerCase() === query || place.categories.has(query)) {
                    place.show(true);
                    savedMarkers.get(place.place_id).setMap(map);
                }
            });
        });
    }
    self.showAllPlaces = function() {
        closeInfoWindow();
        self.savedPlaces().forEach(function(place) {
            place.show(true);
            savedMarkers.get(place.place_id).setMap(map);
        });
    }
};

/*
 *  Google Map variables and functions
 */

var CLIENT_ID = "UPFB0B0MOW5N3W5TJAXYO1MGZBBPXTRVYSYUE5Y5IYV0XHDL";
var CLIENT_SECRET = "21VOTJQNGFB1UZ3HWWN4KTVZEECX0PNLZOWDZY4DHL4OR0Q4_remove";
var VERSION = "20180628";
var map;
var viewModel;
var searchMarkers = [];
var savedMarkers = new Map();
var infoWindow;
var initialPlaces = [
    {
        name: "Cafe Mezzo",
        location: {
            lat: 37.8661626,
            lng: -122.2587909
        },
        place_id: "ChIJEeIzp-F9hYARAb2PODOZ73k",
        categories: new Set(["salad", "restaurant"])
    },
    {
        name: "Thai Noodle II",
        location: {
            lat: 37.8663725,
            lng: -122.2589573
        },
        place_id: "ChIJBQW82S58hYARkK4Bo_Y2a_M",
        categories: new Set(["thai", "restaurant", "noodles"])
    },
    {
        name: "Sharetea",
        location: {
            lat: 37.8684568,
            lng: -122.2603754
        },
        place_id: "ChIJ51-Rpyh8hYARnjjR-BpyrY8",
        categories: new Set(["tea", "boba"])
    },
    {
        name: "Berkeley Bowl",
        location: {
            lat: 37.8570313,
            lng: -122.2671869
        },
        place_id: "ChIJxRCJY4B-hYAR8pED77RBzRY",
        categories: new Set(["supermarket", "groceries"])
    },
    {
        name: "Trader Joe's",
        location: {
            lat: 37.87173370000001,
            lng: -122.2732356
        },
        place_id: "ChIJiZU6HZl-hYARndMsDjwIF0Y",
        categories: new Set(["groceries", "supermarket"])
    }
];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.8715926, lng: -122.272747 },
        zoom: 15,
        mapTypeControl: false
    });
    infoWindow = new google.maps.InfoWindow();
    viewModel = new NavListViewModel();
    ko.applyBindings(viewModel);
    viewModel.createSavedPlaces(initialPlaces);
}

function toggleNav() {
    var nav = document.querySelector("nav");
    nav.classList.toggle("open");
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

function closeInfoWindow() {
    infoWindow.setContent("");
    infoWindow.close();
    viewModel.savedPlaces().forEach(function(place) {
        place.selected(false);
    });
}

function clearSearch() {
    closeInfoWindow();
    deleteMarkers();
    document.getElementById("search-text").value = '';
}

function searchPlaces() {
    var bounds = map.getBounds();
    var placesService = new google.maps.places.PlacesService(map);
    closeInfoWindow();
    deleteMarkers();
    placesService.textSearch({
        query: document.getElementById("search-text").value,
        bounds: bounds
    }, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            createSearchMarkers(searchMarkers, results);
        }
    });
}

function createSearchMarkers(markers, results) {
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
            if (infoWindow.marker != this) {
                var self = this;
                getPlaceDetails(this);
                self.setAnimation(google.maps.Animation.BOUNCE);
                // self.setIcon('img/place_green.svg');
                setTimeout(function() {
                    self.setAnimation(null);
                }, 750);
            }
        });
        marker.addListener('mouseover', function() {
            this.setIcon('img/place_green.svg');
        });
        marker.addListener('mouseout', function() {
            this.setIcon('img/place_red.svg');
        });
        markers.push(marker);
    }
}

function getPlaceDetails(marker) {
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
            populateInfoWindow(marker, placeInfo);
        }
    });
}

function populateInfoWindow(marker, placeInfo) {
    infoWindow.setContent("");
    infoWindow.marker = marker;
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
    function closeClickCallback(marker) {
        return function() {
            infoWindow.marker = null;
            closeClickEvent.remove();
            viewModel.savedPlaces().forEach(function(place) {
                place.selected(false);
            });
        }
    }
    var closeClickEvent = infoWindow.addListener('closeclick', closeClickCallback(marker));
}

/*
 * Event Listeners
 */

$("#search-text").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#search-submit").click();
    }
});

$("#filter-text").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#filter-submit").click();
    }
});
