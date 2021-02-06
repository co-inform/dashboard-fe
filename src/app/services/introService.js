define([
    'angular',
    'intro'
],
function(angular, introJs) {
    'use strict';

    if (typeof introJs == 'object')
		    introJs = introJs.introJs;

    var module = angular.module('kibana.services');
    module.service('introService', function(dashboard, alertSrv) {
        var self = this;
        
        if (typeof (introJs) !== 'function') {
		        let message = 'Intro.js is not available. Make sure it is properly loaded.';
			      alertSrv.set('Error', message, 'error');
		    }

		    var intro;
		    var notifyList = {};
		
		    // var service = {
			  //     addListener: addListener,
			  //     removeListener: removeListener,
			  //     setOptions: setOptions,
			  //     start: start,
			  //     exit: exit,
			  //     clear: clear,
            
			  //     previous: previous,
			  //     next: next,

			  //     refresh: refresh,


			  //     onComplete: onComplete,
			  //     onExit: onExit,
			  //     onBeforeChange: onBeforeChange,
			  //     onAfterChange: onAfterChange,
			  //     onChange: onChange,
            
			  //     addHints: addHints,
			  //     showHints: showHints,
			  //     hideHint: hideHint,
			  //     hideHints:hideHints,

			  //     onHintClick: onHintClick,
			  //     onHintClose: onHintClose,
			  //     onHintsAdded: onHintsAdded,
		    // };
        
		    Object.defineProperty(self, "intro", {
			      get: function () {
				        return intro;
			      },
			      enumerable: true,
			      configurable: true
		    });

		    this.addListener = function(name, cb){
			      if(angular.isFunction(cb))
				        notifyList[name] = cb;
		    };

        this.removeListener = function(name){
			      delete notifyList[name];
		    };

        this.setOptions = function(options) {
			      intro.setOptions(options);
		    };

		    this.start = function(step) {
			      if (typeof (step) === 'number') {
                //console.log('Starting from ', step);
				        intro.start().goToStep(step);
			      } else {
                //console.log('Start intro.js', intro);
				        intro.start();
                //console.log('Return intro.js start');
			      }
            //console.debug('Notifying open');
	          self.notifyListeners('open');
		    };
        
		    this.notifyListeners = function(newSts){
            //console.debug('Notifying ', newSts, notifyList);
			      for(var key in notifyList){
				        if(notifyList.hasOwnProperty(key)){
					          if(angular.isFunction(notifyList[key]))
						            notifyList[key](newSts);
				        }
			      }
		    };
        
		    this.exit = function() {
			      intro.exit();
			      self.notifyListeners('closed');
		    };

		    this.previous = function() {
			      intro.previousStep();
			      self.notifyListeners('previous');
		    };

		    this.next = function() {
			      intro.nextStep();
			      self.notifyListeners('next');
		    };

		    this.refresh = function() {
			      intro.refresh();
		    };

		    this.onComplete = function(cb) {
			      return intro.oncomplete(function () {
				        if(angular.isFunction(cb)) cb();
				        self.notifyListeners('closed');
			      });
		    };

		    this.onBeforeChange = function(cb) {
            if (!angular.isFunction(cb)) console.error('Not a function', cb);
			      return intro.onbeforechange(function (targetElement) {
				        if(angular.isFunction(cb)) cb(targetElement);
			      });
		    };

		    this.onChange = function(cb) {
			      return intro.onchange(function(targetElement) {
				        if(angular.isFunction(cb)) cb(targetElement);
			      });
			
		    };
		
		    this.clear = function(cb){
			      if(typeof(intro) !=='undefined')
				        intro.exit();
			      
			      intro = new introJs();
			      
			      self.notifyListeners('closed');
			      
			      if(angular.isFunction(cb)) cb();
			      
			      return intro;
		    };

		    this.onAfterChange = function(cb) {
			      return intro.onafterchange(function (targetElement) {
				        if(angular.isFunction(cb)) cb(targetElement);
			      });
		    };

		    this.onExit = function(cb) {
			      return intro.onexit(function () {
				        self.notifyListeners('closed');
				        if(angular.isFunction(cb)) cb();
			      });
		    };
		
		    this.addHints = function(){
			      return intro.addHints();
		    };

		    this.showHints = function(){
			      return intro.showHints();
		    };
        
		    this.hideHint = function(step){
			      return intro.hideHint(step);
		    };
        
		    this.hideHints = function() {
			      return intro.hideHints();
		    }

		    this.onHintClick = function(cb){
			      intro.onhintclick(function () {
				        if(angular.isFunction(cb)) cb();
			      });
		    };
		
		    this.onHintClose = function(cb){			
			      return intro.onhintclose(function () {
				        if(angular.isFunction(cb)) cb();
			      });
		    };
		
		    this.onHintAdded = function(cb){			
			      return intro.onhintclose(function () {
				        if(angular.isFunction(cb)) cb();
			      });
		    };
		
		    this.clear();
		
    });
});
