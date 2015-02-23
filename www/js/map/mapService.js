/**
 * Created by Kelly on 2/20/2015.
 */
(function () {
    angular.module('accessibleVancouver').service('MapService', ['$http', function($http) {
        var map,
            searchBox,
            infoWindow,
            markers = [],
            currentMarker,
            center = {
            latitude: 49.275,
            longitude: -123.115
        };

        function setCenter(position) {
            // Minimum accuracy is 100 meters, otherwise use the default location.
            if (position.coords.accuracy < 100) {
                center.latitude = position.coords.latitude;
                center.longitude = position.coords.longitude;
            }
            positionMarker();
        }

        function updatePlaces() {
            var places = searchBox.getPlaces(),
                bounds,
                marker,
                i,
                oldBounds = map.getBounds(),
                expandBounds = true;


            if (places.length > 0) {
                for (i = 0; i < markers.length; i++) {
                    markers[i].setMap(null);
                }
                markers = [];

                bounds = new google.maps.LatLngBounds();
                bounds.extend(currentMarker.getPosition());

                for (var i = 0, place; place = places[i]; i++) {

                    // Create a marker for each place.
                    marker = new google.maps.Marker({
                        map: map,
                        title: place.name,
                        position: place.geometry.location
                    });

                    markers.push(marker);
                    bounds.extend(place.geometry.location);

                    // Check if the existing map bounds contains at least one of the new places.
                    if (oldBounds.contains(place.geometry.location)) {
                        expandBounds = false;
                    }
                }

                if (expandBounds) {
                    map.fitBounds(bounds);
                }
            }
        }

        function setControls() {
            var input = document.getElementById('search');
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            var refresh = document.getElementById('refresh');
            map.controls[google.maps.ControlPosition.RIGHT_TOP].push(refresh);

            searchBox = new google.maps.places.SearchBox(input);
        }

        function setListeners() {
            google.maps.event.addListener(searchBox, 'places_changed', updatePlaces);

            google.maps.event.addListener(map, 'bounds_changed', function() {
                var bounds = map.getBounds();
                searchBox.setBounds(bounds);
            });
        }

        function loadMap() {
            var mapOptions = {
                zoom: 13,
                center: new google.maps.LatLng(center.latitude, center.longitude)
            };
            map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        }

        function openInfoWindow(kmlEvent) {
            var text = kmlEvent.featureData.description;
            var index = text.indexOf("<br><a href=");

            if (index >= 0) {
                text = text.slice(0, index);
            }

            if (infoWindow) {
                infoWindow.close();
            }

            infoWindow = new google.maps.InfoWindow({
                content: text,
                position: kmlEvent.latLng
            });
            infoWindow.open(map);
        }

        function loadParkingData() {
            var kmlUrl = 'http://data.vancouver.ca/download/kml/disability_parking.kmz';
            var kmlOptions = {
                suppressInfoWindows: true,
                preserveViewport: true,
                map: map
            };
            var kmlLayer = new google.maps.KmlLayer(kmlUrl, kmlOptions);

            google.maps.event.addListener(kmlLayer, 'click', openInfoWindow);
        }

        function positionMarker() {
            var coordinates = new google.maps.LatLng(center.latitude, center.longitude);

            if (!currentMarker) {
                currentMarker = new google.maps.Marker({
                    position: coordinates,
                    icon: {url: 'http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png'},
                    map: map
                });
            } else {
                currentMarker.setPosition(coordinates);
            }
        }

        this.initialize = function() {
            loadMap();
            setControls();
            setListeners();
            loadParkingData();
            this.setPosition();
        };

        this.setPosition = function() {
            var options = {
                enableHighAccuracy: true,
                timeout: 60000
            };

            if (navigator.geolocation) {
                navigator.geolocation.watchPosition(setCenter, positionMarker, options);
            } else {
                positionMarker();
            }
        };

    }]);
})();
