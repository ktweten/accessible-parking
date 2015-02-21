/**
 * Created by Kelly on 2/20/2015.
 */
(function () {
    angular.module('accessibleVancouver').service('MapService', ['$http', function($http) {
        var map;
        var center = {
            latitude: 49.275,
            longitude: -123.115,
            accuracy: ''
        };
        var infowindow;

        function setCenter(position) {
            // Minimum accuracy is 100 meters, otherwise use the default location.
            if (position.coords.accuracy < 100) {
                center.latitude = position.coords.latitude;
                center.longitude = position.coords.longitude;
            }

            initialize();
        }

        function setPosition() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(setCenter, initialize, {enableHighAccuracy: true})
            } else {
                initialize();
            }
        }

        function initialize() {
            loadMap();
            loadParkingData();
            loadMarker();
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
            text = text.slice(0, index);

            if (infowindow) {
                infowindow.close();
            }
            infowindow = new google.maps.InfoWindow({
                content: text,
                position: kmlEvent.latLng
            });
            infowindow.open(map);
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

        function loadMarker() {
            var image = {
                url: 'img/location.png',
                size: new google.maps.Size(120, 120),
                anchor: new google.maps.Point(10, 10)
            };
            var coordinates = new google.maps.LatLng(center.latitude, center.longitude);
            var marker = new google.maps.Marker({
                position: coordinates,
                map: map
            });
        }

        this.initialize = function() {
            setPosition();
        };

    }]);
})();