define([
    'angular',
    'app',
    'underscore'
],
function (angular, app, _) {
    'use strict';

    var module = angular.module('kibana.controllers');

    module.controller('RowCtrl', function ($scope, $rootScope, $timeout, dashboard, ejsResource, sjsResource, querySrv, introService) {
        var _d = {
            title: "Row",
            height: "150px",
            collapse: false,
            showHeader: false,
            collapsable: true,
            editable: true,
            dev_only: false,
            panels: []
        };

        _.defaults($scope.row, _d);

        
        let renderHelpMessage = function(item) {
            if (!item.help_message)
                return "No help message available";
            if (item.info_mode == "markdown") {
                var converter = new Showdown.converter();
                var textConverted = item.help_message.replace(/&/g, '&amp;')
                    .replace(/>/g, '&gt;')
                    .replace(/</g, '&lt;');
                return converter.makeHtml(textConverted);
            } else if (item.info_mode == "html") {
                return item.help_message;
            } else if (item.info_mode == "text") {
                return item.help_message;
            } else {
                return "Unsupported tooltip with info_mode: " + panel.info_mode;
            }
        };

        let dboardToIntroOptions = function() {
            let sideCol = dashboard.current.sideColumn;
            let steps = [];
            if (sideCol) {
                let step0 = {
                    element:'#startTutorial',
                    intro: renderHelpMessage(dashboard.current) || "It looks like this is your first visit (to this version of the dashboard).<br>Follow this tutorial to get acquainted with the dashboard. You can always start this tutorial by clicking on the highlighted button.",
                    position: 'left'
                };
                let stepA = {
                    element: '#sideBarOpenBtn',
                    intro: sideCol.help_message_collapsed
                };
                let stepB = {
                    element: '#mySidebar',
                    intro: renderHelpMessage(sideCol),
                    position: 'right'
                };
                steps.push(step0);
                steps.push(stepA);
                steps.push(stepB);
            }
            dashboard.current.rows.forEach((row, index) => {
                if (row.dev_only) return;
                steps.push({
                    element: '#row-' + index,
                    intro: renderHelpMessage(row) || row.title
                });
                return;
            });
            let finalStep = {
                element: '#startTutorial',
                intro: renderHelpMessage({
                    info_mode: "markdown",
                    help_message: "### Dashboard Tutorial\nThis concludes this tutorial. Remember you can always (re)start this tutorial by clicking on the *tutorial* button on the top right.\nThanks for using this dashboard.",
                    position: 'left'
                })
            };
            steps.push(finalStep);
            return {steps: steps};
        };
        introService.clear();
        let handleIntroBeforeChange = function(targetElt) {
            console.log('On Before Change to', targetElt);
            if (targetElt.id == 'mySidebar') openNav();
        };
        let introOptions = dboardToIntroOptions();
        introService.setOptions(introOptions);
        introService.addHints();
        introService.addListener('ciListener', function(event, payload) {
            console.debug('Intro event', event, 'with payload', payload);
        });
        introService.onBeforeChange(handleIntroBeforeChange);

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
                setTimeout(function(){ 
                    introService.start();}, 500);
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

        $scope.row_dev_hide = function(row) {
            let result = dashboard.current.prod_mode && row.dev_only;
            return result;
        };

        $scope.rowIntroHelpMessage = function(row) {
            return row.help_message;
        };

        // This can be overridden by individual panels
        $scope.close_edit = function () {
            $scope.$broadcast('render');
        };

        $scope.add_panel = function (row, panel) {
            $scope.row.panels.push(panel);
        };

        
        $scope.panelTooltip = function(panel) {
            if (!panel.show_help_message)
                return null;
            if (!panel.help_message)
                return null;
            return renderHelpMessage(panel);
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
        };

        $scope.init();
    });

});
