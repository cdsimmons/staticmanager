'use strict';

/**
 * The main Sails Angular app module
 *
 * @type {angular.Module}
 */
var app = angular.module('app', [
    'ngRoute', 
    'ui.bootstrap', 
    'sails.io',
    'underscore',
    'angularFileUpload'
]);

app.config(function AppConfig($routeProvider, $locationProvider) {

    $routeProvider
        .when('/', {
            templateUrl: '/views/document/create.html',
            controller: 'DocumentCtrl'
        })
        .when('/view/:id', {
            templateUrl: '/views/document/view.html',
            controller: 'DocumentCtrl'
        })
        .when('/cms/:id', {
            templateUrl: '/views/document/cms.html',
            controller: 'DocumentCtrl'
        })

        .when('/login/:id', {
            templateUrl: '/views/user/login.html',
            controller: 'LoginCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });

    // enable html5Mode for pushstate ('#'-less URLs)
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    // Sails
    //$sailsProvider.url = '/';
});

// Prefer Underscore to be injected
var underscore = angular.module('underscore', []);
underscore.factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
});

// Something is getting all of the js files again and applying a cache buster... not sure what though, so the requests are still being made
// However, with no cache-busting, can rely on browser's own caching to make things smooth
jQuery.ajaxSetup({ cache: true });