# Neighborhood Map

This neighborhood map allows for users to view and delete their favorite places, as well as search for and add new ones.

## Setting Up

#### Quick Start:
1. Clone this repository.
2. Use a browser to open `index.html`.
3. Use the navigation menu to search for new places or filter saved places. Searched places are colored red, saved places are colored blue.
4. Click on a saved list item or any marker to open an infowindow with more detailed information about that place.
5. Use the `Save` button in the infowindow to add the place to your saved places.
6. You may delete a saved place using the list view.

#### User Notes:

- This project uses the Google Maps API.
- AJAX calls are made to Foursquare to retrieve ratings and a link to the place's Foursquare page.

## Project Overview

This project is a single-page application that helps users find and manage their places of interest on a map. Map functionality is provided by the Google Maps API. Additional place details are obtained through calls to the Foursquare API.

Data model and view management is accomplished using KnockoutJS. Users may add selected search places to saved places and may delete saved places.
