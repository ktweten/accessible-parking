/**
 * Created by Kelly on 2/20/2015.
 */
(function () {
    'use strict';

    angular.module('VancouverAccessibleParking').controller('MapController', ['$scope', 'MapService',
        function ($scope, MapService) {
            var Map = MapService,
                autocompleteService = new google.maps.places.AutocompleteService();

            $scope.tracking = false;
            $scope.searchText = "";
            $scope.predictions = [];

            function updatePredictions(predictions, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    $scope.predictions = predictions;
                }
            }

            function blurSearch() {
                var search = document.getElementById('search');

                if (search) {
                    search.blur();
                    if (window.cordova) {
                        cordova.plugins.Keyboard.close();
                    }
                }
            }

            $scope.toggleTracking = function () {
                $scope.tracking = !$scope.tracking;
                Map.toggleTracking();
            };

            $scope.update = function () {
                var options = {
                    input: $scope.searchText,
                    bounds: Map.getBounds()
                };

                if ($scope.searchText) {
                    autocompleteService.getQueryPredictions(options, updatePredictions);
                }
            };

            $scope.setPlace = function (place) {
                blurSearch();
                $scope.searchText = place.description;
                $scope.predictions = [];
                if (place.place_id) {
                    Map.getPlaceDetails(place);
                } else {
                    Map.getPlaces($scope.searchText);
                }
            };

            $scope.enterText = function () {
                $scope.$apply(function () {
                    blurSearch();
                    $scope.predictions = [];
                    Map.getPlaces($scope.searchText);
                });
            };
        }]);
})();
