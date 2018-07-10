# Neighborhood Map

This neighborhood map allows for users to view their favorite places, as well as search for new ones.

## Setting Up

#### Quick Start:
1. Clone this repository.
2. Use a browser to open `index.html`.
3. Use the navigation menu to search for new places or filter saved places. Searched places are colored red, saved places are colored blue.
4.  Click on a place marker to open an infowindow with more detailed information about that place.

#### User Notes:

- This project uses the Google Maps API.
- AJAX calls are made to Foursquare to retrieve ratings and a link to the place's Foursquare page.
- Functionality to add and delete from the saved places list will be added in the near future.

## Project Overview

This project is a single-page application that helps users find and manage their places of interest on a map. Map functionality is provided by the Google Maps API. Additional place details are obtained through calls to the Foursquare API.

Data model and view management is accomplished using KnockoutJS. Functionality to add selected search places to saved places will be added in the future, along with deleting from saved places.
