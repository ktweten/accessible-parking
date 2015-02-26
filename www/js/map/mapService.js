/**
 * Created by Kelly on 2/20/2015.
 */
(function () {
    angular.module('VancouverAccessibleParking').service('MapService', ['$http', function($http) {
        var center = {
                latitude: 49.275,
                longitude: -123.115
            },
            currentMarker,
            infoWindow,
            map,
            placeMarkers = [],
            placeService,
            self = this,
            watchId;

        self.predictions = [];

        function setCenter(position) {
            // Minimum accuracy is 100 meters, otherwise use the default location.
            if (position.coords.accuracy < 100) {
                center.latitude = position.coords.latitude;
                center.longitude = position.coords.longitude;
            }
            positionMarker();
        }

        function makeInfoWindow(place) {

            return function() {
                if (infoWindow) {
                    infoWindow.close();
                }

                infoWindow = new google.maps.InfoWindow({
                    content: place.title
                });
                infoWindow.open(map, place);
            };
        }

        function setMapBounds() {
            var innerBounds = new google.maps.LatLngBounds(),
                outerBounds = new google.maps.LatLngBounds(),
                currentInBounds = true,
                markerInBounds = false,
                oldBounds = map.getBounds(),
                i;

            if (currentMarker && currentMarker.getPosition() && !oldBounds.contains(currentMarker.getPosition())) {
                innerBounds.extend(currentMarker.getPosition());
                outerBounds.extend(currentMarker.getPosition());
                currentInBounds = false;
            }

            for (i = 0; i < placeMarkers.length; i += 1) {
                if (oldBounds.contains(placeMarkers[i].position)) {
                    markerInBounds = true;
                    innerBounds.extend(placeMarkers[i].position);
                } else {
                    outerBounds.extend(placeMarkers[i].position);
                }
            }

            if (!currentInBounds) {
                map.fitBounds(innerBounds);
            } else if (!markerInBounds && placeMarkers.length > 0) {
                map.fitBounds(outerBounds);
            }
        }

        function setMarker(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                setPlaceMarkers([place]);
            }
        }

        this.getPlaceDetails = function(place) {
            placeService.getDetails({ placeId: place.place_id }, setMarker);
        };

        this.getPlaces = function(searchTerm) {
            var options = {
                bounds: map.getBounds(),
                keyword: searchTerm
            };

            placeService.nearbySearch(options, setPlaceMarkers);
        };

        function setControls() {
            var input = document.getElementById('entry');
            var tracking = document.getElementById('tracking-toggle');

            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
            map.controls[google.maps.ControlPosition.RIGHT_TOP].push(tracking);
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
                    icon: { url: 'http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png' },
                    map: map
                });
                setMapBounds();
            } else {
                currentMarker.setPosition(coordinates);
            }
        }

        this.initialize = function() {
            loadMap();
            setControls();
            loadParkingData();
            placeService = new google.maps.places.PlacesService(map);
        };

        this.toggleTracking = function() {

            var container = document.getElementsByClassName('pac-container');
            if (container && container.length > 0) {
                container[0].setAttribute('data-tap-disabled', 'true');
            }

            if (currentMarker) {
                if (watchId) {
                    navigator.geolocation.clearWatch(watchId);
                    watchId = null;
                }

                currentMarker.setMap(null);
                currentMarker = null;
            } else {
                var options = {
                    enableHighAccuracy: true,
                    timeout: 60000
                };

                if (navigator.geolocation) {
                    watchId = navigator.geolocation.watchPosition(setCenter, positionMarker, options);
                } else {
                    positionMarker();
                }
            }
        };

        function clearPlaceMarkers() {
            for (var i = 0; i < placeMarkers.length; i += 1) {
                placeMarkers[i].setMap(null);
                placeMarkers[i] = null;
            }
            placeMarkers = [];
        }

        function setPlaceMarkers(places, status) {
            var i;
            clearPlaceMarkers();

            if (places.length > 0) {
                for (i = 0; i < places.length; i += 1) {
                    marker = new google.maps.Marker({
                        map: map,
                        title: places[i].name,
                        position: places[i].geometry.location
                    });

                    google.maps.event.addListener(marker, 'click', makeInfoWindow(marker));
                    placeMarkers.push(marker);
                }

                setMapBounds();
            }
        }

        this.getBounds = function() {
            return map.getBounds();
        };

    }]);
})();
