/**
 * Created by Kelly on 2/20/2015.
 */
(function () {
    angular.module('accessibleVancouver').controller('MapController', ['$scope', 'MapService',
        function($scope, MapService) {
            var Map = MapService;
            Map.initialize();

            $scope.refreshPosition = function() {
                Map.setPosition();
            }
    }]);
})();