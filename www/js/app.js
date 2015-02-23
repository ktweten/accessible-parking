angular.module('accessibleVancouver', ['ionic'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $ionicConfigProvider.platform.android.tabs.position("bottom");

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            .state('map', {
                url: "/map",
                templateUrl: 'appTemplates/map.html',
                controller: 'MapController'
            })

            .state('info', {
                url: "/info",
                templateUrl: 'appTemplates/info.html'
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/map');

    });
