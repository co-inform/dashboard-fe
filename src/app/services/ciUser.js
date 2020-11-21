define([
    'angular',
    'jquery',
    'kbn',
    'underscore',
    'config',
    'jwt_decode',
    'moment',
    'modernizr'
],
  function (angular, $, kbn, _, config, jwt_decode, moment, Modernizr) {
    'use strict';

    var DEBUG = false; //DEBUG mode

    var module = angular.module('kibana.services');
    module.service('ciUser', function($routeParams, $http, $rootScope, $injector, $location,
                                      sjsResource, timer, $timeout, kbnIndex, alertSrv) {
        // Store a reference to this
        var self = this;

        // A hash of defaults to use when loading the dashboard
        var _ciUser = {
            loggedIn: false, // by default logged off
            email: null,
            token: null
        }

        _.defaults(self, _ciUser);
        
        this.login = function(credentials) {
            var promise = $http({
                url: "https://api.coinform.eu/login",
                method: "POST",
                data: credentials
            }).error(function(data, status, headers, config){
                console.log("Failed login? with", data, status, headers, config);
            }).success(function(data, status, headers, config){
                if (status === 401) {
                    alertSrv.set("error", "Failed to login. " + data.message);
                } else if (status === 200) {
                    alertSrv.set("info", "Welcome, " + credentials.email);
                    self.loggedIn = true;
                    self.email = credentials.email;
                    self.token = data.token;
                } else {
                    console.log("Succeeded login? with data", data);
                    console.log("Succeded login? with status", status);
                    console.log("Succeded login? with headers", headers);
                    console.log("Succeded login? with config", config);
                    alertSrv.set("error", "Unknown problem logging in. Code " + status + " message " + data.message);
                }
            });

            promise.then(function(data) {
                console.log('Received from coinform login', data);
                let token = data.data.token;
                let decoded = jwt_decode(token);
                console.log('Coinform Token', decoded);
                return data;
            }, function() {
                console.log('Received empty result from coinform login');
                return false;
            });
                return promise;
        }
    });
           
});
