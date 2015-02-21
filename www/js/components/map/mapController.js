/**
 * Created by Kelly on 2/20/2015.
 */
(function () {
    angular.module('accessibleVancouver').controller('MapController', ['MapService',
        function(MapService) {
            var Map = MapService;
            Map.initialize();
    }]);
})();