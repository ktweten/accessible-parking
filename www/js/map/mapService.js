/**
 * Created by Kelly on 2/20/2015.
 */
(function () {
    angular.module('VancouverAccessibleParking').service('MapService', ['$http', function($http) {
        var map,
            searchBox,
            infoWindow,
            markers = [],
            currentMarker,
            watchId,
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

        function makeMarkerCallback(point) {
            var marker = point;

            return function() {

                if (infoWindow) {
                    infoWindow.close();
                }

                infoWindow = new google.maps.InfoWindow({
                    content: marker.title
                });
                infoWindow.open(map, marker);
            }
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

            for (i = 0; i < markers.length; i += 1) {
                // Check if the existing map bounds contains at least one of the new places.
                if (oldBounds.contains(markers[i].position)) {
                    markerInBounds = true;
                    innerBounds.extend(markers[i].position);
                } else {
                    outerBounds.extend(markers[i].position);
                }
            }

            if (!currentInBounds) {
                map.fitBounds(innerBounds);
            } else if (!markerInBounds && markers.length > 0) {
                map.fitBounds(outerBounds);
            }
        }

        function setPlaceMakers() {
            var places = searchBox.getPlaces(),
                marker,
                search;

            search = document.getElementById('search');

            if (search) {
                search.blur();
                if (window.cordova) {
                    cordova.plugins.Keyboard.close();
                }
            }

            if (places.length > 0) {
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(null);
                }
                markers = [];


                for (var j = 0, place; place = places[j]; j++) {
                    marker = new google.maps.Marker({
                        map: map,
                        title: place.name,
                        position: place.geometry.location
                    });

                    google.maps.event.addListener(marker, 'click', makeMarkerCallback(marker));

                    markers.push(marker);
                }

                setMapBounds();
            }
        }

        function setControls() {
            var input = document.getElementById('search');
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            var tracking = document.getElementById('tracking-toggle');
            map.controls[google.maps.ControlPosition.RIGHT_TOP].push(tracking);

            searchBox = new google.maps.places.SearchBox(input);
        }

        function setListeners() {
            google.maps.event.addListener(searchBox, 'places_changed', setPlaceMakers);

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
            setListeners();
            loadParkingData();
        };

        this.toggleTracking = function() {

            var container = document.getElementsByClassName('pac-container');
            if (container && container.length > 0) {
                alert("Found");
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

    }]);
})();
