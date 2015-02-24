/**
 * Created by Kelly on 2/20/2015.
 */
(function () {
    angular.module('VancouverAccessibleParking').controller('MapController', ['$scope', 'MapService',
        function($scope, MapService) {
            var Map = MapService;
            Map.initialize();
            $scope.tracking = false;

            $scope.toggleTracking = function() {
                $scope.tracking = !$scope.tracking;
                Map.toggleTracking();
            };
    }]);
})();