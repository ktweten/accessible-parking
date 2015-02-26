/**
 * Created by Kelly on 2/20/2015.
 */
(function () {
    angular.module('VancouverAccessibleParking').controller('MapController', ['$scope', 'MapService',
        function($scope, MapService) {
            var Map = MapService,
                autocompleteService = new google.maps.places.AutocompleteService();

            Map.initialize();
            $scope.tracking = false;
            $scope.searchText = "";
            $scope.predictions = [];

            $scope.toggleTracking = function() {
                $scope.tracking = !$scope.tracking;
                Map.toggleTracking();
            };

            function updatePredictions(predictions, status) {
                $scope.predictions = predictions;
            }

            $scope.update = function() {
                var options = {
                    input: $scope.searchText,
                    bounds: Map.getBounds()
                };

                if ($scope.searchText) {
                    autocompleteService.getQueryPredictions(options, updatePredictions);
                }
            };

            $scope.setPlace = function(place) {
                blurSearch();
                $scope.searchText = place.description;
                $scope.predictions = [];
                if (place.place_id) {
                    Map.getPlaceDetails(place);
                } else {
                    Map.getPlaces($scope.searchText);
                }
            };

            $scope.enterText = function() {
                $scope.$apply(function() {
                    blurSearch();
                    $scope.predictions = [];
                    Map.getPlaces($scope.searchText);}
                );
            };

            function blurSearch() {
                var search = document.getElementById('search');

                if (search) {
                    search.blur();
                    if (window.cordova) {
                        cordova.plugins.Keyboard.close();
                    }
                }
            }
    }]);
})();