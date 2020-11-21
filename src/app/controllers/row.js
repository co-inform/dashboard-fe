define([
    'angular',
    'app',
    'underscore'
],
function (angular, app, _) {
    'use strict';

    var module = angular.module('kibana.controllers');

    module.controller('RowCtrl', function ($scope, $rootScope, $timeout, dashboard, ejsResource, sjsResource, querySrv) {
        var _d = {
            title: "Row",
            height: "150px",
            collapse: false,
            showHeader: false,
            collapsable: true,
            editable: true,
            panels: []
        };

        _.defaults($scope.row, _d);
        if ($scope.row.showFirstTime) {
            console.log('Loading row for dboard', dashboard);
            let myStorage = window.localStorage;
            let dboardSeenKey = 'dashboard-' + dashboard.current.hashCode + '-seen';
            console.log('retrieving localStorage value for', dboardSeenKey);
            let dboardSeen = myStorage.getItem(dboardSeenKey);
            console.log('dboardSeen value', dboardSeen);
            if (!dboardSeen) {
                // the user has not seen this row yet, so make sure it's not collapsed
                $scope.row.collapse = false;
                myStorage.setItem(dboardSeenKey, 'yes'); // and remember the user has now seen it
            }
        }
        $scope.row.showHeader = dashboard.current.coinform_experimental || $scope.row.collapse; //initially, make sure these are aligned

        $scope.init = function () {
            $scope.querySrv = querySrv;
            $scope.reset_panel();
        };

        $scope.toggle_row = function (row) {
            if (!row.collapsable) {
                return;
            }
            row.collapse = row.collapse ? false : true;
            console.log("scope", $scope);
            console.log("rootScope", $rootScope);
            console.log("dashboard", dashboard);
            row.showHeader = dashboard.current.coinform_experimental || row.collapse; // by default, show header when row is collapsed
            if (!row.collapse) {
                $timeout(function () {
                    $scope.$broadcast('render');
                });
            }
        };

        $scope.rowSpan = function (row) {
            var panels = _.filter(row.panels, function (p) {
                return $scope.isPanel(p);
            });
            return _.reduce(_.pluck(panels, 'span'), function (p, v) {
                return p + v;
            }, 0);
        };

        // This can be overridden by individual panels
        $scope.close_edit = function () {
            $scope.$broadcast('render');
        };

        $scope.add_panel = function (row, panel) {
            $scope.row.panels.push(panel);
        };

        $scope.reset_panel = function (type) {
            var
                defaultSpan = 4,
                _as = 12 - $scope.rowSpan($scope.row);

            $scope.panel = {
                error: false,
                span: _as < defaultSpan && _as > 0 ? _as : defaultSpan,
                editable: true,
                type: type
            };
        };

        $scope.click_to_expand_or_collapse = function(row) {
            if (!row.collapsable) return "";
            if (row.collapse) return "(click to expand)";
            return "(click to collapse)";
        }

        $scope.init();
    });
});
