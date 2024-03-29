/*!
 * ui-select
 * http://github.com/angular-ui/ui-select
 * Version: 0.19.7 - 2017-04-15T14:28:36.649Z
 * License: MIT
 */


(function () { 
"use strict";
var KEY = {
    TAB: 9,
    ENTER: 13,
    ESC: 27,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    HOME: 36,
    END: 35,
    BACKSPACE: 8,
    DELETE: 46,
    COMMAND: 91,

    MAP: { 91 : "COMMAND", 8 : "BACKSPACE" , 9 : "TAB" , 13 : "ENTER" , 16 : "SHIFT" , 17 : "CTRL" , 18 : "ALT" , 19 : "PAUSEBREAK" , 20 : "CAPSLOCK" , 27 : "ESC" , 32 : "SPACE" , 33 : "PAGE_UP", 34 : "PAGE_DOWN" , 35 : "END" , 36 : "HOME" , 37 : "LEFT" , 38 : "UP" , 39 : "RIGHT" , 40 : "DOWN" , 43 : "+" , 44 : "PRINTSCREEN" , 45 : "INSERT" , 46 : "DELETE", 48 : "0" , 49 : "1" , 50 : "2" , 51 : "3" , 52 : "4" , 53 : "5" , 54 : "6" , 55 : "7" , 56 : "8" , 57 : "9" , 59 : ";", 61 : "=" , 65 : "A" , 66 : "B" , 67 : "C" , 68 : "D" , 69 : "E" , 70 : "F" , 71 : "G" , 72 : "H" , 73 : "I" , 74 : "J" , 75 : "K" , 76 : "L", 77 : "M" , 78 : "N" , 79 : "O" , 80 : "P" , 81 : "Q" , 82 : "R" , 83 : "S" , 84 : "T" , 85 : "U" , 86 : "V" , 87 : "W" , 88 : "X" , 89 : "Y" , 90 : "Z", 96 : "0" , 97 : "1" , 98 : "2" , 99 : "3" , 100 : "4" , 101 : "5" , 102 : "6" , 103 : "7" , 104 : "8" , 105 : "9", 106 : "*" , 107 : "+" , 109 : "-" , 110 : "." , 111 : "/", 112 : "F1" , 113 : "F2" , 114 : "F3" , 115 : "F4" , 116 : "F5" , 117 : "F6" , 118 : "F7" , 119 : "F8" , 120 : "F9" , 121 : "F10" , 122 : "F11" , 123 : "F12", 144 : "NUMLOCK" , 145 : "SCROLLLOCK" , 186 : ";" , 187 : "=" , 188 : "," , 189 : "-" , 190 : "." , 191 : "/" , 192 : "`" , 219 : "[" , 220 : "\\" , 221 : "]" , 222 : "'"
    },

    isControl: function (e) {
        var k = e.which;
        switch (k) {
        case KEY.COMMAND:
        case KEY.SHIFT:
        case KEY.CTRL:
        case KEY.ALT:
            return true;
        }

        if (e.metaKey || e.ctrlKey || e.altKey) return true;

        return false;
    },
    isFunctionKey: function (k) {
        k = k.which ? k.which : k;
        return k >= 112 && k <= 123;
    },
    isVerticalMovement: function (k){
      return ~[KEY.UP, KEY.DOWN].indexOf(k);
    },
    isHorizontalMovement: function (k){
      return ~[KEY.LEFT,KEY.RIGHT,KEY.BACKSPACE,KEY.DELETE].indexOf(k);
    },
    toSeparator: function (k) {
      var sep = {ENTER:"\n",TAB:"\t",SPACE:" "}[k];
      if (sep) return sep;
      // return undefined for special keys other than enter, tab or space.
      // no way to use them to cut strings.
      return KEY[k] ? undefined : k;
    }
  };

function isNil(value) {
  return angular.isUndefined(value) || value === null;
}

/**
 * Add querySelectorAll() to jqLite.
 *
 * jqLite find() is limited to lookups by tag name.
 * TODO This will change with future versions of AngularJS, to be removed when this happens
 *
 * See jqLite.find - why not use querySelectorAll? https://github.com/angular/angular.js/issues/3586
 * See feat(jqLite): use querySelectorAll instead of getElementsByTagName in jqLite.find https://github.com/angular/angular.js/pull/3598
 */
if (angular.element.prototype.querySelectorAll === undefined) {
  angular.element.prototype.querySelectorAll = function(selector) {
    return angular.element(this[0].querySelectorAll(selector));
  };
}

/**
 * Add closest() to jqLite.
 */
if (angular.element.prototype.closest === undefined) {
  angular.element.prototype.closest = function( selector) {
    var elem = this[0];
    var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;

    while (elem) {
      if (matchesSelector.bind(elem)(selector)) {
        return elem;
      } else {
        elem = elem.parentElement;
      }
    }
    return false;
  };
}

var latestId = 0;

var uis = angular.module('ui.select', [])

.constant('uiSelectConfig', {
  theme: 'bootstrap',
  searchEnabled: true,
  sortable: false,
  placeholder: '', // Empty by default, like HTML tag <select>
  refreshDelay: 1000, // In milliseconds
  closeOnSelect: true,
  skipFocusser: false,
  dropdownPosition: 'auto',
  removeSelected: true,
  resetSearchInput: true,
  generateId: function() {
    return latestId++;
  },
  appendToBody: false,
  spinnerEnabled: false,
  spinnerClass: 'glyphicon glyphicon-refresh ui-select-spin',
  backspaceReset: true
})

// See Rename minErr and make it accessible from outside https://github.com/angular/angular.js/issues/6913
.service('uiSelectMinErr', function() {
  var minErr = angular.$$minErr('ui.select');
  return function() {
    var error = minErr.apply(this, arguments);
    var message = error.message.replace(new RegExp('\nhttp://errors.angularjs.org/.*'), '');
    return new Error(message);
  };
})

// Recreates old behavior of ng-transclude. Used internally.
.directive('uisTranscludeAppend', function () {
  return {
    link: function (scope, element, attrs, ctrl, transclude) {
        transclude(scope, function (clone) {
          element.append(clone);
        });
      }
    };
})

/**
 * Highlights text that matches $select.search.
 *
 * Taken from AngularUI Bootstrap Typeahead
 * See https://github.com/angular-ui/bootstrap/blob/0.10.0/src/typeahead/typeahead.js#L340
 */
.filter('highlight', function() {
  function escapeRegexp(queryToEscape) {
    return ('' + queryToEscape).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
  }

  return function(matchItem, query) {
    return query && matchItem ? ('' + matchItem).replace(new RegExp(escapeRegexp(query), 'gi'), '<span class="ui-select-highlight">$&</span>') : matchItem;
  };
})

/**
 * A read-only equivalent of jQuery's offset function: http://api.jquery.com/offset/
 *
 * Taken from AngularUI Bootstrap Position:
 * See https://github.com/angular-ui/bootstrap/blob/master/src/position/position.js#L70
 */
.factory('uisOffset',
  ['$document', '$window',
  function ($document, $window) {

  return function(element) {
    var boundingClientRect = element[0].getBoundingClientRect();
    return {
      width: boundingClientRect.width || element.prop('offsetWidth'),
      height: boundingClientRect.height || element.prop('offsetHeight'),
      top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
      left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
    };
  };
}]);

/**
 * Debounces functions
 *
 * Taken from UI Bootstrap $$debounce source code
 * See https://github.com/angular-ui/bootstrap/blob/master/src/debounce/debounce.js
 *
 */
uis.factory('$$uisDebounce', ['$timeout', function($timeout) {
  return function(callback, debounceTime) {
    var timeoutPromise;

    return function() {
      var self = this;
      var args = Array.prototype.slice.call(arguments);
      if (timeoutPromise) {
        $timeout.cancel(timeoutPromise);
      }

      timeoutPromise = $timeout(function() {
        callback.apply(self, args);
      }, debounceTime);
    };
  };
}]);

uis.directive('uiSelectChoices',
  ['uiSelectConfig', 'uisRepeatParser', 'uiSelectMinErr', '$compile', '$window',
  function(uiSelectConfig, RepeatParser, uiSelectMinErr, $compile, $window) {

  return {
    restrict: 'EA',
    require: '^uiSelect',
    replace: true,
    transclude: true,
    templateUrl: function(tElement) {
      // Needed so the uiSelect can detect the transcluded content
      tElement.addClass('ui-select-choices');

      // Gets theme attribute from parent (ui-select)
      var theme = tElement.parent().attr('theme') || uiSelectConfig.theme;
      return theme + '/choices.tpl.html';
    },

    compile: function(tElement, tAttrs) {

      if (!tAttrs.repeat) throw uiSelectMinErr('repeat', "Expected 'repeat' expression.");

      // var repeat = RepeatParser.parse(attrs.repeat);
      var groupByExp = tAttrs.groupBy;
      var groupFilterExp = tAttrs.groupFilter;

      if (groupByExp) {
        var groups = tElement.querySelectorAll('.ui-select-choices-group');
        if (groups.length !== 1) throw uiSelectMinErr('rows', "Expected 1 .ui-select-choices-group but got '{0}'.", groups.length);
        groups.attr('ng-repeat', RepeatParser.getGroupNgRepeatExpression());
      }

      var parserResult = RepeatParser.parse(tAttrs.repeat);

      var choices = tElement.querySelectorAll('.ui-select-choices-row');
      if (choices.length !== 1) {
        throw uiSelectMinErr('rows', "Expected 1 .ui-select-choices-row but got '{0}'.", choices.length);
      }

      choices.attr('ng-repeat', parserResult.repeatExpression(groupByExp))
             .attr('ng-if', '$select.open'); //Prevent unnecessary watches when dropdown is closed


      var rowsInner = tElement.querySelectorAll('.ui-select-choices-row-inner');
      if (rowsInner.length !== 1) {
        throw uiSelectMinErr('rows', "Expected 1 .ui-select-choices-row-inner but got '{0}'.", rowsInner.length);
      }
      rowsInner.attr('uis-transclude-append', ''); //Adding uisTranscludeAppend directive to row element after choices element has ngRepeat

      // If IE8 then need to target rowsInner to apply the ng-click attr as choices will not capture the event.
      var clickTarget = $window.document.addEventListener ? choices : rowsInner;
      clickTarget.attr('ng-click', '$select.select(' + parserResult.itemName + ',$select.skipFocusser,$event)');

      return function link(scope, element, attrs, $select) {


        $select.parseRepeatAttr(attrs.repeat, groupByExp, groupFilterExp); //Result ready at $select.parserResult
        $select.disableChoiceExpression = attrs.uiDisableChoice;
        $select.onHighlightCallback = attrs.onHighlight;
        $select.minimumInputLength = parseInt(attrs.minimumInputLength) || 0;
        $select.dropdownPosition = attrs.position ? attrs.position.toLowerCase() : uiSelectConfig.dropdownPosition;

        scope.$watch('$select.search', function(newValue) {
          if(newValue && !$select.open && $select.multiple) $select.activate(false, true);
          $select.activeIndex = $select.tagging.isActivated ? -1 : 0;
          if (!attrs.minimumInputLength || $select.search.length >= attrs.minimumInputLength) {
            $select.refresh(attrs.refresh);
          } else {
            $select.items = [];
          }
        });

        attrs.$observe('refreshDelay', function() {
          // $eval() is needed otherwise we get a string instead of a number
          var refreshDelay = scope.$eval(attrs.refreshDelay);
          $select.refreshDelay = refreshDelay !== undefined ? refreshDelay : uiSelectConfig.refreshDelay;
        });

        scope.$watch('$select.open', function(open) {
          if (open) {
            tElement.attr('role', 'listbox');
            $select.refresh(attrs.refresh);
          } else {
            element.removeAttr('role');
          }
        });
      };
    }
  };
}]);

/**
 * Contains ui-select "intelligence".
 *
 * The goal is to limit dependency on the DOM whenever possible and
 * put as much logic in the controller (instead of the link functions) as possible so it can be easily tested.
 */
uis.controller('uiSelectCtrl',
  ['$scope', '$element', '$timeout', '$filter', '$$uisDebounce', 'uisRepeatParser', 'uiSelectMinErr', 'uiSelectConfig', '$parse', '$injector', '$window',
  function($scope, $element, $timeout, $filter, $$uisDebounce, RepeatParser, uiSelectMinErr, uiSelectConfig, $parse, $injector, $window) {

  var ctrl = this;

  var EMPTY_SEARCH = '';

  ctrl.placeholder = uiSelectConfig.placeholder;
  ctrl.searchEnabled = uiSelectConfig.searchEnabled;
  ctrl.sortable = uiSelectConfig.sortable;
  ctrl.refreshDelay = uiSelectConfig.refreshDelay;
  ctrl.paste = uiSelectConfig.paste;
  ctrl.resetSearchInput = uiSelectConfig.resetSearchInput;
  ctrl.refreshing = false;
  ctrl.spinnerEnabled = uiSelectConfig.spinnerEnabled;
  ctrl.spinnerClass = uiSelectConfig.spinnerClass;
  ctrl.removeSelected = uiSelectConfig.removeSelected; //If selected item(s) should be removed from dropdown list
  ctrl.closeOnSelect = true; //Initialized inside uiSelect directive link function
  ctrl.skipFocusser = false; //Set to true to avoid returning focus to ctrl when item is selected
  ctrl.search = EMPTY_SEARCH;

  ctrl.activeIndex = 0; //Dropdown of choices
  ctrl.items = []; //All available choices

  ctrl.open = false;
  ctrl.focus = false;
  ctrl.disabled = false;
  ctrl.selected = undefined;

  ctrl.dropdownPosition = 'auto';

  ctrl.focusser = undefined; //Reference to input element used to handle focus events
  ctrl.multiple = undefined; // Initialized inside uiSelect directive link function
  ctrl.disableChoiceExpression = undefined; // Initialized inside uiSelectChoices directive link function
  ctrl.tagging = {isActivated: false, fct: undefined};
  ctrl.taggingTokens = {isActivated: false, tokens: undefined};
  ctrl.lockChoiceExpression = undefined; // Initialized inside uiSelectMatch directive link function
  ctrl.clickTriggeredSelect = false;
  ctrl.$filter = $filter;
  ctrl.$element = $element;

  // Use $injector to check for $animate and store a reference to it
  ctrl.$animate = (function () {
    try {
      return $injector.get('$animate');
    } catch (err) {
      // $animate does not exist
      return null;
    }
  })();

  ctrl.searchInput = $element.querySelectorAll('input.ui-select-search');
  if (ctrl.searchInput.length !== 1) {
    throw uiSelectMinErr('searchInput', "Expected 1 input.ui-select-search but got '{0}'.", ctrl.searchInput.length);
  }

  ctrl.isEmpty = function() {
    return isNil(ctrl.selected) || ctrl.selected === '' || (ctrl.multiple && ctrl.selected.length === 0);
  };

  function _findIndex(collection, predicate, thisArg){
    if (collection.findIndex){
      return collection.findIndex(predicate, thisArg);
    } else {
      var list = Object(collection);
      var length = list.length >>> 0;
      var value;

      for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return i;
        }
      }
      return -1;
    }
  }

  // Most of the time the user does not want to empty the search input when in typeahead mode
  function _resetSearchInput() {
    if (ctrl.resetSearchInput) {
      ctrl.search = EMPTY_SEARCH;
      //reset activeIndex
      if (ctrl.selected && ctrl.items.length && !ctrl.multiple) {
        ctrl.activeIndex = _findIndex(ctrl.items, function(item){
          return angular.equals(this, item);
        }, ctrl.selected);
      }
    }
  }

    function _groupsFilter(groups, groupNames) {
      var i, j, result = [];
      for(i = 0; i < groupNames.length ;i++){
        for(j = 0; j < groups.length ;j++){
          if(groups[j].name == [groupNames[i]]){
            result.push(groups[j]);
          }
        }
      }
      return result;
    }

  // When the user clicks on ui-select, displays the dropdown list
  ctrl.activate = function(initSearchValue, avoidReset) {
    if (!ctrl.disabled  && !ctrl.open) {
      if(!avoidReset) _resetSearchInput();

      $scope.$broadcast('uis:activate');
      ctrl.open = true;
      ctrl.activeIndex = ctrl.activeIndex >= ctrl.items.length ? 0 : ctrl.activeIndex;
      // ensure that the index is set to zero for tagging variants
      // that where first option is auto-selected
      if ( ctrl.activeIndex === -1 && ctrl.taggingLabel !== false ) {
        ctrl.activeIndex = 0;
      }

      var container = $element.querySelectorAll('.ui-select-choices-content');
      var searchInput = $element.querySelectorAll('.ui-select-search');
      if (ctrl.$animate && ctrl.$animate.on && ctrl.$animate.enabled(container[0])) {
        var animateHandler = function(elem, phase) {
          if (phase === 'start' && ctrl.items.length === 0) {
            // Only focus input after the animation has finished
            ctrl.$animate.off('removeClass', searchInput[0], animateHandler);
            $timeout(function () {
              ctrl.focusSearchInput(initSearchValue);
            });
          } else if (phase === 'close') {
            // Only focus input after the animation has finished
            ctrl.$animate.off('enter', container[0], animateHandler);
            $timeout(function () {
              ctrl.focusSearchInput(initSearchValue);
            });
          }
        };

        if (ctrl.items.length > 0) {
          ctrl.$animate.on('enter', container[0], animateHandler);
        } else {
          ctrl.$animate.on('removeClass', searchInput[0], animateHandler);
        }
      } else {
        $timeout(function () {
          ctrl.focusSearchInput(initSearchValue);
          if(!ctrl.tagging.isActivated && ctrl.items.length > 1) {
            _ensureHighlightVisible();
          }
        });
      }
    }
    else if (ctrl.open && !ctrl.searchEnabled) {
      // Close the selection if we don't have search enabled, and we click on the select again
      ctrl.close();
    }
  };

  ctrl.focusSearchInput = function (initSearchValue) {
    ctrl.search = initSearchValue || ctrl.search;
    ctrl.searchInput[0].focus();
  };

  ctrl.findGroupByName = function(name) {
    return ctrl.groups && ctrl.groups.filter(function(group) {
      return group.name === name;
    })[0];
  };

  ctrl.parseRepeatAttr = function(repeatAttr, groupByExp, groupFilterExp) {
    function updateGroups(items) {
      var groupFn = $scope.$eval(groupByExp);
      ctrl.groups = [];
      angular.forEach(items, function(item) {
        var groupName = angular.isFunction(groupFn) ? groupFn(item) : item[groupFn];
        var group = ctrl.findGroupByName(groupName);
        if(group) {
          group.items.push(item);
        }
        else {
          ctrl.groups.push({name: groupName, items: [item]});
        }
      });
      if(groupFilterExp){
        var groupFilterFn = $scope.$eval(groupFilterExp);
        if( angular.isFunction(groupFilterFn)){
          ctrl.groups = groupFilterFn(ctrl.groups);
        } else if(angular.isArray(groupFilterFn)){
          ctrl.groups = _groupsFilter(ctrl.groups, groupFilterFn);
        }
      }
      ctrl.items = [];
      ctrl.groups.forEach(function(group) {
        ctrl.items = ctrl.items.concat(group.items);
      });
    }

    function setPlainItems(items) {
      ctrl.items = items || [];
    }

    ctrl.setItemsFn = groupByExp ? updateGroups : setPlainItems;

    ctrl.parserResult = RepeatParser.parse(repeatAttr);

    ctrl.isGrouped = !!groupByExp;
    ctrl.itemProperty = ctrl.parserResult.itemName;

    //If collection is an Object, convert it to Array

    var originalSource = ctrl.parserResult.source;

    //When an object is used as source, we better create an array and use it as 'source'
    var createArrayFromObject = function(){
      var origSrc = originalSource($scope);
      $scope.$uisSource = Object.keys(origSrc).map(function(v){
        var result = {};
        result[ctrl.parserResult.keyName] = v;
        result.value = origSrc[v];
        return result;
      });
    };

    if (ctrl.parserResult.keyName){ // Check for (key,value) syntax
      createArrayFromObject();
      ctrl.parserResult.source = $parse('$uisSource' + ctrl.parserResult.filters);
      $scope.$watch(originalSource, function(newVal, oldVal){
        if (newVal !== oldVal) createArrayFromObject();
      }, true);
    }

    ctrl.refreshItems = function (data){
      data = data || ctrl.parserResult.source($scope);
      var selectedItems = ctrl.selected;
      //TODO should implement for single mode removeSelected
      if (ctrl.isEmpty() || (angular.isArray(selectedItems) && !selectedItems.length) || !ctrl.multiple || !ctrl.removeSelected) {
        ctrl.setItemsFn(data);
      }else{
        if ( data !== undefined && data !== null ) {
          var filteredItems = data.filter(function(i) {
            return angular.isArray(selectedItems) ? selectedItems.every(function(selectedItem) {
              return !angular.equals(i, selectedItem);
            }) : !angular.equals(i, selectedItems);
          });
          ctrl.setItemsFn(filteredItems);
        }
      }
      if (ctrl.dropdownPosition === 'auto' || ctrl.dropdownPosition === 'up'){
        $scope.calculateDropdownPos();
      }
      $scope.$broadcast('uis:refresh');
    };

    // See https://github.com/angular/angular.js/blob/v1.2.15/src/ng/directive/ngRepeat.js#L259
    $scope.$watchCollection(ctrl.parserResult.source, function(items) {
      if (items === undefined || items === null) {
        // If the user specifies undefined or null => reset the collection
        // Special case: items can be undefined if the user did not initialized the collection on the scope
        // i.e $scope.addresses = [] is missing
        ctrl.items = [];
      } else {
        if (!angular.isArray(items)) {
          throw uiSelectMinErr('items', "Expected an array but got '{0}'.", items);
        } else {
          //Remove already selected items (ex: while searching)
          //TODO Should add a test
          ctrl.refreshItems(items);

          //update the view value with fresh data from items, if there is a valid model value
          if(angular.isDefined(ctrl.ngModel.$modelValue)) {
            ctrl.ngModel.$modelValue = null; //Force scope model value and ngModel value to be out of sync to re-run formatters
          }
        }
      }
    });

  };

  var _refreshDelayPromise;

  /**
   * Typeahead mode: lets the user refresh the collection using his own function.
   *
   * See Expose $select.search for external / remote filtering https://github.com/angular-ui/ui-select/pull/31
   */
  ctrl.refresh = function(refreshAttr) {
    if (refreshAttr !== undefined) {
      // Debounce
      // See https://github.com/angular-ui/bootstrap/blob/0.10.0/src/typeahead/typeahead.js#L155
      // FYI AngularStrap typeahead does not have debouncing: https://github.com/mgcrea/angular-strap/blob/v2.0.0-rc.4/src/typeahead/typeahead.js#L177
      if (_refreshDelayPromise) {
        $timeout.cancel(_refreshDelayPromise);
      }
      _refreshDelayPromise = $timeout(function() {
        if ($scope.$select.search.length >= $scope.$select.minimumInputLength) {
          var refreshPromise = $scope.$eval(refreshAttr);
          if (refreshPromise && angular.isFunction(refreshPromise.then) && !ctrl.refreshing) {
            ctrl.refreshing = true;
            refreshPromise.finally(function() {
              ctrl.refreshing = false;
            });
          }
        }
      }, ctrl.refreshDelay);
    }
  };

  ctrl.isActive = function(itemScope) {
    if ( !ctrl.open ) {
      return false;
    }
    var itemIndex = ctrl.items.indexOf(itemScope[ctrl.itemProperty]);
    var isActive =  itemIndex == ctrl.activeIndex;

    if ( !isActive || itemIndex < 0 ) {
      return false;
    }

    if (isActive && !angular.isUndefined(ctrl.onHighlightCallback)) {
      itemScope.$eval(ctrl.onHighlightCallback);
    }

    return isActive;
  };

  var _isItemSelected = function (item) {
    return (ctrl.selected && angular.isArray(ctrl.selected) &&
        ctrl.selected.filter(function (selection) { return angular.equals(selection, item); }).length > 0);
  };

  var disabledItems = [];

  function _updateItemDisabled(item, isDisabled) {
    var disabledItemIndex = disabledItems.indexOf(item);
    if (isDisabled && disabledItemIndex === -1) {
      disabledItems.push(item);
    }

    if (!isDisabled && disabledItemIndex > -1) {
      disabledItems.splice(disabledItemIndex, 1);
    }
  }

  function _isItemDisabled(item) {
    return disabledItems.indexOf(item) > -1;
  }

  ctrl.isDisabled = function(itemScope) {

    if (!ctrl.open) return;

    var item = itemScope[ctrl.itemProperty];
    var itemIndex = ctrl.items.indexOf(item);
    var isDisabled = false;

    if (itemIndex >= 0 && (angular.isDefined(ctrl.disableChoiceExpression) || ctrl.multiple)) {

      if (item.isTag) return false;

      if (ctrl.multiple) {
        isDisabled = _isItemSelected(item);
      }

      if (!isDisabled && angular.isDefined(ctrl.disableChoiceExpression)) {
        isDisabled = !!(itemScope.$eval(ctrl.disableChoiceExpression));
      }

      _updateItemDisabled(item, isDisabled);
    }

    return isDisabled;
  };


  // When the user selects an item with ENTER or clicks the dropdown
  ctrl.select = function(item, skipFocusser, $event) {
    if (isNil(item) || !_isItemDisabled(item)) {

      if ( ! ctrl.items && ! ctrl.search && ! ctrl.tagging.isActivated) return;

      if (!item || !_isItemDisabled(item)) {
        // if click is made on existing item, prevent from tagging, ctrl.search does not matter
        ctrl.clickTriggeredSelect = false;
        if($event && ($event.type === 'click' || $event.type === 'touchend') && item)
          ctrl.clickTriggeredSelect = true;

        if(ctrl.tagging.isActivated && ctrl.clickTriggeredSelect === false) {
          // if taggingLabel is disabled and item is undefined we pull from ctrl.search
          if ( ctrl.taggingLabel === false ) {
            if ( ctrl.activeIndex < 0 ) {
              if (item === undefined) {
                item = ctrl.tagging.fct !== undefined ? ctrl.tagging.fct(ctrl.search) : ctrl.search;
              }
              if (!item || angular.equals( ctrl.items[0], item ) ) {
                return;
              }
            } else {
              // keyboard nav happened first, user selected from dropdown
              item = ctrl.items[ctrl.activeIndex];
            }
          } else {
            // tagging always operates at index zero, taggingLabel === false pushes
            // the ctrl.search value without having it injected
            if ( ctrl.activeIndex === 0 ) {
              // ctrl.tagging pushes items to ctrl.items, so we only have empty val
              // for `item` if it is a detected duplicate
              if ( item === undefined ) return;

              // create new item on the fly if we don't already have one;
              // use tagging function if we have one
              if ( ctrl.tagging.fct !== undefined && typeof item === 'string' ) {
                item = ctrl.tagging.fct(item);
                if (!item) return;
              // if item type is 'string', apply the tagging label
              } else if ( typeof item === 'string' ) {
                // trim the trailing space
                item = item.replace(ctrl.taggingLabel,'').trim();
              }
            }
          }
          // search ctrl.selected for dupes potentially caused by tagging and return early if found
          if (_isItemSelected(item)) {
            ctrl.close(skipFocusser);
            return;
          }
        }
        _resetSearchInput();
        $scope.$broadcast('uis:select', item);

        if (ctrl.closeOnSelect) {
          ctrl.close(skipFocusser);
        }
      }
    }
  };

  // Closes the dropdown
  ctrl.close = function(skipFocusser) {
    if (!ctrl.open) return;
    if (ctrl.ngModel && ctrl.ngModel.$setTouched) ctrl.ngModel.$setTouched();
    ctrl.open = false;
    _resetSearchInput();
    $scope.$broadcast('uis:close', skipFocusser);

  };

  ctrl.setFocus = function(){
    if (!ctrl.focus) ctrl.focusInput[0].focus();
  };

  ctrl.clear = function($event) {
    ctrl.select(null);
    $event.stopPropagation();
    $timeout(function() {
      ctrl.focusser[0].focus();
    }, 0, false);
  };

  // Toggle dropdown
  ctrl.toggle = function(e) {
    if (ctrl.open) {
      ctrl.close();
      e.preventDefault();
      e.stopPropagation();
    } else {
      ctrl.activate();
    }
  };

  // Set default function for locked choices - avoids unnecessary
  // logic if functionality is not being used
  ctrl.isLocked = function () {
    return false;
  };

  $scope.$watch(function () {
    return angular.isDefined(ctrl.lockChoiceExpression) && ctrl.lockChoiceExpression !== "";
  }, _initaliseLockedChoices);

  function _initaliseLockedChoices(doInitalise) {
    if(!doInitalise) return;

    var lockedItems = [];

    function _updateItemLocked(item, isLocked) {
      var lockedItemIndex = lockedItems.indexOf(item);
      if (isLocked && lockedItemIndex === -1) {
        lockedItems.push(item);
        }

      if (!isLocked && lockedItemIndex > -1) {
        lockedItems.splice(lockedItemIndex, 1);
      }
    }

    function _isItemlocked(item) {
      return lockedItems.indexOf(item) > -1;
    }

    ctrl.isLocked = function (itemScope, itemIndex) {
      var isLocked = false,
          item = ctrl.selected[itemIndex];

      if(item) {
        if (itemScope) {
          isLocked = !!(itemScope.$eval(ctrl.lockChoiceExpression));
          _updateItemLocked(item, isLocked);
        } else {
          isLocked = _isItemlocked(item);
        }
      }

      return isLocked;
    };
  }


  var sizeWatch = null;
  var updaterScheduled = false;
  ctrl.sizeSearchInput = function() {

    var input = ctrl.searchInput[0],
        container = ctrl.$element[0],
        calculateContainerWidth = function() {
          // Return the container width only if the search input is visible
          return container.clientWidth * !!input.offsetParent;
        },
        updateIfVisible = function(containerWidth) {
          if (containerWidth === 0) {
            return false;
          }
          var inputWidth = containerWidth - input.offsetLeft;
          if (inputWidth < 50) inputWidth = containerWidth;
          ctrl.searchInput.css('width', inputWidth+'px');
          return true;
        };

    ctrl.searchInput.css('width', '10px');
    $timeout(function() { //Give tags time to render correctly
      if (sizeWatch === null && !updateIfVisible(calculateContainerWidth())) {
        sizeWatch = $scope.$watch(function() {
          if (!updaterScheduled) {
            updaterScheduled = true;
            $scope.$$postDigest(function() {
              updaterScheduled = false;
              if (updateIfVisible(calculateContainerWidth())) {
                sizeWatch();
                sizeWatch = null;
              }
            });
          }
        }, angular.noop);
      }
    });
  };

  function _handleDropDownSelection(key) {
    var processed = true;
    switch (key) {
      case KEY.DOWN:
        if (!ctrl.open && ctrl.multiple) ctrl.activate(false, true); //In case its the search input in 'multiple' mode
        else if (ctrl.activeIndex < ctrl.items.length - 1) {
          var idx = ++ctrl.activeIndex;
          while(_isItemDisabled(ctrl.items[idx]) && idx < ctrl.items.length) {
            ctrl.activeIndex = ++idx;
          }
        }
        break;
      case KEY.UP:
        var minActiveIndex = (ctrl.search.length === 0 && ctrl.tagging.isActivated) ? -1 : 0;
        if (!ctrl.open && ctrl.multiple) ctrl.activate(false, true); //In case its the search input in 'multiple' mode
        else if (ctrl.activeIndex > minActiveIndex) {
          var idxmin = --ctrl.activeIndex;
          while(_isItemDisabled(ctrl.items[idxmin]) && idxmin > minActiveIndex) {
            ctrl.activeIndex = --idxmin;
          }
        }
        break;
      case KEY.TAB:
        if (!ctrl.multiple || ctrl.open) ctrl.select(ctrl.items[ctrl.activeIndex], true);
        break;
      case KEY.ENTER:
        if(ctrl.open && (ctrl.tagging.isActivated || ctrl.activeIndex >= 0)){
          ctrl.select(ctrl.items[ctrl.activeIndex], ctrl.skipFocusser); // Make sure at least one dropdown item is highlighted before adding if not in tagging mode
        } else {
          ctrl.activate(false, true); //In case its the search input in 'multiple' mode
        }
        break;
      case KEY.ESC:
        ctrl.close();
        break;
      default:
        processed = false;
    }
    return processed;
  }

  // Bind to keyboard shortcuts
  ctrl.searchInput.on('keydown', function(e) {

    var key = e.which;

    if (~[KEY.ENTER,KEY.ESC].indexOf(key)){
      e.preventDefault();
      e.stopPropagation();
    }

    $scope.$apply(function() {

      var tagged = false;

      if (ctrl.items.length > 0 || ctrl.tagging.isActivated) {
        if(!_handleDropDownSelection(key) && !ctrl.searchEnabled) {
          e.preventDefault();
          e.stopPropagation();
        }
        if ( ctrl.taggingTokens.isActivated ) {
          for (var i = 0; i < ctrl.taggingTokens.tokens.length; i++) {
            if ( ctrl.taggingTokens.tokens[i] === KEY.MAP[e.keyCode] ) {
              // make sure there is a new value to push via tagging
              if ( ctrl.search.length > 0 ) {
                tagged = true;
              }
            }
          }
          if ( tagged ) {
            $timeout(function() {
              ctrl.searchInput.triggerHandler('tagged');
              var newItem = ctrl.search.replace(KEY.MAP[e.keyCode],'').trim();
              if ( ctrl.tagging.fct ) {
                newItem = ctrl.tagging.fct( newItem );
              }
              if (newItem) ctrl.select(newItem, true);
            });
          }
        }
      }

    });

    if(KEY.isVerticalMovement(key) && ctrl.items.length > 0){
      _ensureHighlightVisible();
    }

    if (key === KEY.ENTER || key === KEY.ESC) {
      e.preventDefault();
      e.stopPropagation();
    }

  });

  ctrl.searchInput.on('paste', function (e) {
    var data;

    if (window.clipboardData && window.clipboardData.getData) { // IE
      data = window.clipboardData.getData('Text');
    } else {
      data = (e.originalEvent || e).clipboardData.getData('text/plain');
    }

    // Prepend the current input field text to the paste buffer.
    data = ctrl.search + data;

    if (data && data.length > 0) {
      // If tagging try to split by tokens and add items
      if (ctrl.taggingTokens.isActivated) {
        var items = [];
        for (var i = 0; i < ctrl.taggingTokens.tokens.length; i++) {  // split by first token that is contained in data
          var separator = KEY.toSeparator(ctrl.taggingTokens.tokens[i]) || ctrl.taggingTokens.tokens[i];
          if (data.indexOf(separator) > -1) {
            items = data.split(separator);
            break;  // only split by one token
          }
        }
        if (items.length === 0) {
          items = [data];
        }
        var oldsearch = ctrl.search;
        angular.forEach(items, function (item) {
          var newItem = ctrl.tagging.fct ? ctrl.tagging.fct(item) : item;
          if (newItem) {
            ctrl.select(newItem, true);
          }
        });
        ctrl.search = oldsearch || EMPTY_SEARCH;
        e.preventDefault();
        e.stopPropagation();
      } else if (ctrl.paste) {
        ctrl.paste(data);
        ctrl.search = EMPTY_SEARCH;
        e.preventDefault();
        e.stopPropagation();
      }
    }
  });

  ctrl.searchInput.on('tagged', function() {
    $timeout(function() {
      _resetSearchInput();
    });
  });

  // See https://github.com/ivaynberg/select2/blob/3.4.6/select2.js#L1431
  function _ensureHighlightVisible() {
    var container = $element.querySelectorAll('.ui-select-choices-content');
    var choices = container.querySelectorAll('.ui-select-choices-row');
    if (choices.length < 1) {
      throw uiSelectMinErr('choices', "Expected multiple .ui-select-choices-row but got '{0}'.", choices.length);
    }

    if (ctrl.activeIndex < 0) {
      return;
    }

    var highlighted = choices[ctrl.activeIndex];
    var posY = highlighted.offsetTop + highlighted.clientHeight - container[0].scrollTop;
    var height = container[0].offsetHeight;

    if (posY > height) {
      container[0].scrollTop += posY - height;
    } else if (posY < highlighted.clientHeight) {
      if (ctrl.isGrouped && ctrl.activeIndex === 0)
        container[0].scrollTop = 0; //To make group header visible when going all the way up
      else
        container[0].scrollTop -= highlighted.clientHeight - posY;
    }
  }

  var onResize = $$uisDebounce(function() {
    ctrl.sizeSearchInput();
  }, 50);

  angular.element($window).bind('resize', onResize);

  $scope.$on('$destroy', function() {
    ctrl.searchInput.off('keyup keydown tagged blur paste');
    angular.element($window).off('resize', onResize);
  });

  $scope.$watch('$select.activeIndex', function(activeIndex) {
    if (activeIndex)
      $element.find('input').attr(
        'aria-activedescendant',
        'ui-select-choices-row-' + ctrl.generatedId + '-' + activeIndex);
  });

  $scope.$watch('$select.open', function(open) {
    if (!open)
      $element.find('input').removeAttr('aria-activedescendant');
  });
}]);

uis.directive('uiSelect',
  ['$document', 'uiSelectConfig', 'uiSelectMinErr', 'uisOffset', '$compile', '$parse', '$timeout',
  function($document, uiSelectConfig, uiSelectMinErr, uisOffset, $compile, $parse, $timeout) {

  return {
    restrict: 'EA',
    templateUrl: function(tElement, tAttrs) {
      var theme = tAttrs.theme || uiSelectConfig.theme;
      return theme + (angular.isDefined(tAttrs.multiple) ? '/select-multiple.tpl.html' : '/select.tpl.html');
    },
    replace: true,
    transclude: true,
    require: ['uiSelect', '^ngModel'],
    scope: true,

    controller: 'uiSelectCtrl',
    controllerAs: '$select',
    compile: function(tElement, tAttrs) {

      // Allow setting ngClass on uiSelect
      var match = /{(.*)}\s*{(.*)}/.exec(tAttrs.ngClass);
      if(match) {
        var combined = '{'+ match[1] +', '+ match[2] +'}';
        tAttrs.ngClass = combined;
        tElement.attr('ng-class', combined);
      }

      //Multiple or Single depending if multiple attribute presence
      if (angular.isDefined(tAttrs.multiple))
        tElement.append('<ui-select-multiple/>').removeAttr('multiple');
      else
        tElement.append('<ui-select-single/>');

      if (tAttrs.inputId)
        tElement.querySelectorAll('input.ui-select-search')[0].id = tAttrs.inputId;

      return function(scope, element, attrs, ctrls, transcludeFn) {

        var $select = ctrls[0];
        var ngModel = ctrls[1];

        $select.generatedId = uiSelectConfig.generateId();
        $select.baseTitle = attrs.title || 'Select box';
        $select.focusserTitle = $select.baseTitle + ' focus';
        $select.focusserId = 'focusser-' + $select.generatedId;

        $select.closeOnSelect = function() {
          if (angular.isDefined(attrs.closeOnSelect)) {
            return $parse(attrs.closeOnSelect)();
          } else {
            return uiSelectConfig.closeOnSelect;
          }
        }();

        scope.$watch('skipFocusser', function() {
            var skipFocusser = scope.$eval(attrs.skipFocusser);
            $select.skipFocusser = skipFocusser !== undefined ? skipFocusser : uiSelectConfig.skipFocusser;
        });

        $select.onSelectCallback = $parse(attrs.onSelect);
        $select.onRemoveCallback = $parse(attrs.onRemove);

        //Set reference to ngModel from uiSelectCtrl
        $select.ngModel = ngModel;

        $select.choiceGrouped = function(group){
          return $select.isGrouped && group && group.name;
        };

        if(attrs.tabindex){
          attrs.$observe('tabindex', function(value) {
            $select.focusInput.attr('tabindex', value);
            element.removeAttr('tabindex');
          });
        }

        scope.$watch(function () { return scope.$eval(attrs.searchEnabled); }, function(newVal) {
          $select.searchEnabled = newVal !== undefined ? newVal : uiSelectConfig.searchEnabled;
        });

        scope.$watch('sortable', function() {
            var sortable = scope.$eval(attrs.sortable);
            $select.sortable = sortable !== undefined ? sortable : uiSelectConfig.sortable;
        });

        attrs.$observe('backspaceReset', function() {
          // $eval() is needed otherwise we get a string instead of a boolean
          var backspaceReset = scope.$eval(attrs.backspaceReset);
          $select.backspaceReset = backspaceReset !== undefined ? backspaceReset : true;
        });

        attrs.$observe('limit', function() {
          //Limit the number of selections allowed
          $select.limit = (angular.isDefined(attrs.limit)) ? parseInt(attrs.limit, 10) : undefined;
        });

        scope.$watch('removeSelected', function() {
            var removeSelected = scope.$eval(attrs.removeSelected);
            $select.removeSelected = removeSelected !== undefined ? removeSelected : uiSelectConfig.removeSelected;
        });

        attrs.$observe('disabled', function() {
          // No need to use $eval() (thanks to ng-disabled) since we already get a boolean instead of a string
          $select.disabled = attrs.disabled !== undefined ? attrs.disabled : false;
        });

        attrs.$observe('resetSearchInput', function() {
          // $eval() is needed otherwise we get a string instead of a boolean
          var resetSearchInput = scope.$eval(attrs.resetSearchInput);
          $select.resetSearchInput = resetSearchInput !== undefined ? resetSearchInput : true;
        });

        attrs.$observe('paste', function() {
          $select.paste = scope.$eval(attrs.paste);
        });

        attrs.$observe('tagging', function() {
          if(attrs.tagging !== undefined)
          {
            // $eval() is needed otherwise we get a string instead of a boolean
            var taggingEval = scope.$eval(attrs.tagging);
            $select.tagging = {isActivated: true, fct: taggingEval !== true ? taggingEval : undefined};
          }
          else
          {
            $select.tagging = {isActivated: false, fct: undefined};
          }
        });

        attrs.$observe('taggingLabel', function() {
          if(attrs.tagging !== undefined )
          {
            // check eval for FALSE, in this case, we disable the labels
            // associated with tagging
            if ( attrs.taggingLabel === 'false' ) {
              $select.taggingLabel = false;
            }
            else
            {
              $select.taggingLabel = attrs.taggingLabel !== undefined ? attrs.taggingLabel : '(new)';
            }
          }
        });

        attrs.$observe('taggingTokens', function() {
          if (attrs.tagging !== undefined) {
            var tokens = attrs.taggingTokens !== undefined ? attrs.taggingTokens.split('|') : [',','ENTER'];
            $select.taggingTokens = {isActivated: true, tokens: tokens };
          }
        });

        attrs.$observe('spinnerEnabled', function() {
          // $eval() is needed otherwise we get a string instead of a boolean
          var spinnerEnabled = scope.$eval(attrs.spinnerEnabled);
          $select.spinnerEnabled = spinnerEnabled !== undefined ? spinnerEnabled : uiSelectConfig.spinnerEnabled;
        });

        attrs.$observe('spinnerClass', function() {
          var spinnerClass = attrs.spinnerClass;
          $select.spinnerClass = spinnerClass !== undefined ? attrs.spinnerClass : uiSelectConfig.spinnerClass;
        });

        //Automatically gets focus when loaded
        if (angular.isDefined(attrs.autofocus)){
          $timeout(function(){
            $select.setFocus();
          });
        }

        //Gets focus based on scope event name (e.g. focus-on='SomeEventName')
        if (angular.isDefined(attrs.focusOn)){
          scope.$on(attrs.focusOn, function() {
              $timeout(function(){
                $select.setFocus();
              });
          });
        }

        function onDocumentClick(e) {
          if (!$select.open) return; //Skip it if dropdown is close

          var contains = false;

          if (window.jQuery) {
            // Firefox 3.6 does not support element.contains()
            // See Node.contains https://developer.mozilla.org/en-US/docs/Web/API/Node.contains
            contains = window.jQuery.contains(element[0], e.target);
          } else {
            contains = element[0].contains(e.target);
          }

          if (!contains && !$select.clickTriggeredSelect) {
            var skipFocusser;
            if (!$select.skipFocusser) {
              //Will lose focus only with certain targets
              var focusableControls = ['input','button','textarea','select'];
              var targetController = angular.element(e.target).controller('uiSelect'); //To check if target is other ui-select
              skipFocusser = targetController && targetController !== $select; //To check if target is other ui-select
              if (!skipFocusser) skipFocusser =  ~focusableControls.indexOf(e.target.tagName.toLowerCase()); //Check if target is input, button or textarea
            } else {
              skipFocusser = true;
            }
            $select.close(skipFocusser);
            scope.$digest();
          }
          $select.clickTriggeredSelect = false;
        }

        // See Click everywhere but here event http://stackoverflow.com/questions/12931369
        $document.on('click', onDocumentClick);

        scope.$on('$destroy', function() {
          $document.off('click', onDocumentClick);
        });

        // Move transcluded elements to their correct position in main template
        transcludeFn(scope, function(clone) {
          // See Transclude in AngularJS http://blog.omkarpatil.com/2012/11/transclude-in-angularjs.html

          // One day jqLite will be replaced by jQuery and we will be able to write:
          // var transcludedElement = clone.filter('.my-class')
          // instead of creating a hackish DOM element:
          var transcluded = angular.element('<div>').append(clone);

          var transcludedMatch = transcluded.querySelectorAll('.ui-select-match');
          transcludedMatch.removeAttr('ui-select-match'); //To avoid loop in case directive as attr
          transcludedMatch.removeAttr('data-ui-select-match'); // Properly handle HTML5 data-attributes
          if (transcludedMatch.length !== 1) {
            throw uiSelectMinErr('transcluded', "Expected 1 .ui-select-match but got '{0}'.", transcludedMatch.length);
          }
          element.querySelectorAll('.ui-select-match').replaceWith(transcludedMatch);

          var transcludedChoices = transcluded.querySelectorAll('.ui-select-choices');
          transcludedChoices.removeAttr('ui-select-choices'); //To avoid loop in case directive as attr
          transcludedChoices.removeAttr('data-ui-select-choices'); // Properly handle HTML5 data-attributes
          if (transcludedChoices.length !== 1) {
            throw uiSelectMinErr('transcluded', "Expected 1 .ui-select-choices but got '{0}'.", transcludedChoices.length);
          }
          element.querySelectorAll('.ui-select-choices').replaceWith(transcludedChoices);

          var transcludedNoChoice = transcluded.querySelectorAll('.ui-select-no-choice');
          transcludedNoChoice.removeAttr('ui-select-no-choice'); //To avoid loop in case directive as attr
          transcludedNoChoice.removeAttr('data-ui-select-no-choice'); // Properly handle HTML5 data-attributes
          if (transcludedNoChoice.length == 1) {
            element.querySelectorAll('.ui-select-no-choice').replaceWith(transcludedNoChoice);
          }
        });

        // Support for appending the select field to the body when its open
        var appendToBody = scope.$eval(attrs.appendToBody);
        if (appendToBody !== undefined ? appendToBody : uiSelectConfig.appendToBody) {
          scope.$watch('$select.open', function(isOpen) {
            if (isOpen) {
              positionDropdown();
            } else {
              resetDropdown();
            }
          });

          // Move the dropdown back to its original location when the scope is destroyed. Otherwise
          // it might stick around when the user routes away or the select field is otherwise removed
          scope.$on('$destroy', function() {
            resetDropdown();
          });
        }

        // Hold on to a reference to the .ui-select-container element for appendToBody support
        var placeholder = null,
            originalWidth = '';

        function positionDropdown() {
          // Remember the absolute position of the element
          var offset = uisOffset(element);

          // Clone the element into a placeholder element to take its original place in the DOM
          placeholder = angular.element('<div class="ui-select-placeholder"></div>');
          placeholder[0].style.width = offset.width + 'px';
          placeholder[0].style.height = offset.height + 'px';
          element.after(placeholder);

          // Remember the original value of the element width inline style, so it can be restored
          // when the dropdown is closed
          originalWidth = element[0].style.width;

          // Now move the actual dropdown element to the end of the body
          $document.find('body').append(element);

          element[0].style.position = 'absolute';
          element[0].style.left = offset.left + 'px';
          element[0].style.top = offset.top + 'px';
          element[0].style.width = offset.width + 'px';
        }

        function resetDropdown() {
          if (placeholder === null) {
            // The dropdown has not actually been display yet, so there's nothing to reset
            return;
          }

          // Move the dropdown element back to its original location in the DOM
          placeholder.replaceWith(element);
          placeholder = null;

          element[0].style.position = '';
          element[0].style.left = '';
          element[0].style.top = '';
          element[0].style.width = originalWidth;

          // Set focus back on to the moved element
          $select.setFocus();
        }

        // Hold on to a reference to the .ui-select-dropdown element for direction support.
        var dropdown = null,
            directionUpClassName = 'direction-up';

        // Support changing the direction of the dropdown if there isn't enough space to render it.
        scope.$watch('$select.open', function() {

          if ($select.dropdownPosition === 'auto' || $select.dropdownPosition === 'up'){
            scope.calculateDropdownPos();
          }

        });

        var setDropdownPosUp = function(offset, offsetDropdown){

          offset = offset || uisOffset(element);
          offsetDropdown = offsetDropdown || uisOffset(dropdown);

          dropdown[0].style.position = 'absolute';
          dropdown[0].style.top = (offsetDropdown.height * -1) + 'px';
          element.addClass(directionUpClassName);

        };

        var setDropdownPosDown = function(offset, offsetDropdown){

          element.removeClass(directionUpClassName);

          offset = offset || uisOffset(element);
          offsetDropdown = offsetDropdown || uisOffset(dropdown);

          dropdown[0].style.position = '';
          dropdown[0].style.top = '';

        };

        var calculateDropdownPosAfterAnimation = function() {
          // Delay positioning the dropdown until all choices have been added so its height is correct.
          $timeout(function() {
            if ($select.dropdownPosition === 'up') {
              //Go UP
              setDropdownPosUp();
            } else {
              //AUTO
              element.removeClass(directionUpClassName);

              var offset = uisOffset(element);
              var offsetDropdown = uisOffset(dropdown);

              //https://code.google.com/p/chromium/issues/detail?id=342307#c4
              var scrollTop = $document[0].documentElement.scrollTop || $document[0].body.scrollTop; //To make it cross browser (blink, webkit, IE, Firefox).

              // Determine if the direction of the dropdown needs to be changed.
              if (offset.top + offset.height + offsetDropdown.height > scrollTop + $document[0].documentElement.clientHeight) {
                //Go UP
                setDropdownPosUp(offset, offsetDropdown);
              }else{
                //Go DOWN
                setDropdownPosDown(offset, offsetDropdown);
              }
            }

            // Display the dropdown once it has been positioned.
            dropdown[0].style.opacity = 1;
          });
        };

        var opened = false;
        
        scope.calculateDropdownPos = function() {
          if ($select.open) {
            dropdown = angular.element(element).querySelectorAll('.ui-select-dropdown');

            if (dropdown.length === 0) {
              return;
            }

           // Hide the dropdown so there is no flicker until $timeout is done executing.
           if ($select.search === '' && !opened) {
              dropdown[0].style.opacity = 0;
              opened = true;
           }

            if (!uisOffset(dropdown).height && $select.$animate && $select.$animate.on && $select.$animate.enabled(dropdown)) {
              var needsCalculated = true;

              $select.$animate.on('enter', dropdown, function (elem, phase) {
                if (phase === 'close' && needsCalculated) {
                  calculateDropdownPosAfterAnimation();
                  needsCalculated = false;
                }
              });
            } else {
              calculateDropdownPosAfterAnimation();
            }
          } else {
            if (dropdown === null || dropdown.length === 0) {
              return;
            }

            // Reset the position of the dropdown.
            dropdown[0].style.opacity = 0;
            dropdown[0].style.position = '';
            dropdown[0].style.top = '';
            element.removeClass(directionUpClassName);
          }
        };
      };
    }
  };
}]);

uis.directive('uiSelectMatch', ['uiSelectConfig', function(uiSelectConfig) {
  return {
    restrict: 'EA',
    require: '^uiSelect',
    replace: true,
    transclude: true,
    templateUrl: function(tElement) {
      // Needed so the uiSelect can detect the transcluded content
      tElement.addClass('ui-select-match');

      var parent = tElement.parent();
      // Gets theme attribute from parent (ui-select)
      var theme = getAttribute(parent, 'theme') || uiSelectConfig.theme;
      var multi = angular.isDefined(getAttribute(parent, 'multiple'));

      return theme + (multi ? '/match-multiple.tpl.html' : '/match.tpl.html');      
    },
    link: function(scope, element, attrs, $select) {
      $select.lockChoiceExpression = attrs.uiLockChoice;
      attrs.$observe('placeholder', function(placeholder) {
        $select.placeholder = placeholder !== undefined ? placeholder : uiSelectConfig.placeholder;
      });

      function setAllowClear(allow) {
        $select.allowClear = (angular.isDefined(allow)) ? (allow === '') ? true : (allow.toLowerCase() === 'true') : false;
      }

      attrs.$observe('allowClear', setAllowClear);
      setAllowClear(attrs.allowClear);

      if($select.multiple){
        $select.sizeSearchInput();
      }

    }
  };

  function getAttribute(elem, attribute) {
    if (elem[0].hasAttribute(attribute))
      return elem.attr(attribute);

    if (elem[0].hasAttribute('data-' + attribute))
      return elem.attr('data-' + attribute);

    if (elem[0].hasAttribute('x-' + attribute))
      return elem.attr('x-' + attribute);
  }
}]);

uis.directive('uiSelectMultiple', ['uiSelectMinErr','$timeout', function(uiSelectMinErr, $timeout) {
  return {
    restrict: 'EA',
    require: ['^uiSelect', '^ngModel'],

    controller: ['$scope','$timeout', function($scope, $timeout){

      var ctrl = this,
          $select = $scope.$select,
          ngModel;

      if (angular.isUndefined($select.selected))
        $select.selected = [];

      //Wait for link fn to inject it
      $scope.$evalAsync(function(){ ngModel = $scope.ngModel; });

      ctrl.activeMatchIndex = -1;

      ctrl.updateModel = function(){
        ngModel.$setViewValue(Date.now()); //Set timestamp as a unique string to force changes
        ctrl.refreshComponent();
      };

      ctrl.refreshComponent = function(){
        //Remove already selected items
        //e.g. When user clicks on a selection, the selected array changes and
        //the dropdown should remove that item
        if($select.refreshItems){
          $select.refreshItems();
        }
        if($select.sizeSearchInput){
          $select.sizeSearchInput();
        }
      };

      // Remove item from multiple select
      ctrl.removeChoice = function(index){

        // if the choice is locked, don't remove it
        if($select.isLocked(null, index)) return false;

        var removedChoice = $select.selected[index];

        var locals = {};
        locals[$select.parserResult.itemName] = removedChoice;

        $select.selected.splice(index, 1);
        ctrl.activeMatchIndex = -1;
        $select.sizeSearchInput();

        // Give some time for scope propagation.
        $timeout(function(){
          $select.onRemoveCallback($scope, {
            $item: removedChoice,
            $model: $select.parserResult.modelMapper($scope, locals)
          });
        });

        ctrl.updateModel();

        return true;
      };

      ctrl.getPlaceholder = function(){
        //Refactor single?
        if($select.selected && $select.selected.length) return;
        return $select.placeholder;
      };


    }],
    controllerAs: '$selectMultiple',

    link: function(scope, element, attrs, ctrls) {

      var $select = ctrls[0];
      var ngModel = scope.ngModel = ctrls[1];
      var $selectMultiple = scope.$selectMultiple;

      //$select.selected = raw selected objects (ignoring any property binding)

      $select.multiple = true;

      //Input that will handle focus
      $select.focusInput = $select.searchInput;

      //Properly check for empty if set to multiple
      ngModel.$isEmpty = function(value) {
        return !value || value.length === 0;
      };

      //From view --> model
      ngModel.$parsers.unshift(function () {
        var locals = {},
            result,
            resultMultiple = [];
        for (var j = $select.selected.length - 1; j >= 0; j--) {
          locals = {};
          locals[$select.parserResult.itemName] = $select.selected[j];
          result = $select.parserResult.modelMapper(scope, locals);
          resultMultiple.unshift(result);
        }
        return resultMultiple;
      });

      // From model --> view
      ngModel.$formatters.unshift(function (inputValue) {
        var data = $select.parserResult && $select.parserResult.source (scope, { $select : {search:''}}), //Overwrite $search
            locals = {},
            result;
        if (!data) return inputValue;
        var resultMultiple = [];
        var checkFnMultiple = function(list, value){
          if (!list || !list.length) return;
          for (var p = list.length - 1; p >= 0; p--) {
            locals[$select.parserResult.itemName] = list[p];
            result = $select.parserResult.modelMapper(scope, locals);
            if($select.parserResult.trackByExp){
                var propsItemNameMatches = /(\w*)\./.exec($select.parserResult.trackByExp);
                var matches = /\.([^\s]+)/.exec($select.parserResult.trackByExp);
                if(propsItemNameMatches && propsItemNameMatches.length > 0 && propsItemNameMatches[1] == $select.parserResult.itemName){
                  if(matches && matches.length>0 && result[matches[1]] == value[matches[1]]){
                      resultMultiple.unshift(list[p]);
                      return true;
                  }
                }
            }
            if (angular.equals(result,value)){
              resultMultiple.unshift(list[p]);
              return true;
            }
          }
          return false;
        };
        if (!inputValue) return resultMultiple; //If ngModel was undefined
        for (var k = inputValue.length - 1; k >= 0; k--) {
          //Check model array of currently selected items
          if (!checkFnMultiple($select.selected, inputValue[k])){
            //Check model array of all items available
            if (!checkFnMultiple(data, inputValue[k])){
              //If not found on previous lists, just add it directly to resultMultiple
              resultMultiple.unshift(inputValue[k]);
            }
          }
        }
        return resultMultiple;
      });

      //Watch for external model changes
      scope.$watchCollection(function(){ return ngModel.$modelValue; }, function(newValue, oldValue) {
        if (oldValue != newValue){
          //update the view value with fresh data from items, if there is a valid model value
          if(angular.isDefined(ngModel.$modelValue)) {
            ngModel.$modelValue = null; //Force scope model value and ngModel value to be out of sync to re-run formatters
          }
          $selectMultiple.refreshComponent();
        }
      });

      ngModel.$render = function() {
        // Make sure that model value is array
        if(!angular.isArray(ngModel.$viewValue)){
          // Have tolerance for null or undefined values
          if (isNil(ngModel.$viewValue)){
            ngModel.$viewValue = [];
          } else {
            throw uiSelectMinErr('multiarr', "Expected model value to be array but got '{0}'", ngModel.$viewValue);
          }
        }
        $select.selected = ngModel.$viewValue;
        $selectMultiple.refreshComponent();
        scope.$evalAsync(); //To force $digest
      };

      scope.$on('uis:select', function (event, item) {
        if($select.selected.length >= $select.limit) {
          return;
        }
        $select.selected.push(item);
        var locals = {};
        locals[$select.parserResult.itemName] = item;

        $timeout(function(){
          $select.onSelectCallback(scope, {
            $item: item,
            $model: $select.parserResult.modelMapper(scope, locals)
          });
        });
        $selectMultiple.updateModel();
      });

      scope.$on('uis:activate', function () {
        $selectMultiple.activeMatchIndex = -1;
      });

      scope.$watch('$select.disabled', function(newValue, oldValue) {
        // As the search input field may now become visible, it may be necessary to recompute its size
        if (oldValue && !newValue) $select.sizeSearchInput();
      });

      $select.searchInput.on('keydown', function(e) {
        var key = e.which;
        scope.$apply(function() {
          var processed = false;
          // var tagged = false; //Checkme
          if(KEY.isHorizontalMovement(key)){
            processed = _handleMatchSelection(key);
          }
          if (processed  && key != KEY.TAB) {
            //TODO Check si el tab selecciona aun correctamente
            //Crear test
            e.preventDefault();
            e.stopPropagation();
          }
        });
      });
      function _getCaretPosition(el) {
        if(angular.isNumber(el.selectionStart)) return el.selectionStart;
        // selectionStart is not supported in IE8 and we don't want hacky workarounds so we compromise
        else return el.value.length;
      }
      // Handles selected options in "multiple" mode
      function _handleMatchSelection(key){
        var caretPosition = _getCaretPosition($select.searchInput[0]),
            length = $select.selected.length,
            // none  = -1,
            first = 0,
            last  = length-1,
            curr  = $selectMultiple.activeMatchIndex,
            next  = $selectMultiple.activeMatchIndex+1,
            prev  = $selectMultiple.activeMatchIndex-1,
            newIndex = curr;

        if(caretPosition > 0 || ($select.search.length && key == KEY.RIGHT)) return false;

        $select.close();

        function getNewActiveMatchIndex(){
          switch(key){
            case KEY.LEFT:
              // Select previous/first item
              if(~$selectMultiple.activeMatchIndex) return prev;
              // Select last item
              else return last;
              break;
            case KEY.RIGHT:
              // Open drop-down
              if(!~$selectMultiple.activeMatchIndex || curr === last){
                $select.activate();
                return false;
              }
              // Select next/last item
              else return next;
              break;
            case KEY.BACKSPACE:
              // Remove selected item and select previous/first
              if(~$selectMultiple.activeMatchIndex){
                if($selectMultiple.removeChoice(curr)) {
                  return prev;
                } else {
                  return curr;
                }

              } else {
                // If nothing yet selected, select last item
                return last;
              }
              break;
            case KEY.DELETE:
              // Remove selected item and select next item
              if(~$selectMultiple.activeMatchIndex){
                $selectMultiple.removeChoice($selectMultiple.activeMatchIndex);
                return curr;
              }
              else return false;
          }
        }

        newIndex = getNewActiveMatchIndex();

        if(!$select.selected.length || newIndex === false) $selectMultiple.activeMatchIndex = -1;
        else $selectMultiple.activeMatchIndex = Math.min(last,Math.max(first,newIndex));

        return true;
      }

      $select.searchInput.on('keyup', function(e) {

        if ( ! KEY.isVerticalMovement(e.which) ) {
          scope.$evalAsync( function () {
            $select.activeIndex = $select.taggingLabel === false ? -1 : 0;
          });
        }
        // Push a "create new" item into array if there is a search string
        if ( $select.tagging.isActivated && $select.search.length > 0 ) {

          // return early with these keys
          if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.ESC || KEY.isVerticalMovement(e.which) ) {
            return;
          }
          // always reset the activeIndex to the first item when tagging
          $select.activeIndex = $select.taggingLabel === false ? -1 : 0;
          // taggingLabel === false bypasses all of this
          if ($select.taggingLabel === false) return;

          var items = angular.copy( $select.items );
          var stashArr = angular.copy( $select.items );
          var newItem;
          var item;
          var hasTag = false;
          var dupeIndex = -1;
          var tagItems;
          var tagItem;

          // case for object tagging via transform `$select.tagging.fct` function
          if ( $select.tagging.fct !== undefined) {
            tagItems = $select.$filter('filter')(items,{'isTag': true});
            if ( tagItems.length > 0 ) {
              tagItem = tagItems[0];
            }
            // remove the first element, if it has the `isTag` prop we generate a new one with each keyup, shaving the previous
            if ( items.length > 0 && tagItem ) {
              hasTag = true;
              items = items.slice(1,items.length);
              stashArr = stashArr.slice(1,stashArr.length);
            }
            newItem = $select.tagging.fct($select.search);
            // verify the new tag doesn't match the value of a possible selection choice or an already selected item.
            if (
              stashArr.some(function (origItem) {
                 return angular.equals(origItem, newItem);
              }) ||
              $select.selected.some(function (origItem) {
                return angular.equals(origItem, newItem);
              })
            ) {
              scope.$evalAsync(function () {
                $select.activeIndex = 0;
                $select.items = items;
              });
              return;
            }
            if (newItem) newItem.isTag = true;
          // handle newItem string and stripping dupes in tagging string context
          } else {
            // find any tagging items already in the $select.items array and store them
            tagItems = $select.$filter('filter')(items,function (item) {
              return item.match($select.taggingLabel);
            });
            if ( tagItems.length > 0 ) {
              tagItem = tagItems[0];
            }
            item = items[0];
            // remove existing tag item if found (should only ever be one tag item)
            if ( item !== undefined && items.length > 0 && tagItem ) {
              hasTag = true;
              items = items.slice(1,items.length);
              stashArr = stashArr.slice(1,stashArr.length);
            }
            newItem = $select.search+' '+$select.taggingLabel;
            if ( _findApproxDupe($select.selected, $select.search) > -1 ) {
              return;
            }
            // verify the the tag doesn't match the value of an existing item from
            // the searched data set or the items already selected
            if ( _findCaseInsensitiveDupe(stashArr.concat($select.selected)) ) {
              // if there is a tag from prev iteration, strip it / queue the change
              // and return early
              if ( hasTag ) {
                items = stashArr;
                scope.$evalAsync( function () {
                  $select.activeIndex = 0;
                  $select.items = items;
                });
              }
              return;
            }
            if ( _findCaseInsensitiveDupe(stashArr) ) {
              // if there is a tag from prev iteration, strip it
              if ( hasTag ) {
                $select.items = stashArr.slice(1,stashArr.length);
              }
              return;
            }
          }
          if ( hasTag ) dupeIndex = _findApproxDupe($select.selected, newItem);
          // dupe found, shave the first item
          if ( dupeIndex > -1 ) {
            items = items.slice(dupeIndex+1,items.length-1);
          } else {
            items = [];
            if (newItem) items.push(newItem);
            items = items.concat(stashArr);
          }
          scope.$evalAsync( function () {
            $select.activeIndex = 0;
            $select.items = items;

            if ($select.isGrouped) {
              // update item references in groups, so that indexOf will work after angular.copy
              var itemsWithoutTag = newItem ? items.slice(1) : items;
              $select.setItemsFn(itemsWithoutTag);
              if (newItem) {
                // add tag item as a new group
                $select.items.unshift(newItem);
                $select.groups.unshift({name: '', items: [newItem], tagging: true});
              }
            }
          });
        }
      });
      function _findCaseInsensitiveDupe(arr) {
        if ( arr === undefined || $select.search === undefined ) {
          return false;
        }
        var hasDupe = arr.filter( function (origItem) {
          if ( $select.search.toUpperCase() === undefined || origItem === undefined ) {
            return false;
          }
          return origItem.toUpperCase() === $select.search.toUpperCase();
        }).length > 0;

        return hasDupe;
      }
      function _findApproxDupe(haystack, needle) {
        var dupeIndex = -1;
        if(angular.isArray(haystack)) {
          var tempArr = angular.copy(haystack);
          for (var i = 0; i <tempArr.length; i++) {
            // handle the simple string version of tagging
            if ( $select.tagging.fct === undefined ) {
              // search the array for the match
              if ( tempArr[i]+' '+$select.taggingLabel === needle ) {
              dupeIndex = i;
              }
            // handle the object tagging implementation
            } else {
              var mockObj = tempArr[i];
              if (angular.isObject(mockObj)) {
                mockObj.isTag = true;
              }
              if ( angular.equals(mockObj, needle) ) {
                dupeIndex = i;
              }
            }
          }
        }
        return dupeIndex;
      }

      $select.searchInput.on('blur', function() {
        $timeout(function() {
          $selectMultiple.activeMatchIndex = -1;
        });
      });

    }
  };
}]);

uis.directive('uiSelectNoChoice',
    ['uiSelectConfig', function (uiSelectConfig) {
        return {
            restrict: 'EA',
            require: '^uiSelect',
            replace: true,
            transclude: true,
            templateUrl: function (tElement) {
                // Needed so the uiSelect can detect the transcluded content
                tElement.addClass('ui-select-no-choice');
      
                // Gets theme attribute from parent (ui-select)
                var theme = tElement.parent().attr('theme') || uiSelectConfig.theme;
                return theme + '/no-choice.tpl.html';
            }
        };
    }]);

uis.directive('uiSelectSingle', ['$timeout','$compile', function($timeout, $compile) {
  return {
    restrict: 'EA',
    require: ['^uiSelect', '^ngModel'],
    link: function(scope, element, attrs, ctrls) {

      var $select = ctrls[0];
      var ngModel = ctrls[1];

      //From view --> model
      ngModel.$parsers.unshift(function (inputValue) {
        // Keep original value for undefined and null
        if (isNil(inputValue)) {
          return inputValue;
        }

        var locals = {},
            result;
        locals[$select.parserResult.itemName] = inputValue;
        result = $select.parserResult.modelMapper(scope, locals);
        return result;
      });

      //From model --> view
      ngModel.$formatters.unshift(function (inputValue) {
        // Keep original value for undefined and null
        if (isNil(inputValue)) {
          return inputValue;
        }

        var data = $select.parserResult && $select.parserResult.source (scope, { $select : {search:''}}), //Overwrite $search
            locals = {},
            result;
        if (data){
          var checkFnSingle = function(d){
            locals[$select.parserResult.itemName] = d;
            result = $select.parserResult.modelMapper(scope, locals);
            return result === inputValue;
          };
          //If possible pass same object stored in $select.selected
          if ($select.selected && checkFnSingle($select.selected)) {
            return $select.selected;
          }
          for (var i = data.length - 1; i >= 0; i--) {
            if (checkFnSingle(data[i])) return data[i];
          }
        }
        return inputValue;
      });

      //Update viewValue if model change
      scope.$watch('$select.selected', function(newValue) {
        if (ngModel.$viewValue !== newValue) {
          ngModel.$setViewValue(newValue);
        }
      });

      ngModel.$render = function() {
        $select.selected = ngModel.$viewValue;
      };

      scope.$on('uis:select', function (event, item) {
        $select.selected = item;
        var locals = {};
        locals[$select.parserResult.itemName] = item;

        $timeout(function() {
          $select.onSelectCallback(scope, {
            $item: item,
            $model: isNil(item) ? item : $select.parserResult.modelMapper(scope, locals)
          });
        });
      });

      scope.$on('uis:close', function (event, skipFocusser) {
        $timeout(function(){
          $select.focusser.prop('disabled', false);
          if (!skipFocusser) $select.focusser[0].focus();
        },0,false);
      });

      scope.$on('uis:activate', function () {
        focusser.prop('disabled', true); //Will reactivate it on .close()
      });

      //Idea from: https://github.com/ivaynberg/select2/blob/79b5bf6db918d7560bdd959109b7bcfb47edaf43/select2.js#L1954
      var focusser = angular.element("<input ng-disabled='$select.disabled' class='ui-select-focusser ui-select-offscreen' type='text' id='{{ $select.focusserId }}' aria-label='{{ $select.focusserTitle }}' aria-haspopup='true' role='button' />");
      $compile(focusser)(scope);
      $select.focusser = focusser;

      //Input that will handle focus
      $select.focusInput = focusser;

      element.parent().append(focusser);
      focusser.bind("focus", function(){
        scope.$evalAsync(function(){
          $select.focus = true;
        });
      });
      focusser.bind("blur", function(){
        scope.$evalAsync(function(){
          $select.focus = false;
        });
      });
      focusser.bind("keydown", function(e){

        if (e.which === KEY.BACKSPACE && $select.backspaceReset !== false) {
          e.preventDefault();
          e.stopPropagation();
          $select.select(undefined);
          scope.$apply();
          return;
        }

        if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.ESC) {
          return;
        }

        if (e.which == KEY.DOWN  || e.which == KEY.UP || e.which == KEY.ENTER || e.which == KEY.SPACE){
          e.preventDefault();
          e.stopPropagation();
          $select.activate();
        }

        scope.$digest();
      });

      focusser.bind("keyup input", function(e){

        if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.ESC || e.which == KEY.ENTER || e.which === KEY.BACKSPACE) {
          return;
        }

        $select.activate(focusser.val()); //User pressed some regular key, so we pass it to the search input
        focusser.val('');
        scope.$digest();

      });


    }
  };
}]);

// Make multiple matches sortable
uis.directive('uiSelectSort', ['$timeout', 'uiSelectConfig', 'uiSelectMinErr', function($timeout, uiSelectConfig, uiSelectMinErr) {
  return {
    require: ['^^uiSelect', '^ngModel'],
    link: function(scope, element, attrs, ctrls) {
      if (scope[attrs.uiSelectSort] === null) {
        throw uiSelectMinErr('sort', 'Expected a list to sort');
      }

      var $select = ctrls[0];
      var $ngModel = ctrls[1];

      var options = angular.extend({
          axis: 'horizontal'
        },
        scope.$eval(attrs.uiSelectSortOptions));

      var axis = options.axis;
      var draggingClassName = 'dragging';
      var droppingClassName = 'dropping';
      var droppingBeforeClassName = 'dropping-before';
      var droppingAfterClassName = 'dropping-after';

      scope.$watch(function(){
        return $select.sortable;
      }, function(newValue){
        if (newValue) {
          element.attr('draggable', true);
        } else {
          element.removeAttr('draggable');
        }
      });

      element.on('dragstart', function(event) {
        element.addClass(draggingClassName);

        (event.dataTransfer || event.originalEvent.dataTransfer).setData('text', scope.$index.toString());
      });

      element.on('dragend', function() {
        removeClass(draggingClassName);
      });

      var move = function(from, to) {
        /*jshint validthis: true */
        this.splice(to, 0, this.splice(from, 1)[0]);
      };

      var removeClass = function(className) {
        angular.forEach($select.$element.querySelectorAll('.' + className), function(el){
          angular.element(el).removeClass(className);
        });
      };

      var dragOverHandler = function(event) {
        event.preventDefault();

        var offset = axis === 'vertical' ? event.offsetY || event.layerY || (event.originalEvent ? event.originalEvent.offsetY : 0) : event.offsetX || event.layerX || (event.originalEvent ? event.originalEvent.offsetX : 0);

        if (offset < (this[axis === 'vertical' ? 'offsetHeight' : 'offsetWidth'] / 2)) {
          removeClass(droppingAfterClassName);
          element.addClass(droppingBeforeClassName);

        } else {
          removeClass(droppingBeforeClassName);
          element.addClass(droppingAfterClassName);
        }
      };

      var dropTimeout;

      var dropHandler = function(event) {
        event.preventDefault();

        var droppedItemIndex = parseInt((event.dataTransfer || event.originalEvent.dataTransfer).getData('text'), 10);

        // prevent event firing multiple times in firefox
        $timeout.cancel(dropTimeout);
        dropTimeout = $timeout(function() {
          _dropHandler(droppedItemIndex);
        }, 20);
      };

      var _dropHandler = function(droppedItemIndex) {
        var theList = scope.$eval(attrs.uiSelectSort);
        var itemToMove = theList[droppedItemIndex];
        var newIndex = null;

        if (element.hasClass(droppingBeforeClassName)) {
          if (droppedItemIndex < scope.$index) {
            newIndex = scope.$index - 1;
          } else {
            newIndex = scope.$index;
          }
        } else {
          if (droppedItemIndex < scope.$index) {
            newIndex = scope.$index;
          } else {
            newIndex = scope.$index + 1;
          }
        }

        move.apply(theList, [droppedItemIndex, newIndex]);

        $ngModel.$setViewValue(Date.now());

        scope.$apply(function() {
          scope.$emit('uiSelectSort:change', {
            array: theList,
            item: itemToMove,
            from: droppedItemIndex,
            to: newIndex
          });
        });

        removeClass(droppingClassName);
        removeClass(droppingBeforeClassName);
        removeClass(droppingAfterClassName);

        element.off('drop', dropHandler);
      };

      element.on('dragenter', function() {
        if (element.hasClass(draggingClassName)) {
          return;
        }

        element.addClass(droppingClassName);

        element.on('dragover', dragOverHandler);
        element.on('drop', dropHandler);
      });

      element.on('dragleave', function(event) {
        if (event.target != element) {
          return;
        }

        removeClass(droppingClassName);
        removeClass(droppingBeforeClassName);
        removeClass(droppingAfterClassName);

        element.off('dragover', dragOverHandler);
        element.off('drop', dropHandler);
      });
    }
  };
}]);

uis.directive('uisOpenClose', ['$parse', '$timeout', function ($parse, $timeout) {
  return {
    restrict: 'A',
    require: 'uiSelect',
    link: function (scope, element, attrs, $select) {
      $select.onOpenCloseCallback = $parse(attrs.uisOpenClose);

      scope.$watch('$select.open', function (isOpen, previousState) {
        if (isOpen !== previousState) {
          $timeout(function () {
            $select.onOpenCloseCallback(scope, {
              isOpen: isOpen
            });
          });
        }
      });
    }
  };
}]);

/**
 * Parses "repeat" attribute.
 *
 * Taken from AngularJS ngRepeat source code
 * See https://github.com/angular/angular.js/blob/v1.2.15/src/ng/directive/ngRepeat.js#L211
 *
 * Original discussion about parsing "repeat" attribute instead of fully relying on ng-repeat:
 * https://github.com/angular-ui/ui-select/commit/5dd63ad#commitcomment-5504697
 */

uis.service('uisRepeatParser', ['uiSelectMinErr','$parse', function(uiSelectMinErr, $parse) {
  var self = this;

  /**
   * Example:
   * expression = "address in addresses | filter: {street: $select.search} track by $index"
   * itemName = "address",
   * source = "addresses | filter: {street: $select.search}",
   * trackByExp = "$index",
   */
  self.parse = function(expression) {


    var match;
    //var isObjectCollection = /\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)/.test(expression);
    // If an array is used as collection

    // if (isObjectCollection){
    // 000000000000000000000000000000111111111000000000000000222222222222220033333333333333333333330000444444444444444444000000000000000055555555555000000000000000000000066666666600000000
    match = expression.match(/^\s*(?:([\s\S]+?)\s+as\s+)?(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(\s*[\s\S]+?)?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);

    // 1 Alias
    // 2 Item
    // 3 Key on (key,value)
    // 4 Value on (key,value)
    // 5 Source expression (including filters)
    // 6 Track by

    if (!match) {
      throw uiSelectMinErr('iexp', "Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '{0}'.",
              expression);
    }
    
    var source = match[5], 
        filters = '';

    // When using (key,value) ui-select requires filters to be extracted, since the object
    // is converted to an array for $select.items 
    // (in which case the filters need to be reapplied)
    if (match[3]) {
      // Remove any enclosing parenthesis
      source = match[5].replace(/(^\()|(\)$)/g, '');
      // match all after | but not after ||
      var filterMatch = match[5].match(/^\s*(?:[\s\S]+?)(?:[^\|]|\|\|)+([\s\S]*)\s*$/);
      if(filterMatch && filterMatch[1].trim()) {
        filters = filterMatch[1];
        source = source.replace(filters, '');
      }      
    }

    return {
      itemName: match[4] || match[2], // (lhs) Left-hand side,
      keyName: match[3], //for (key, value) syntax
      source: $parse(source),
      filters: filters,
      trackByExp: match[6],
      modelMapper: $parse(match[1] || match[4] || match[2]),
      repeatExpression: function (grouped) {
        var expression = this.itemName + ' in ' + (grouped ? '$group.items' : '$select.items');
        if (this.trackByExp) {
          expression += ' track by ' + this.trackByExp;
        }
        return expression;
      } 
    };

  };

  self.getGroupNgRepeatExpression = function() {
    return '$group in $select.groups track by $group.name';
  };

}]);

}());
angular.module("ui.select").run(["$templateCache", function($templateCache) {$templateCache.put("bootstrap/choices.tpl.html","<ul class=\"ui-select-choices ui-select-choices-content ui-select-dropdown dropdown-menu\" ng-show=\"$select.open && $select.items.length > 0\"><li class=\"ui-select-choices-group\" id=\"ui-select-choices-{{ $select.generatedId }}\"><div class=\"divider\" ng-show=\"$select.isGrouped && $index > 0\"></div><div ng-show=\"$select.isGrouped\" class=\"ui-select-choices-group-label dropdown-header\" ng-bind=\"$group.name\"></div><div ng-attr-id=\"ui-select-choices-row-{{ $select.generatedId }}-{{$index}}\" class=\"ui-select-choices-row\" ng-class=\"{active: $select.isActive(this), disabled: $select.isDisabled(this)}\" role=\"option\"><span class=\"ui-select-choices-row-inner\"></span></div></li></ul>");
$templateCache.put("bootstrap/match-multiple.tpl.html","<span class=\"ui-select-match\"><span ng-repeat=\"$item in $select.selected track by $index\"><span class=\"ui-select-match-item btn btn-default btn-xs\" tabindex=\"-1\" type=\"button\" ng-disabled=\"$select.disabled\" ng-click=\"$selectMultiple.activeMatchIndex = $index;\" ng-class=\"{\'btn-primary\':$selectMultiple.activeMatchIndex === $index, \'select-locked\':$select.isLocked(this, $index)}\" ui-select-sort=\"$select.selected\"><span class=\"close ui-select-match-close\" ng-hide=\"$select.disabled\" ng-click=\"$selectMultiple.removeChoice($index)\">&nbsp;&times;</span> <span uis-transclude-append=\"\"></span></span></span></span>");
$templateCache.put("bootstrap/match.tpl.html","<div class=\"ui-select-match\" ng-hide=\"$select.open && $select.searchEnabled\" ng-disabled=\"$select.disabled\" ng-class=\"{\'btn-default-focus\':$select.focus}\"><span tabindex=\"-1\" class=\"btn btn-default form-control ui-select-toggle\" aria-label=\"{{ $select.baseTitle }} activate\" ng-disabled=\"$select.disabled\" ng-click=\"$select.activate()\" style=\"outline: 0;\"><span ng-show=\"$select.isEmpty()\" class=\"ui-select-placeholder text-muted\">{{$select.placeholder}}</span> <span ng-hide=\"$select.isEmpty()\" class=\"ui-select-match-text pull-left\" ng-class=\"{\'ui-select-allow-clear\': $select.allowClear && !$select.isEmpty()}\" ng-transclude=\"\"></span> <i class=\"caret pull-right\" ng-click=\"$select.toggle($event)\"></i> <a ng-show=\"$select.allowClear && !$select.isEmpty() && ($select.disabled !== true)\" aria-label=\"{{ $select.baseTitle }} clear\" style=\"margin-right: 10px\" ng-click=\"$select.clear($event)\" class=\"btn btn-xs btn-link pull-right\"><i class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></i></a></span></div>");
$templateCache.put("bootstrap/no-choice.tpl.html","<ul class=\"ui-select-no-choice dropdown-menu\" ng-show=\"$select.items.length == 0\"><li ng-transclude=\"\"></li></ul>");
$templateCache.put("bootstrap/select-multiple.tpl.html","<div class=\"ui-select-container ui-select-multiple ui-select-bootstrap dropdown form-control\" ng-class=\"{open: $select.open}\"><div><div class=\"ui-select-match\"></div><input type=\"search\" autocomplete=\"off\" autocorrect=\"off\" autocapitalize=\"off\" spellcheck=\"false\" class=\"ui-select-search input-xs\" placeholder=\"{{$selectMultiple.getPlaceholder()}}\" ng-disabled=\"$select.disabled\" ng-click=\"$select.activate()\" ng-model=\"$select.search\" role=\"combobox\" aria-expanded=\"{{$select.open}}\" aria-label=\"{{$select.baseTitle}}\" ng-class=\"{\'spinner\': $select.refreshing}\" ondrop=\"return false;\"></div><div class=\"ui-select-choices\"></div><div class=\"ui-select-no-choice\"></div></div>");
$templateCache.put("bootstrap/select.tpl.html","<div class=\"ui-select-container ui-select-bootstrap dropdown\" ng-class=\"{open: $select.open}\"><div class=\"ui-select-match\"></div><span ng-show=\"$select.open && $select.refreshing && $select.spinnerEnabled\" class=\"ui-select-refreshing {{$select.spinnerClass}}\"></span> <input type=\"search\" autocomplete=\"off\" tabindex=\"-1\" aria-expanded=\"true\" aria-label=\"{{ $select.baseTitle }}\" aria-owns=\"ui-select-choices-{{ $select.generatedId }}\" class=\"form-control ui-select-search\" ng-class=\"{ \'ui-select-search-hidden\' : !$select.searchEnabled }\" placeholder=\"{{$select.placeholder}}\" ng-model=\"$select.search\" ng-show=\"$select.open\"><div class=\"ui-select-choices\"></div><div class=\"ui-select-no-choice\"></div></div>");
$templateCache.put("select2/choices.tpl.html","<ul tabindex=\"-1\" class=\"ui-select-choices ui-select-choices-content select2-results\"><li class=\"ui-select-choices-group\" ng-class=\"{\'select2-result-with-children\': $select.choiceGrouped($group) }\"><div ng-show=\"$select.choiceGrouped($group)\" class=\"ui-select-choices-group-label select2-result-label\" ng-bind=\"$group.name\"></div><ul id=\"ui-select-choices-{{ $select.generatedId }}\" ng-class=\"{\'select2-result-sub\': $select.choiceGrouped($group), \'select2-result-single\': !$select.choiceGrouped($group) }\"><li role=\"option\" ng-attr-id=\"ui-select-choices-row-{{ $select.generatedId }}-{{$index}}\" class=\"ui-select-choices-row\" ng-class=\"{\'select2-highlighted\': $select.isActive(this), \'select2-disabled\': $select.isDisabled(this)}\"><div class=\"select2-result-label ui-select-choices-row-inner\"></div></li></ul></li></ul>");
$templateCache.put("select2/match-multiple.tpl.html","<span class=\"ui-select-match\"><li class=\"ui-select-match-item select2-search-choice\" ng-repeat=\"$item in $select.selected track by $index\" ng-class=\"{\'select2-search-choice-focus\':$selectMultiple.activeMatchIndex === $index, \'select2-locked\':$select.isLocked(this, $index)}\" ui-select-sort=\"$select.selected\"><span uis-transclude-append=\"\"></span> <a href=\"javascript:;\" class=\"ui-select-match-close select2-search-choice-close\" ng-click=\"$selectMultiple.removeChoice($index)\" tabindex=\"-1\"></a></li></span>");
$templateCache.put("select2/match.tpl.html","<a class=\"select2-choice ui-select-match\" ng-class=\"{\'select2-default\': $select.isEmpty()}\" ng-click=\"$select.toggle($event)\" aria-label=\"{{ $select.baseTitle }} select\"><span ng-show=\"$select.isEmpty()\" class=\"select2-chosen\">{{$select.placeholder}}</span> <span ng-hide=\"$select.isEmpty()\" class=\"select2-chosen\" ng-transclude=\"\"></span> <abbr ng-if=\"$select.allowClear && !$select.isEmpty()\" class=\"select2-search-choice-close\" ng-click=\"$select.clear($event)\"></abbr> <span class=\"select2-arrow ui-select-toggle\"><b></b></span></a>");
$templateCache.put("select2/no-choice.tpl.html","<div class=\"ui-select-no-choice dropdown\" ng-show=\"$select.items.length == 0\"><div class=\"dropdown-content\"><div data-selectable=\"\" ng-transclude=\"\"></div></div></div>");
$templateCache.put("select2/select-multiple.tpl.html","<div class=\"ui-select-container ui-select-multiple select2 select2-container select2-container-multi\" ng-class=\"{\'select2-container-active select2-dropdown-open open\': $select.open, \'select2-container-disabled\': $select.disabled}\"><ul class=\"select2-choices\"><span class=\"ui-select-match\"></span><li class=\"select2-search-field\"><input type=\"search\" autocomplete=\"off\" autocorrect=\"off\" autocapitalize=\"off\" spellcheck=\"false\" role=\"combobox\" aria-expanded=\"true\" aria-owns=\"ui-select-choices-{{ $select.generatedId }}\" aria-label=\"{{ $select.baseTitle }}\" aria-activedescendant=\"ui-select-choices-row-{{ $select.generatedId }}-{{ $select.activeIndex }}\" class=\"select2-input ui-select-search\" placeholder=\"{{$selectMultiple.getPlaceholder()}}\" ng-disabled=\"$select.disabled\" ng-hide=\"$select.disabled\" ng-model=\"$select.search\" ng-click=\"$select.activate()\" style=\"width: 34px;\" ondrop=\"return false;\"></li></ul><div class=\"ui-select-dropdown select2-drop select2-with-searchbox select2-drop-active\" ng-class=\"{\'select2-display-none\': !$select.open || $select.items.length === 0}\"><div class=\"ui-select-choices\"></div></div></div>");
$templateCache.put("select2/select.tpl.html","<div class=\"ui-select-container select2 select2-container\" ng-class=\"{\'select2-container-active select2-dropdown-open open\': $select.open, \'select2-container-disabled\': $select.disabled, \'select2-container-active\': $select.focus, \'select2-allowclear\': $select.allowClear && !$select.isEmpty()}\"><div class=\"ui-select-match\"></div><div class=\"ui-select-dropdown select2-drop select2-with-searchbox select2-drop-active\" ng-class=\"{\'select2-display-none\': !$select.open}\"><div class=\"search-container\" ng-class=\"{\'ui-select-search-hidden\':!$select.searchEnabled, \'select2-search\':$select.searchEnabled}\"><input type=\"search\" autocomplete=\"off\" autocorrect=\"off\" autocapitalize=\"off\" spellcheck=\"false\" ng-class=\"{\'select2-active\': $select.refreshing}\" role=\"combobox\" aria-expanded=\"true\" aria-owns=\"ui-select-choices-{{ $select.generatedId }}\" aria-label=\"{{ $select.baseTitle }}\" class=\"ui-select-search select2-input\" ng-model=\"$select.search\"></div><div class=\"ui-select-choices\"></div><div class=\"ui-select-no-choice\"></div></div></div>");
$templateCache.put("selectize/choices.tpl.html","<div ng-show=\"$select.open\" class=\"ui-select-choices ui-select-dropdown selectize-dropdown\" ng-class=\"{\'single\': !$select.multiple, \'multi\': $select.multiple}\"><div class=\"ui-select-choices-content selectize-dropdown-content\"><div class=\"ui-select-choices-group optgroup\"><div ng-show=\"$select.isGrouped\" class=\"ui-select-choices-group-label optgroup-header\" ng-bind=\"$group.name\"></div><div role=\"option\" class=\"ui-select-choices-row\" ng-class=\"{active: $select.isActive(this), disabled: $select.isDisabled(this)}\"><div class=\"option ui-select-choices-row-inner\" data-selectable=\"\"></div></div></div></div></div>");
$templateCache.put("selectize/match-multiple.tpl.html","<div class=\"ui-select-match\" data-value=\"\" ng-repeat=\"$item in $select.selected track by $index\" ng-click=\"$selectMultiple.activeMatchIndex = $index;\" ng-class=\"{\'active\':$selectMultiple.activeMatchIndex === $index}\" ui-select-sort=\"$select.selected\"><span class=\"ui-select-match-item\" ng-class=\"{\'select-locked\':$select.isLocked(this, $index)}\"><span uis-transclude-append=\"\"></span> <span class=\"remove ui-select-match-close\" ng-hide=\"$select.disabled\" ng-click=\"$selectMultiple.removeChoice($index)\">&times;</span></span></div>");
$templateCache.put("selectize/match.tpl.html","<div ng-hide=\"$select.searchEnabled && ($select.open || $select.isEmpty())\" class=\"ui-select-match\"><span ng-show=\"!$select.searchEnabled && ($select.isEmpty() || $select.open)\" class=\"ui-select-placeholder text-muted\">{{$select.placeholder}}</span> <span ng-hide=\"$select.isEmpty() || $select.open\" ng-transclude=\"\"></span></div>");
$templateCache.put("selectize/no-choice.tpl.html","<div class=\"ui-select-no-choice selectize-dropdown\" ng-show=\"$select.items.length == 0\"><div class=\"selectize-dropdown-content\"><div data-selectable=\"\" ng-transclude=\"\"></div></div></div>");
$templateCache.put("selectize/select-multiple.tpl.html","<div class=\"ui-select-container selectize-control multi plugin-remove_button\" ng-class=\"{\'open\': $select.open}\"><div class=\"selectize-input\" ng-class=\"{\'focus\': $select.open, \'disabled\': $select.disabled, \'selectize-focus\' : $select.focus}\" ng-click=\"$select.open && !$select.searchEnabled ? $select.toggle($event) : $select.activate()\"><div class=\"ui-select-match\"></div><input type=\"search\" autocomplete=\"off\" tabindex=\"-1\" class=\"ui-select-search\" ng-class=\"{\'ui-select-search-hidden\':!$select.searchEnabled}\" placeholder=\"{{$selectMultiple.getPlaceholder()}}\" ng-model=\"$select.search\" ng-disabled=\"$select.disabled\" aria-expanded=\"{{$select.open}}\" aria-label=\"{{ $select.baseTitle }}\" ondrop=\"return false;\"></div><div class=\"ui-select-choices\"></div><div class=\"ui-select-no-choice\"></div></div>");
$templateCache.put("selectize/select.tpl.html","<div class=\"ui-select-container selectize-control single\" ng-class=\"{\'open\': $select.open}\"><div class=\"selectize-input\" ng-class=\"{\'focus\': $select.open, \'disabled\': $select.disabled, \'selectize-focus\' : $select.focus}\" ng-click=\"$select.open && !$select.searchEnabled ? $select.toggle($event) : $select.activate()\"><div class=\"ui-select-match\"></div><input type=\"search\" autocomplete=\"off\" tabindex=\"-1\" class=\"ui-select-search ui-select-toggle\" ng-class=\"{\'ui-select-search-hidden\':!$select.searchEnabled}\" ng-click=\"$select.toggle($event)\" placeholder=\"{{$select.placeholder}}\" ng-model=\"$select.search\" ng-hide=\"!$select.isEmpty() && !$select.open\" ng-disabled=\"$select.disabled\" aria-label=\"{{ $select.baseTitle }}\"></div><div class=\"ui-select-choices\"></div><div class=\"ui-select-no-choice\"></div></div>");}]);;/*global location, $, angular, base_url */
(function () {
    'use strict';

    angular
        .module('app', ['ngRoute', 'ngSanitize', 'ui.bootstrap',
                        'ui.utils', 'angular-loading-bar', 'ngFileUpload',
                        'ui.select', 'ui.tinymce', 'vcRecaptcha'
                       ])
        .config(
            function ($interpolateProvider, $locationProvider, $logProvider) {
                $interpolateProvider.startSymbol('[[');
                $interpolateProvider.endSymbol(']]');
                $locationProvider.hashPrefix('!');
                $logProvider.debugEnabled(true);
            }
        );
})();


$(document).ready(
    function () {
        $("#widget-info").hide();
        if ($("#widget-info").length == 0) {
            $("#widget-link").hide();
        }

        $("#widget-toggle").click(
            function () {
                if ($("#widget-info").is(":visible")) {
                    $("#widget-toggle").text("Show code");
                } else {
                    $("#widget-toggle").text("Hide code");
                }

                $("#widget-info").slideToggle("slow");
            }
        );
        var caretRightElements = $('h4').children('.fa-caret-right');
        // The right/down carets all start out hidden, which
        // is correct if there is only one version.
        // If there is more than one version, show the
        // appropriate carets (triangles): pointing down for the
        // first version, pointing right for all others.
        if (caretRightElements.length > 1) {
            // Only do this if there is more than one version
            // being displayed.
            $($('h4').children('.fa-caret-down')[0]).show();
            caretRightElements.each(
                function (index) {
                    if (index != 0) {
                        $(this).show();
                    }
                }
            );
        }

        // Control that's visible on page load when and only when
        // there are more than a certain number of supserseded
        // versions.
        $('#showSupersededVersions').click(
            function (event) {
                event.preventDefault();
                $('#hiddenSupersedVersions').show();
                $('#hideAfterShowingSuperdedVersions').hide();
            }
	);
    }
);

// Richard's note: I think this next statement has no effect,
// because it is not inside the document ready() above.
// The second and later versions are hidden in the first
// case by the blade HTML itself.
$('.box-content:not(:first-child)').hide();

$(document).on(
    'click',
    '.box-title',
    function (event) {
        var this_element = $(this);
        var box          = this_element.siblings('.box-content');
        if (box.is(":visible")) {
            return false;
        }

        // console.log(this_element.siblings('.box-content').length);
        $('.box-content:visible').slideUp('fast');
        this_element.siblings('.box-content').slideToggle('fast');
        // Now do the little carets next to version titles
        // to guide the user.
        // Nota bene: if we reached this point, there is more
        // than one version, so some little carets
        // _are_ already visible, and it is OK to be
        // showing/hiding them. (Cf. the case where there
        // is only one version, in which case all carets should
        // remain hidden.)
        var all_caret_right = $('h4').children('.fa-caret-right');
        var all_caret_down  = $('h4').children('.fa-caret-down');
        all_caret_right.show();
        all_caret_down.hide();
        var box_caret_right = this_element.children('h4').
        children('.fa-caret-right');
        var box_caret_down  = this_element.children('h4').
        children('.fa-caret-down');
        box_caret_right.hide();
        box_caret_down.show();
        return undefined;
    }
);

$(document).on(
    'mouseover',
    'a[tip]',
    function (event) {
        $(this).qtip(
            {
                content: {
                    text: function (e, api) {
                        var tip     = $(this).attr('tip');
                        var content = tip;
                        if (tip.indexOf('#') == 0 || tip.indexOf('.') == 0) {
                            if ($(tip.toString()).length) {
                                content = $(tip.toString()).html();
                            }
                        }

                        return content;
                    }
                },
                show: {
                    event: 'mouseover, click',
                    ready: true
                },
                hide: {
                    delay: 1000,
                    fixed: true
                },
                position: {
                    target: 'mouse',
                    adjust: {
                        mouse: false,
                        method: 'shift'
                    },
                    viewport: $(window)
                },
                style: {
                    classes: 'qtip-light qtip-shadow qtip-normal qtip-bootstrap'
                }
            }
        );
    }
);

$(document).on(
    'mouseover',
    'a[concept-tip]',
    function (event) {
        $('.qtip').each(
            function () {
                $(this).data('qtip').destroy();
            }
        );
        $(this).qtip(
            {
                content: {
                    text: function (e, api) {
                        var tip     = $(this).attr('concept-tip');
                        var content = tip;
                        if (tip.indexOf('#') == 0 || tip.indexOf('.') == 0) {
                            if ($(tip.toString()).length) {
                                content = $(tip.toString()).html();
                            }
                        }

                        return content;
                    }
                },
                show: {
                    event: 'mouseover',
                    ready: true
                },
                hide: {
                    delay: 500,
                    leave: false,
                    fixed: true
                },
                position: {
                    target: this,
                    my: 'center left',
                    at: 'center right',
                    adjust: {
                        mouse: false,
                        screen: false,
                        resize: false
                    }
                },
                style: {
                    classes: 'qtip-rounded qtip-blue concept-tip'
                }
            }
        );
    }
);

// Make every "a" element with role="button" accessible:
// having tabbed to an element, then pressing Enter is the
// same as clicking the element.
$(document).on('keyup', 'a[role="button"]', function(event) {
    event.preventDefault();
    if (event.which == 13) {
        event.target.click();
    }
});

// Helper function for the clickLinkedData() function below.  Note
// (and make sure!) that this matches the definition in
// wrap-getvocabaccess.blade.php. One exception: this version adds support
// for optional iri and title parameters.
// (Well, it doesn't match. We don't support the key parameter of the PHP
// function, used for Sesame downloads.)
function onclickURL(vocabObject, versionObject, apObject, iri, title) {
    // Require the Registry API.
    // Defining/accessing a "static" variable in this way means we
    // don't need to rely on a particular load order of the JS files.
    // (If we defined "var VocabularyRegistryApi = require(...)" at the
    // top level, we would need to move the loading of
    // vocabs-registry-client-bundle.js further up in scripts.blade.php.)
    if (typeof onclickURL.api == 'undefined' ) {
        onclickURL.api = require('vocabulary_registry_api');
    }
    var discriminator = onclickURL.api.AccessPoint.DiscriminatorEnum;
    var vocab = onclickURL.api.Vocabulary.constructFromObject(
        vocabObject);
    var version = onclickURL.api.Version.constructFromObject(
        versionObject);
    var ap = onclickURL.api.AccessPoint.constructFromObject(apObject);
    var ap_url;
    var params = { };
    switch (ap.getDiscriminator()) {
    case discriminator.apiSparql:
        ap_url = ap.getApApiSparql().getUrl();
        break;
    case discriminator.file:
        ap_url = ap.getApFile().getUrl();
        break;
    case discriminator.sesameDownload:
        ap_url = ap.getApSesameDownload().getUrlPrefix();
        break;
    case discriminator.sissvoc:
        ap_url = ap.getApSissvoc().getUrlPrefix() + '/concept';
        // referrer_type only for sissvoc, so far.
        params.referrer_type = 'view_resource';
        break;
    case discriminator.webPage:
        ap_url = ap.getApWebPage().getUrl();
        break;
    default:
        ap_url = 'unknown';
    }
    params.vocab_id = vocab.getId();
    params.vocab_status = vocab.getStatus();
    params.vocab_title = vocab.getTitle();
    params.vocab_slug = vocab.getSlug();
    params.vocab_owner = vocab.getOwner();
    params.version_id = version.getId();
    params.version_status = version.getStatus();
    params.version_title = version.getTitle();
    params.version_slug = version.getSlug();
    params.ap_id = ap.getId();
    params.ap_type = ap.getDiscriminator();
    params.ap_url = ap_url;

    // The iri and title parameters are optional.
    if (iri !== undefined) {
        params.resource_iri = iri;
    }
    if (title !== undefined) {
        params.resource_title = title;
    }
    // $.param does percent-encoding for us.
    return base_url + 'vocabs/logAccessPoint?' + $.param(params);
}

// Onclick function for the "View as linked data" link embedded
// within browse tree concept tooltips. It does analytics logging
// of the user's click.
// We take advantage of the fact that the SISSVoc endpoint
// for the current version is being displayed on the same page,
// and there's an onclick event on it that has pretty much what
// we want.
// The value of the title parameter should be some sort of label
// of the resource. (E.g., it could be a SKOS prefLabel.)
// This function "should" be defined in visualiseCtrl, within
// the controller (i.e., as $scope.clickLinkedData, and used as
// ng-click="clickLinkedData(...)"), but it can't be,
// as the tooltips are DOM elements that aren't within the scope
// of that controller.
function clickLinkedData(iri, title) {
    var current_version_sissvoc = document.querySelector(
        "a#current_version_sissvoc");
    var vocab = JSON.parse(current_version_sissvoc.getAttribute("vocab"));
    var current_version = JSON.parse(current_version_sissvoc.getAttribute(
        "current_version"));
    var ap = JSON.parse(current_version_sissvoc.getAttribute("ap"));

    var portal_callback = onclickURL(vocab, current_version, ap, iri, title);

    $.ajax(portal_callback);
}

$(document).on(
    'click',
    '.download-chooser',
    function (event) {
        event.preventDefault();
        $(this).qtip(
            {
                show: {
                    event: event.type,
                    ready: 'true'
                },
                hide: {
                    delay: 1000,
                    fixed: true
                },
                content: {
                    text: function (event, api) {
                        var box     = $(this).parents('.box-content');
                        var content = $('.download-content', box);
                        return content.html();
                    }
                },
                position: {
                    my: 'center left',
                    at: 'center right',
                    adjust: {
                        mouse: false
                    }
                },
                style: {
                    classes: 'qtip-light qtip-shadow qtip-normal qtip-bootstrap'
                }
            },
            event
        );
    }
).on(
    'click',
    '.showsp',
    function (event) {
            event.preventDefault();
            $(this).hide();
            var box     = $(this).parents('.sp-box');
            var content = $('.sp', box);
            content.slideDown('fast');
    }
);

/* Display tooltips where the content comes from a Confluence page
   structured in a particular way. The content of the confluence_tip
   attribute is the name of an anchor into the already-loaded content.
   But (because of the way Confluence positions anchors) we have to navigate
   to get to the "real" beginning of the content. (See repeated calls to
   parent() and next().)
   Note use of adjust method shift which helps dealing with the larger tooltips.
*/
$(document).on(
    'mouseover',
    'span[confluence_tip]',
    function (event) {
        $(this).qtip(
            {
                content: {
                    text: function (e, api) {
                        var tip     = $(this).attr('confluence_tip');
                        var content = tip;
                        if ($('h4[id="' + tip.toString() + '"]').length) {
                            content = ($('h4[id="' + tip.toString()
                                         + '"]').parent().parent().parent()
                                       .next().html());
                        }

                        return content;
                    }
                },
                show: {
                    event: 'mouseover, click',
                    ready: true
                },
                hide: {
                    delay: 1000,
                    fixed: true
                },
                position: {
                    target: 'mouse',
                    adjust: {
                        mouse: false,
                        method: 'shift'
                    },
                    viewport: $(window)
                },
                style: {
                    classes: 'qtip-light qtip-shadow qtip-normal qtip-bootstrap cms-help-tip'
                }
            }
        );
    }
);

$(document).on(
    'click',
    '.re_preview',
    function (event) {
        event.preventDefault();
        $(this).qtip(
            {
                show: {
                    event: event.type,
                    ready: 'true'
                },
                hide: {
                    delay: 1000,
                    fixed: true
                },
                content: {
                    text: function (event, api) {
                        api.elements.content.html('Loading...');
                        if ($(this).attr('related')) {
                            // return "have text for re "+$(this).attr('related');

                            var vocabId = document.querySelector(
                                "meta[property='vocab:id']").
                                getAttribute("content");
                            // We send back these vocab... properties just for
                            // analytics logging.
                            var vocabStatus = document.querySelector(
                                "meta[property='vocab:status']").
                                getAttribute("content");
                            var vocabTitle = document.querySelector(
                                "meta[property='vocab:title']").
                                getAttribute("content");
                            var vocabSlug = document.querySelector(
                                "meta[property='vocab:slug']").
                                getAttribute("content");
                            var vocabOwner = document.querySelector(
                                "meta[property='vocab:owner']").
                                getAttribute("content");
                            var url = base_url + 'vocabs/relatedPreview';
                        }

                        if (url) {
                            return $.ajax(url,
                                {
                                    'data': {
                                        'related': $(this).attr('related'),
                                        'vocab_id': vocabId,
                                        'vocab_status': vocabStatus,
                                        'vocab_title': vocabTitle,
                                        'vocab_slug': vocabSlug,
                                        'vocab_owner': vocabOwner,
                                        'sub_type': $(this).attr('sub_type')
                                    }
                                }
                            ).then(
                                function (content) {
                                    return content;
                                },
                                function (xhr, status, error) {
                                    api.set('content.text',
                                            status + ': ' + error);
                                }
                            );
                        } else {
                            return 'Error displaying preview';
                        }
                    }
                },
                position: {
                    target: 'mouse',
                    adjust: {
                        // The method was 'shift', but is now 'flip shift'
                        // after removing the escaping of the description,
                        // as the width of the tooltip was no longer
                        // fully expanding to make full use of max-width.
                        method: 'flip shift',
                        mouse: false
                    },
                    viewport: $(window)
                },
                style: {
                    classes: 'qtip-light qtip-shadow qtip-normal qtip-bootstrap re-help-tip'
                }
            },
            event
        );
    }
);

// Subscribe button.
// First, mouseover. This is just like a[tip],
// except the tooltip is moved down (class element-shorter-top)
// and out of the way of the element, so that click events are always
// processed. See:
// https://stackoverflow.com/questions/18670334/qtip2-prevents-clicks-on-underlaying-elements
$(document).on(
    'mouseover',
    '#subscribe-link',
    function (event) {
        event.preventDefault();
        $(this).qtip(
            {
                content: {
                    text: 'Open the subscription dialog.'
                },
                show: {
                    event: 'mouseover',
                    ready: true
                },
                hide: {
                    event: 'mouseleave click unfocus',
                    fixed: true
                },
                position: {
                    target: 'mouse',
                    adjust: {
                        mouse: false,
                        method: 'shift'
                    },
                    viewport: $(window)
                },
                style: {
                    classes: 'qtip-light qtip-shadow qtip-normal qtip-bootstrap element-shorter-top'
                }
            }
        );
    }
);

// Show a tooltip over the subscribe button _after_ the user
// has requested a download. Clicking on the tooltip opens
// the subscribe modal dialog.
$(document).on(
    'click',
    '.download-link',
    function (event) {
        // Timeout seems to be necessary, otherwise the qtip can get
        // lost.
        setTimeout(function() {
            $('#subscribe-link').qtip(
                {
                    content: {
                        text: 'Subscribe to be notified of changes to this vocabulary.'
                    },
                    show: {
                        ready: true
                    },
                    hide: {
                        leave: false,
                        inactive: 5000,
                        event: 'mouseleave click unfocus',
                        fixed: true
                    },
                    position: {
                        viewport: $(window)
                    },
                    style: {
                        classes: 'qtip-light qtip-shadow qtip-normal qtip-bootstrap element-shorter-top'
                    },
                    events: {
                        render: function(event, api) {
                            // Clicking on the qtip opens the
                            // subscribe modal dialog.
                            var tooltip = api.elements.tooltip;
                            tooltip.bind('click', function(event, api) {
                                angular.element(document.getElementById(
                                    'subscribe-link')).scope().openDialog();
                            });
                        }
                    }
                }
            );
        }, 1000);
    }
);

// Feedback buttons.
// NB: the class .feedback_button is used for the button labelled
// "Feedback", and the class .myCustomTrigger is used
// for the "Contact us" link in the page footer.
window.ATL_JQ_PAGE_PROPS = {
    "triggerFunction": function (showCollectorDialog) {
        // Requires that jQuery is available!
        $(".feedback_button, .myCustomTrigger").click(
            function (e) {
                e.preventDefault();
                showCollectorDialog();
            }
        );

    }
};

$(document).on(
    'click',
    '.deleteVocab',
    function (e) {
        e.preventDefault();
        if (confirm('Are you sure you want to delete this vocabulary, '
              + 'including all endpoints? This action cannot be reversed.')) {
            var vocab_id = $(this).attr('vocab_id');
            // status, owner, slug, and title are for analytics logging
            var vocab_status = $(this).attr('vocab_status');
            var vocab_owner = $(this).attr('vocab_owner');
            var vocab_slug = $(this).attr('vocab_slug');
            var vocab_title = $(this).attr('vocab_title');
            var delete_mode = $(this).attr('delete_mode');
            $.ajax(
                {
                    url: base_url + 'vocabs/delete',
                    type: 'POST',
                    data: {
                        id: vocab_id,
                        vocab_status: vocab_status,
                        vocab_owner: vocab_owner,
                        vocab_slug: vocab_slug,
                        vocab_title: vocab_title,
                        mode: delete_mode,
                    },
                    dataType: 'json',
                    success: function (data) {
                        var response = data;
                        if (data.status == 'success') {
                            location.reload();
                        } else {
                            alert('Delete failed: ' + data.message);
                        }
                    }
                }
            );
        } else {
            return false;
        } // end if
        return undefined;
    }
);

// Utility for truncating strings that are going into
// HTTP headers.
function truncateHeader(s) {
    // Typical header maximum length is 8192 characters.
    // For now, truncate to 4000 characters.
    // This allows for the maximum having been set to 4096,
    // and allows for 96 characters for the header name.
    return s.substring(0,4000);
}


function showWidget()
{
    $('html, body').animate(
        {
            scrollTop: $('#widget').offset().top
        },
        1000
    );
    if ($("#widget-info").is(":hidden")) {
        $("#widget-toggle").click();
    }

    return undefined;
}

// Utility function to get a cookie.
/* Since CC-2901, reading the authentication cookie is impossible,
  because it now has the HttpOnly attribute, so we can't read its
  value. Turns out that this is not a problem: The browser sends the
  cookie correctly anyway!  NB: this relies on the cookie host _and_
  path (currently, "/") being sufficiently permissive. E.g,. if the
  path were more specific, this would _not_ work.
  The places where this function was used have now also been commented
  out; if we ever think we need to use it, we probably also need
  to consider whether to remove the HttpOnly attribute.
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
*/

// Polyfill Array find() method from
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
// Needed for IE (sigh).
// Used in relatedCtrl.js.
//https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    }
  });
}
;(function () {
    'use strict';

    angular
        .module('app')
        .filter('trustAsHtml', ['$sce', function ($sce) {
            return function (text) {
                var decoded = $('<div/>').html(text).text();
                return $sce.trustAsHtml(decoded);
            }
        }])
        .filter('processSolrHighlight', ['$sce', function($sce) {
            return function(text) {
                // Special filter for processing the result
                // of Solr highlighting.
                if (text) {
                    // Escape any HTML entities, then put bold tags around
                    // highlighted content.
                    // NB: The strings "HL_START" and "HL_END" must
                    // match the values of the constants HIGHLIGHT_PRE
                    // and HIGHLIGHT_POST defined in the Registry's
                    // SearchIndex method!
                    return $sce.trustAsHtml(text.
                                            replace(/&/g, '&amp;').
                                            replace(/</g, '&lt;').
                                            replace(/>/g, '&gt;').
                                            replace(/HL_START/g,
                                                    '<b class="vocab-search-result-highlight">').
                                            replace(/HL_END/g, '</b>'));
                }
                return '';
            }
        }])
        .filter('languageFilter', function ($log) {
            return function (ln, langs) {
                for (var i = 0; i < langs.length; i++) {
                    if (ln == langs[i].value) {
                        return langs[i].text
                    }
                }
                return ln;
            }
        })
        .filter('stringToArray', function(){
            // Used by the search controller to support iterating over
            // _either_ an array or just one string. (We want to
            // treat a string value as a one-element array.)
            return function (text) {
                if (typeof text == 'string') {
                    return [ text ];
                }
                return text;
            }
        })
        .filter('trim', function () {
           return function(text, length) {
               var trimmedString = text.substring(0, length);
               var extension = /(?:.([^.]+))?$/.exec(text)[1];

               if (trimmedString !== text) {
                   trimmedString += ' ...';
                   trimmedString += extension;
               }

               return trimmedString;
           }
        });
    ;
})();
;(function () {
    'use strict';

    angular
        .module('app')
        .directive('ngDebounce', function ($timeout) {
            return {
                restrict: 'A',
                require: 'ngModel',
                priority: 99,
                link: function (scope, elm, attr, ngModelCtrl) {
                    if (attr.type === 'radio' || attr.type === 'checkbox') return;

                    elm.unbind('input');

                    var debounce;
                    elm.bind('input', function () {
                        $timeout.cancel(debounce);
                        debounce = $timeout(function () {
                            scope.$apply(function () {
                                ngModelCtrl.$setViewValue(elm.val());
                            });
                        }, attr.ngDebounce || 1000);
                    });
                    elm.bind('blur', function () {
                        scope.$apply(function () {
                            ngModelCtrl.$setViewValue(elm.val());
                        });
                    });
                }

            }
        })
        .directive('languageValidation', function () {
            return {
                restrict: 'A',
                link: function (scope, elem, attr, ctrl) {

                }
            }
        })
    ;
})();;/**
 * Vocabulary ANGULARJS Factory
 * A component that deals with the vocabulary service point directly
 * @author Minh Duc Nguyen <minh.nguyen@ands.org.au>
 */
(function () {
    'use strict';

    angular
        .module('app')
        .factory('vocabs_factory', function ($http) {
            return {
                // REMOVE file onced clear out usage
            }
        });
})();
;/**
 * Controller for search.
 * @namespace searchCtrl
 */
/*jslint
    browser: true
*/
/*global
    $, angular
*/

// TODO: use either iso-639-1 for language selection:
// https://www.npmjs.com/package/iso-639-1
// or langs:
// https://www.npmjs.com/package/langs
// For PHP, use:
// https://github.com/matriphe/php-iso-639

(function () {
    'use strict';

    angular
        .module('app')
        .controller('searchCtrl', searchController);

    /** Default active tab.
     * @memberof searchCtrl
     */
    var defaultActiveTab = 'vocabularies';

    /** Default (maximum) number of search results per page.
     * @memberof searchCtrl
     */
    var defaultPageSize = '15';

    /** List of available sort options, when there is no query term.
     * The code relies on a convention that the default option
     * is the first in the list.
     * The id values must correspond with the values defined
     * in the Registry Schema search-sort-order enumerated type.
     * @memberof searchCtrl
     */
    var sortOptionsWhenNoQueryTerm = [
        { 'id': 'aToZ', 'name': 'Title A-Z'},
        { 'id': 'zToA', 'name': 'Title Z-A'},
        { 'id': 'lastUpdatedAsc', 'name': 'Least recently updated'},
        { 'id': 'lastUpdatedDesc', 'name': 'Most recently updated'}
    ];

    /** List of available sort options, when there is a query term.
     * The code relies on a convention that the default option
     * is the first in the list.
     * The id values must correspond with the values defined
     * in the Registry Schema search-sort-order enumerated type.
     * @memberof searchCtrl
     */
    var sortOptionsWhenQueryTerm = [
        { 'id': 'relevance', 'name': 'Relevance'},
        { 'id': 'aToZ', 'name': 'Title A-Z'},
        { 'id': 'zToA', 'name': 'Title Z-A'},
        { 'id': 'lastUpdatedAsc', 'name': 'Least recently updated'},
        { 'id': 'lastUpdatedDesc', 'name': 'Most recently updated'}
    ];

    /** A mapping of URIs that are possible values of the rdf_type
     * field, to some nice human-readable values, for display in
     * the portal search results.
     * @memberof searchCtrl
     */
    var rdfTypesHumanReadable = {
        'NONE': 'None (manually-entered)',
        'http://www.w3.org/2004/02/skos/core#Concept': 'SKOS Concept',
        'http://www.w3.org/2004/02/skos/core#ConceptScheme':
        'SKOS Concept Scheme',
        'http://www.w3.org/2004/02/skos/core#Collection': 'SKOS Collection',
        'http://www.w3.org/2004/02/skos/core#OrderedCollection':
        'SKOS Ordered Collection'
    };

    /** Search controller.  See `views/includes/search-view.blade.php`
     * for the AngularJS-enabled search results template.
     * @param $scope The AngularJS controller scope.
     * @param $timeout The AngularJS $timeout service.
     * @param $log The AngularJS $log service.
     * @param $location The AngularJS $log service.
     * @memberof searchCtrl
     */
    function searchController($scope, $timeout, $log, $location,
                              $templateCache) {

        /* Define our template for the bottom tabset. The effect of this
           is to hide the "body" of each tab when we don't use it.
        */
        $templateCache.put("tabset-hidden.html",
    "<div>\n" +
    "  <ul class=\"nav nav-{{tabset.type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
    "  <div class=\"tab-content\" style=\"display:none\">\n" +
    "    <div class=\"tab-pane\"\n" +
    "         ng-repeat=\"tab in tabset.tabs\"\n" +
    "         ng-class=\"{active: tabset.active === tab.index}\"\n" +
    "         uib-tab-content-transclude=\"tab\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");

        // Initialise Registry API access.
        var VocabularyRegistryApi = require('vocabulary_registry_api');
        var defaultClient = VocabularyRegistryApi.ApiClient.instance;
        defaultClient.basePath = registry_api_url;
        // Let the Registry know that we are the search controller,
        // and what URL this page is.
        defaultClient.defaultHeaders['portal-id'] = 'Portal-JS-search';
        defaultClient.defaultHeaders['portal-referrer'] =
            truncateHeader(window.location.toString());
        var api = new VocabularyRegistryApi.ServicesApi();

        /** Convenience reference to `base_url`; used in the results
         * template.
         * @memberof searchCtrl
         */
        $scope.base_url = base_url;

        /** Container for settings and values of the vocabularies tab.
         * vocabularies.facets, vocabularies.result.
         * @memberof searchCtrl
         */
        $scope.vocabularies = {
            /* Processed highlighting data for search results.  Keys
             * are document ids; values are the processed highlight
             * data for that document. See unpackHighlighting().
             */
            'highlighting' : {}
        };

        /** Container for settings and values of the vocabularies tab.
         * resources.facets, resources.result.
         * @memberof searchCtrl
         */
        $scope.resources = {
            /* See the comments in the definition of
             * $scope.vocabularies. */
            'highlighting' : {}
        };

        /** Get the container for the settings and values of the
         * active tab.  Returns either $scope.vocabularies or
         * $scope.resources. Defaults to $scope.vocabularies if there
         * is no current setting of the active tab.
         * @memberof searchCtrl
         */
        $scope.activeContainer = function () {
            if (!$scope.filters['activeTab']) {
                return $scope.vocabularies;
            }
            switch ($scope.filters['activeTab']) {
            case 'resources':
                return $scope.resources;
            case 'vocabularies':
            default:
                return $scope.vocabularies;
            }
        }

        /** List of available collapse options for the resource search.
         * The code relies on a convention that the default option
         * is the first in the list.
         * The id values must correspond with the values defined
         * in the Registry Schema search-resources-collapse enumerated type.
         * @memberof searchCtrl
         */
        $scope.collapseOptions = [
            { 'id': 'vocabularyIdIri',
              'name': 'Collapse results with the same IRI, per vocabulary'},
            { 'id': 'iri', 'name': 'Collapse results with the same IRI'},
            { 'id': 'none', 'name': 'Don\'t collapse results'}
        ];

        /** Model for form elements. That includes:
         * form.query, the input in which the user
         * types their search query term(s);
         * form.sort: the selected sort order;
         * form.collapse: the selected collapse option,
         * and the various xQuickFilter text inputs.
         * @memberof searchCtrl
         */
        $scope.form = {};

        $scope.sortOptions = sortOptionsWhenNoQueryTerm;
        $scope.form.sort = $scope.sortOptions[0].id;
        $scope.form.collapse = $scope.collapseOptions[0].id;

        /** The collection of all filters, for all tabs.
         * Keys are:
         * 'activeTab': Which search results tab is "active", i.e., currently
         * visible to users. Possible values are 'vocabularies' and
         * 'resources'.
         * 'q': The user-entered search query.
         * 'pp': The number of results per page.
         * 'sort': The sort order.
         * 'v_*': Filters specific to the vocabularies tab.
         * 'r_*': Filters specific to the resources tab.
         * Example filters for the vocabularies tab:
         * 'v_p': The page number of the vocabulary search results.
         * 'v_subject_labels': The current subject label filters.
         *
         * The form of the URL containing a search is:
         * `base_url+"search/#!/?"+filter+"="+value`, e.g.,
         * `base_url+"search/#!/?q=fish"`,
         * `base_url+"search/#!/?q=fish&subjects=Fish"`. In recent
         * AngularJS, `$scope.filters` is a _copy_, not a
         * reference. So need to invoke
         * `$location.search($scope.filters)` whenever there's a
         * change.
         * All filters for all tabs go into here. Filters that
         * "belong" to just one tab have a prefix: "v_" for
         * filters just for the vocabularies tab, "r_" for
         * filters just for the resources tab.
         * @memberof searchCtrl
         */
        $scope.filters = $location.search();
        // See the end of this file for special handling to cope
        // with the particular case of the URL being
        // https://.../search, i.e. directly coming to the
        // search page with no filters specified.

        /** Entry point for user-initiated search actions; this is the
         * method invoked by click events for the "Search" button. The
         * effect is currently to keep any query text and filters that
         * are in place, but go (back) to page 1 of search results.
         * @memberof searchCtrl
         */
        $scope.search = function (isPagination) {
            // Reset all quick filters to help prevent user confusion.
            $scope.resetQuickFilters();
            $scope.filters.q = $scope.form.query;
            if (!$scope.filters['activeTab']) {
                $scope.filters['activeTab'] = defaultActiveTab;
            }
            if (!$scope.filters['q']) {
                $scope.filters['q'] = '';
            }
            if (!$scope.filters['pp']) {
                $scope.filters['pp'] = defaultPageSize;
            }
            // If no isPagination parameter was supplied, or if it is
            // false, then (re)set the p filters to 1.
            // NB: this happens when the user changes the page size
            // (filters.pp), so that we go back to the first page
            // of results. And this now happens for _both_ tabs.
            if (!isPagination || isPagination == undefined) {
                $scope.filters['v_p'] = 1;
                $scope.filters['r_p'] = 1;
            }
            var sortFilter = sortSettingForCurrentSettings();
            if (sortFilter === undefined) {
                delete $scope.filters['sort'];
            } else {
                $scope.filters['sort'] = sortFilter;
            }
            if ($scope.form.collapse === undefined) {
                delete $scope.filters['r_collapse_expand'];
            } else {
                $scope.filters['r_collapse_expand'] = $scope.form.collapse;
            }
            if (notAlreadyOnResultsPage()) {
                // We're currently on a page _other than_
                // a search results page. So we redirect
                // to the Portal's PHP search() controller.
                // Use the default page size.
                window.location = $scope.base_url + 'search/#!/?' +
                    'activeTab=' + defaultActiveTab +
                    '&pp=' + defaultPageSize +
                    '&q=' + encodeURIComponent($scope.filters['q']);
            } else {
                // CC-2600 When coming back to this search result
                // using the browser back button, don't scroll to
                // where the user was, but come back to the top of the
                // page.
                setScrollRestoration();
                scrollToTop();
                // See comment above about a change to AngularJS. Now,
                // put our $scope.filters into $location.search().
                $location.search($scope.filters);
                // And that will have the desired effect of triggering
                // a change to $location.url(), and causes the search
                // to be performed.  Note that we _don't_ call
                // performVocabulariesSearch() here!  We don't need to: it's
                // invoked by the watcher.  And therefore we
                // _should't_ call performVocabulariesSearch() here, because we
                // would then get an extra call to api.search().
            }
        };

        /** Reset all quick filters.
         * @memberof searchCtrl
         */
        $scope.resetQuickFilters = function () {
            $scope.form.v_subjectQuickFilter = {};
            $scope.form.v_publisherQuickFilter = {};
            $scope.form.r_subjectQuickFilter = {};
            $scope.form.r_publisherQuickFilter = {};
        };

        /** If the browser supports it, set history scroll restoration
         * to "manual".
         * @memberof searchCtrl
         */
        function setScrollRestoration() {
            if ('scrollRestoration' in history) {
                // Browser-dependent. Not IE/Edge (yet).
                history.scrollRestoration = 'manual';
            }
        }

        /** If the browser supports it, set history scroll restoration
         * (back) to "auto". We need this on search result links
         * for Chrome. Without using this, the setting would
         * remain 'manual'.
         * @memberof searchCtrl
         */
        $scope.unsetScrollRestoration = function() {
            if ('scrollRestoration' in history) {
                // Browser-dependent. Not IE/Edge (yet).
                history.scrollRestoration = 'auto';
            }
        }


        /** Primitive (but good enough) lock used by scrollToTop() to
         * make sure we don't try to scroll more than once.
         * @memberof searchCtrl
         */
        var scrollingToTop = false;

        /** Scroll to the top of the page, but only if there isn't
         * already scrolling in progress. (Without "multiple-scrolling
         * prevention", you may have to "fight" the browser if you use
         * the mousewheel "too soon" after adding/clearing a filter.)
         * @memberof searchCtrl
         */
        function scrollToTop() {
            if (scrollingToTop) {
                // Don't do anything if we're already scrolling!
                return;
            }
            scrollingToTop = true;
            $('html, body').animate({ 'scrollTop': 0 }, {
                'duration' : 500,
                'always': function() {
                    scrollingToTop = false;
                }
            });
        }

        /** Reset all search filters. Reset the page size to the
         * default, and show page 1 of results.
         * @memberof searchCtrl
         */
        $scope.resetSearch = function () {
            $scope.filters = {};
            $scope.filters['pp'] = defaultPageSize;
            $scope.form.query = "";
            // As noted in the comments for the sort option
            // definitions, we rely on a convention that the default
            // sort option is the first in the list.
            $scope.form.sort = $scope.sortOptions[0].id;
            // Ditto for collapse options.
            $scope.form.collapse = $scope.collapseOptions[0].id;
            // $scope.search also resets quick filters.
            $scope.search();
        };

        /** Perform a search on vocabulary metadata, and extract the results.
         * @memberof searchCtrl
         */
        function performVocabulariesSearch() {
            // Clear last facet results.  If we were to have warning
            // icons in the current search breadbox, this would avoid
            // "blinking" of those warning icons.  (But we don't yet
            // have warning icons ...)
            // Oops, let's comment this out for now, as it _causes_
            // "blinking" of the "Refine" section!
            //    $scope.vocabularies.facets = undefined;

            var filtersToSend = {};
            // We'll send only the filters that apply to searching
            // vocabulary metadata. And we strip the 'v_' prefix
            // from vocabularies-search-specific filter names.
            angular.forEach($scope.filters, function(value, key) {
                if (isFilterForTab(key, 'vocabularies')) {
                    filtersToSend[key.replace(/^v_/, '')] = value;
                }
            });

            if ($scope.activeContainer() === $scope.resources) {
                // The vocabularies tab is active, so only get
                // the _count_ of results; don't get the results themselves.
                filtersToSend["count_only"] = true;
            }

            api.search(JSON.stringify(filtersToSend)).
                then(function (data) {
                    // $log.debug(data);
                    $scope.vocabularies.result = data;
                    var facets = [];
                    // data.facet_counts are the facet counts from the search;
                    // there _may_ also be
                    // data.facet_counts_extra['subject_labels'], etc.
                    // For each facet f, merge data from
                    // data.facet_counts[f] and data.facet_counts_extra[f].
                    var facet_counts = data.facet_counts;
                    var facet_counts_extra = data['facets'];
                    if (facet_counts_extra == undefined) {
                        facet_counts_extra = {};
                    }
                    // We will have facet_counts iff we didn't specify
                    // "count_only" above.
                    if (facet_counts !== undefined) {
                      angular.forEach(facet_counts.facet_fields,
                        function (item, index) {
                            facets[index] = [];
                            for (var i = 0;
                                 i < facet_counts.facet_fields[index].length;
                                 i += 2) {
                                var fa = {
                                    name: facet_counts.facet_fields[index][i],
                                    result_count:
                                    facet_counts.facet_fields[index][i + 1]
                                };
                                facets[index].push(fa);
                            }
                            // Now see if there is more info in
                            // facet_counts_extra.
                            if (index in facet_counts_extra) {
                                var facet_counts_extra_to_merge =
                                    facet_counts_extra[index].buckets;
                                // Now merge facets_extra into facets[index].
                                facets[index] = mergeFacets(facets[index],
                                                 facet_counts_extra_to_merge);
                            }
                            // Sort facets case-insensitively; they come back
                            // from Solr sorted case-sensitively.
                            facets[index].sort(caseInsensitiveCompare);
                        });
                    }
                    $scope.vocabularies.facets = facets;

                    unpackHighlighting($scope.vocabularies);

                    $scope.vocabularies.page = {
                        cur: ($scope.filters['v_p'] ?
                              parseInt($scope.filters['v_p']) : 1),
                        rows: ($scope.filters['pp'] ?
                               parseInt($scope.filters['pp']) : 10),
                        range: 3,
                        pages: []
                    }
                    $scope.vocabularies.page.end = Math.ceil(
                        $scope.vocabularies.result.response.numFound /
                            $scope.vocabularies.page.rows);
                    for (var x = ($scope.vocabularies.page.cur -
                                  $scope.vocabularies.page.range);
                         x < (($scope.vocabularies.page.cur +
                               $scope.vocabularies.page.range)+1); x++ ) {
                        if (x > 0 && x <= $scope.vocabularies.page.end) {
                            $scope.vocabularies.page.pages.push(x);
                        }
                    }
                    // We changed the model outside AngularJS's notice, so we
                    // need to cause a refresh of the form.
                    $scope.$apply();
                    // Scroll to top, if we've come back/forward to a
                    // page we already set to "manual" scroll
                    // restoration.  This happens going back/forward
                    // to one of "our" pages, except when that's the
                    // _last_ page in the contiguous sequence of
                    // search results pages.
                    if ('scrollRestoration' in history) {
                        // Browser-dependent. Not IE/Edge (yet).
                        if (history.scrollRestoration == 'manual') {
                            scrollToTop();
                        }
                    }
                });
        }

        /** Tidy the field names of the highlighting results
         * for one Solr document returned from a resources search.
         * @param {object} result The highlighting results for one
         *     Solr document. The keys are field names.
         * @returns {object} The highlighting results, but with
         *     the keys made "pretty".
         * @memberof searchCtrl
         */
        function tidyResourceFieldNames(result) {
            var tidied = {};
            angular.forEach(result, function(value, key) {
                var newKey = key;
                // Deal with:
                // top_concept
                // rdfs_label
                // rdfs_label_all
                // skos_prefLabel
                // skos_prefLabel_all
                // dcterms_description
                // dcterms_description_all
                // etc.
                // Make sure that all underscores _other_ than
                // the one that precedes a language key are gone
                // before the final replace!
                newKey = newKey.
                    replace(/^top_concept/, "top concept").
                    replace(/^rdfs_/, "RDF Schema ").
                    replace(/^skos_/, "SKOS ").
                    replace(/^dcterms_/, "DC Terms ").
                    replace (/_all$/, "").
                    replace (/_([A-Za-z]+)$/, " , language: $1");
                tidied[newKey] = value;
            });
            return tidied;
        }


        /** Perform a search on resource data, and extract the
         * results.
         * @memberof searchCtrl
         */
        function performResourcesSearch() {
            // Clear last facet results.  If we were to have warning
            // icons in the current search breadbox, this would avoid
            // "blinking" of those warning icons.  (But we don't yet
            // have warning icons ...)
            // Oops, let's comment this out for now, as it _causes_
            // "blinking" of the "Refine" section!
            //    $scope.resources.facets = undefined;

            var filtersToSend = {};
            // We'll send only the filters that apply to searching
            // resource data. And we strip the 'r_' prefix from
            // resources-search-specific filter names.
            angular.forEach($scope.filters, function(value, key) {
                if (isFilterForTab(key, 'resources')) {
                    filtersToSend[key.replace(/^r_/, '')] = value;
                }
            });
            if ($scope.activeContainer() === $scope.vocabularies) {
                // The vocabularies tab is active, so only get
                // the _count_ of results; don't get the results themselves.
                filtersToSend["count_only"] = true;
            }

            api.searchResources(JSON.stringify(filtersToSend)).
                then(function (data) {
                    // $log.debug(data);
                    $scope.resources.result = data;
                    var facets = [];
                    // data.facet_counts are the facet counts from the search;
                    // there _may_ also be
                    // data.facet_counts_extra['subject_labels'], etc.
                    // For each facet f, merge data from
                    // data.facet_counts[f] and data.facet_counts_extra[f].
                    var facet_counts = data.facet_counts;
                    var facet_counts_extra = data['facets'];
                    if (facet_counts_extra == undefined) {
                        facet_counts_extra = {};
                    }
                    // We will have facet_counts iff we didn't specify
                    // "count_only" above.
                    if (facet_counts !== undefined) {
                      angular.forEach(facet_counts.facet_fields,
                          function (item, index) {
                            facets[index] = [];
                            for (var i = 0;
                                 i < facet_counts.facet_fields[index].length;
                                 i += 2) {
                                var fa = {
                                    name: facet_counts.facet_fields[index][i],
                                    result_count:
                                    facet_counts.facet_fields[index][i + 1]
                                };
                                facets[index].push(fa);
                            }
                            // Now see if there is more info in
                            // facet_counts_extra.
                            if (index in facet_counts_extra) {
                                var facet_counts_extra_to_merge =
                                    facet_counts_extra[index].buckets;
                                // Now merge facets_extra into facets[index].
                                facets[index] = mergeFacets(facets[index],
                                                 facet_counts_extra_to_merge);
                            }
                            // Sort facets case-insensitively; they come back
                            // from Solr sorted case-sensitively.
                            facets[index].sort(caseInsensitiveCompare);
                        });
                    }
                    $scope.resources.facets = facets;

                    unpackHighlighting($scope.resources,
                                       tidyResourceFieldNames);
                    postprocessExpandedResults();

                    $scope.resources.page = {
                        cur: ($scope.filters['r_p'] ?
                              parseInt($scope.filters['r_p']) : 1),
                        rows: ($scope.filters['pp'] ?
                               parseInt($scope.filters['pp']) : 10),
                        range: 3,
                        pages: []
                    }
                    $scope.resources.page.end = Math.ceil(
                        $scope.resources.result.response.numFound /
                            $scope.resources.page.rows);
                    for (var x = ($scope.resources.page.cur -
                                  $scope.resources.page.range);
                         x < (($scope.resources.page.cur +
                               $scope.resources.page.range)+1); x++ ) {
                        if (x > 0 && x <= $scope.resources.page.end) {
                            $scope.resources.page.pages.push(x);
                        }
                    }
                    // We changed the model outside AngularJS's notice, so we
                    // need to cause a refresh of the form.
                    $scope.$apply();
                    // Scroll to top, if we've come back/forward to a
                    // page we already set to "manual" scroll
                    // restoration.  This happens going back/forward
                    // to one of "our" pages, except when that's the
                    // _last_ page in the contiguous sequence of
                    // search results pages.
                    if ('scrollRestoration' in history) {
                        // Browser-dependent. Not IE/Edge (yet).
                        if (history.scrollRestoration == 'manual') {
                            scrollToTop();
                        }
                    }
                });
        }

        // Watcher for this controller.  (We say $scope.$watch(...),
        // which means that both the watchExpression and listener
        // parameters are invoked only with this controller's $scope.)
        // Invoked on _each_ $digest cycle, but we only pay attention
        // when there is some sort of search term.
        // Invoked on page load, and whenever the $location.url()
        // changes. That can happen:
        // (a) after $scope.search() sets $location.search($scope.filters),
        //     i.e., after going to next/previous page of results, or
        //     applying/canceling a filter;
        // (b) after use of the browser forward/back button.
        // Note use of special (but arbitrary) string 'Not interested'
        // in both watchExpression and listener, so as to filter
        // out the events generated when navigating to a page
        // other than the search results page.
        $scope.$watch(
            function () {
                if (! $scope.onSearchPage()) {
                    // We're not even on the search results page.
                    //  console.log('Not interested');
                    return 'Not interested';
                }
                return $location.url();
            },
            function (url) {
                // console.log('Watcher invoked with url: ' + url);
                if (url === 'Not interested') {
                    // We're not even on the search results page.
                    return;
                }
                // Ensure we get rid of any open modal popup.  Without
                // this, if you have an open popup, then use the back
                // button, the popup goes away, but the remaining page
                // is still fully overlaid with the dark gray that
                // stops the user interacting with the underlying
                // page.  May need to revisit this if/when we change
                // the default tab to be the resources tab.
                $('.modal').modal('hide');

                // Only do something if there is a url value,
                // i.e., which means there is a search to be performed.
                if (url) {
                    $scope.filters = $location.search();
                    $scope.form.query = $scope.filters.q;
                    // If no active tab specified, set to the default.
                    if (!$scope.filters['activeTab']) {
                        $scope.filters['activeTab'] = defaultActiveTab;
                    }
                    // If no page size specified, set to the default.
                    if (!$scope.filters['pp']) {
                        $scope.filters['pp'] = defaultPageSize;
                    }
                    // Set sort options based on whether or not
                    // there is a search term.
                    if ($scope.filters['q']) {
                        $scope.sortOptions = sortOptionsWhenQueryTerm;
                    } else {
                        $scope.sortOptions = sortOptionsWhenNoQueryTerm;
                    }
                    // Restore the setting of the "Sort by" select.
                    if ($scope.filters['sort']) {
                        $scope.form.sort = $scope.filters['sort'];
                    } else {
                        // As noted in the comments for the sort
                        // option definitions, we rely on a convention
                        // that the default sort option is the first
                        // in the list.
                        $scope.form.sort = $scope.sortOptions[0].id;
                    }
                    // Same for the "Collapse by" select.
                    if ($scope.filters['r_collapse_expand']) {
                        $scope.form.collapse =
                            $scope.filters['r_collapse_expand'];
                    } else {
                        // As noted in the comments for the sort
                        // option definitions, we rely on a convention
                        // that the default sort option is the first
                        // in the list.
                        $scope.form.collapse = $scope.collapseOptions[0].id;
                    }
                    // Prevent "blinking" of results in the case when
                    // using browser back/forward where that switches
                    // between the different tabs. Note: we remove
                    // just the docs of the response for each tab, not
                    // the whole response.  Being this picky helps
                    // prevent blinking of the breadbox and filter
                    // side panel!
                    if ('result' in $scope.vocabularies &&
                        'response' in $scope.vocabularies.result) {
                        delete $scope.vocabularies.result.response.docs;
                    }
                    if ('result' in $scope.resources &&
                        'response' in $scope.resources.result) {
                        delete $scope.resources.result.response.docs;
                    }
                    performVocabulariesSearch();
                    performResourcesSearch();
                }
            });

        /* Utility methods for processing facet value/count data. */

        /** Compare two facet values by name, case-insensitively.
         * Pass this function as the parameter to the sort() function.
         * The two parameters specify their names as a.name and b.name.
         * @param {object} a The first facet value to be compared.
         * @param {object} b The second facet value to be compared.
         * @returns {number} -1 if a < b, 0 if a == b, and 1 if a > b.
         * @memberof searchCtrl
         */
        function caseInsensitiveCompare(a, b) {
            // Case-insensitive sort of full names, based
            // on https://developer.mozilla.org/en-US/docs/Web/
            //    JavaScript/Reference/Global_Objects/Array/sort
            var nameA = a.name.toUpperCase();
            var nameB = b.name.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        };

        /** Compare two facet values by name, case-sensitively.
         * The two parameters specify their names used differently:
         * a.name, but b.val.
         * @param {object} a The first facet value to be compared.
         * @param {object} b The second facet value to be compared.
         * @returns {number} -1 if a < b, 0 if a == b, and 1 if a > b.
         * @memberof searchCtrl
         */
        function caseSensitiveCompare(a, b) {
            // Case-sensitive sort of full names, based
            // on https://developer.mozilla.org/en-US/docs/Web/
            //    JavaScript/Reference/Global_Objects/Array/sort
            var nameA = a.name;
            var nameB = b.val;
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        };

        /** Merge two arrays of facet results.
         * The two arrays must already be sorted.
         * @param {object[]} a The first array of facet values to be merged.
         *   The elements of this array have a name and result_count key/value.
         * @param {object[]} b The second array of facet values to be merged.
         *   The elements of this array have a val and count key/value.
         * @param {object[]} A new array, containing the values of both
         *   a and b. Every array element has the keys name and result_count,
         *   and _may_ also have the key extra_count.
         *   Where an element has come only from b, the value
         *   of result_count is set to 0.
         *   Where an element from a has been combined with
         *   an element of b, the resulting value contains the
         *   result_count value from the element of a and the
         *   extra_count value from the element of b.
         * @memberof searchCtrl
         */
        function mergeFacets(a, b) {
            // The result of the merge.
            var merged = [];
            // Cursor over a.
            var i = 0;
            // Cursor over b.
            var j = 0;
            while (i < a.length) {
                if (j == b.length) {
                    // We reached the end of b, but there is more of a.
                    merged.push(a[i]);
                    i++;
                    continue;
                }
                // There is more of both a and b.
                // Very important!: comparison must be based on
                // an _exact_ (i.e., not case-insensitive) match,
                // otherwise we might "merge" two values that
                // are in fact different and which must be kept separate.
                switch (caseSensitiveCompare(a[i], b[j])) {
                case 0:
                    merged.push({
                        name: a[i].name,
                        result_count: a[i].result_count,
                        extra_count: b[j].count
                    });
                    i++;
                    j++;
                    break;
                case -1:
                    merged.push(a[i]);
                    i++;
                    break;
                case 1:
                    merged.push({
                        name: b[j].val,
                        result_count: 0,
                        extra_count: b[j].count
                    });
                    j++;
                    break;
                default:
                    // Broken!
                    throw new Exception('Defect in caseSensitiveCompare');
                }
            }
            // Now we've processed all of a; append the rest of b.
            while (j < b.length) {
                // There is more of b.
                merged.push({
                        name: b[j].val,
                        result_count: 0,
                        extra_count: b[j].count
                    });
                j++;
            }
            return merged;
        }

        /** Callback for page selection within search results.
         * @param {number} newPage The page number to go to.
         * @memberof searchCtrl
         */
        $scope.goto = function(newPage) {
            if (!$scope.filters['activeTab']) {
                // Oops!
                $scope.filters['v_p'] = ''+newPage;
                $scope.search(true);
            } else {
                switch ($scope.filters['activeTab']) {
                case 'resources':
                    $scope.filters['r_p'] = ''+newPage;
                    $scope.search(true);
                    break;
                case 'vocabularies':
                default:
                    //If default, then oops!
                    $scope.filters['v_p'] = ''+newPage;
                    $scope.search(true);
                }
            }
        }

        /** Get the value to use for the sort filter, based on the
         * current search settings. That value may be undefined,
         * if the other settings have their default values.
         * @memberof searchCtrl
         */
        function sortSettingForCurrentSettings() {
            if ($scope.form.sort == $scope.sortOptions[0].id) {
                // The select has been set to the default value.
                return undefined;
            } else {
                return $scope.form.sort;
            }
        }

        /** Are we on any page _other_ than a search results page?
         * If so, we will do a redirect to the Portal's PHP `search()`
         * controller.
         * _Only_ the search results page has the hidden element
         * with `id="search_app"`.
         * @returns {boolean} True iff we are not already on a search
         *   results page.
         * @memberof searchCtrl
         */
        function notAlreadyOnResultsPage() {
            return document.getElementById('search_app') === null;
        };

        // Below are all the user-initiated callbacks and their
        // helpers.

        /** Are any search filters at all in play?  More precisely:
         * are the current search settings not the "defaults"? This is
         * also the case if the user is not on the first page of
         * results, or if they have changed the sort order, page size,
         * or collapse/expand setting to something other than the
         * default.
         * @returns {boolean} True, if there are any filters set.
         * @memberof searchCtrl
         */
        $scope.anyFilters = function() {
            var found = false;
            if (typeof $scope.filters === "object" &&
                Object.keys($scope.filters).length > 0) {
                angular.forEach(Object.keys($scope.filters),
                                function (key) {
                                    switch (key) {
                                    case 'activeTab':
                                        // Don't care about the active tab.
                                        return;
                                    case 'q':
                                        if ($scope.filters['q'] != "") {
                                            found = true;
                                        }
                                        return;
                                    case 'v_p':
                                        if ($scope.filters['v_p'] != "1") {
                                            found = true;
                                        }
                                        return;
                                    case 'r_p':
                                        if ($scope.filters['r_p'] != "1") {
                                            found = true;
                                        }
                                        return;
                                    case 'r_collapse_expand':
                                        if ($scope.filters['r_collapse_expand']
                                            != "vocabularyIdIri") {
                                            found = true;
                                        }
                                        return;
                                    case 'pp':
                                        if ($scope.filters['pp'] !=
                                            defaultPageSize) {
                                            found = true;
                                        }
                                        return;
                                    case 'sort':
                                        if ($scope.filters['sort'] &&
                                            $scope.filters['sort'] !=
                                            $scope.sortOptions[0].id) {
                                            found = true;
                                        }
                                        return;
                                    default: found = true;
                                    }
                                });
            }
            return found;
        }

        /** Unpack highlighting data contained in the search results
         * and put it into highlighting.
         * @param {object} tab The container for settings for a tab.
         *     Pass in either $scope.vocabularies or $scope.resources.
         * @param {function} tidyFieldNames If specified, a callback
         *     to tidy the field names of results. Invoked on each
         *     set of highlighting results for one document. If not
         *     required, pass in undefined.
         * @memberof searchCtrl
         */
        function unpackHighlighting(tab, tidyFieldNames) {
            tab.highlighting = {};
            if (tab.result.highlighting) {
                angular.forEach(
                    tab.result.highlighting,
                    function(highlights, id) {
                        var result = {};
                        // The highlighting result for a document
                        // can contain duplicate
                        // results for a field, and it can contain "duplicate"
                        // results for a field "xyz" and also "xyz_search"
                        // and also "xyz_phrase". Remove such duplicates.
                        angular.forEach(highlights, function(value, key) {
                            // Depending on the highlight method, value
                            // might be an empty list. (This is the case
                            // for the "unified" method.) If so, skip it.
                            if (value.length == 0) {
                                return;
                            }
                            if (key.endsWith("_sort")) {
                                // Ignore "*_sort" fields.
                                return;
                            }
                            key = key.replace("_search", "").
                                replace("_phrase", "");
                            if (key in result) {
                                result[key] = result[key].concat(value);
                            } else {
                                result[key] = value;
                            }
                        });
                        // Now go through each key/value pair and
                        // ensure the values are unique. Naive quadratic-time
                        // technique based on:
                        // https://stackoverflow.com/questions/1960473/
                        //   get-all-unique-values-in-a-javascript-array-
                        //   remove-duplicates
                        // When we no longer need to support IE, change
                        // this to use the Set constructor:
                        //   result[key] = [...new Set(result[key])];
                        angular.forEach(result, function(value, key) {
                            result[key] = result[key].filter(
                                function(value, index, self) {
                                    return self.indexOf(value) === index;
                                }
                            );
                        });
                        if (tidyFieldNames != undefined) {
                            result = tidyFieldNames(result);
                        }
                        tab.highlighting[id] = result;
                    });
            }
        }

        /** The contents of expanded results of a resource search,
         * repackaged into a more convenient structure for the portal.
         * @memberof searchCtrl
         */
        $scope.repackagedExpanded = {};

        /** Unpack the expanded results of a resource search, and
         * repackage them into a more convenient structure for the portal.
         * @memberof searchCtrl
         */
        function postprocessExpandedResults() {
            $scope.repackagedExpanded = {};
            if (!('expanded' in $scope.resources.result)) {
                // Not even an expanded section; nothing more to do.
                return;
            }
            // The Solr response has an expanded section;
            // it may still be an empty object ({}).
            // We need the main response to get the vocabulary ID of
            // each collapsed result.
            var responseDocs = $scope.resources.result.response.docs;
            var expanded = $scope.resources.result.expanded;
            /* In general, the result should look like this. The
               top-level keys are "collapse Ids", which may be
               either (a) IRIs (b) combined vocabulary Id and IRI.
               $scope.repackagedExpanded = {
                 'http://...': {
                   'vocabulary_id': '27',
                   'same': [
                     { doc for another version of vocabulary_id 27 },
                     { another doc for another version of vocabulary_id 27 },
                     ],
                   'other': {
                     '28' : [
                       { one doc with vocabulary_id 28 },
                       { another doc with vocabulary_id 28 },
                     ]
                   }
                 }
               }
            */
            angular.forEach(responseDocs, function(doc) {
                if (!('iri' in doc)) {
                    // No IRI, so this is a manually-entered top concept.
                    return;
                }
                var iri = doc.iri;
                var vocab_id = doc.vocabulary_id;
                // If we got this far, there must be a value for the
                // collapse_id field.
                var collapse_id = doc.collapse_id;
                if (collapse_id in expanded) {
                    var edocs = expanded[collapse_id].docs;
                    var repackagedDoc = { 'vocabulary_id' : vocab_id };
                    angular.forEach(edocs, function(edoc) {
                        if (edoc.vocabulary_id == vocab_id) {
                            // same
                            if (!('same' in repackagedDoc)) {
                                repackagedDoc.same = [];
                            }
                            repackagedDoc.same.push(edoc);
                        } else {
                            // other
                            if (!('other' in repackagedDoc)) {
                                repackagedDoc.other = {};
                            }
                            if (!(edoc.vocabulary_id in repackagedDoc.other)) {
                                repackagedDoc.other[edoc.vocabulary_id] = [];
                            }
                            repackagedDoc.other[edoc.vocabulary_id].push(edoc);
                        }
                    });
                    $scope.repackagedExpanded[collapse_id] = repackagedDoc;
                }
            });
        }

        /** Does a result have highlighting data?
         * Used in the results template.
         * Different Solr highlight methods give different
         * structures of results. So if you change the highlight
         * method, you need to change this method (and probably
         * make other changes).
         * The current implementation is good for the unified highlighter.
         * @param {object} tab The container for settings for a tab.
         *     Pass in either $scope.vocabularies or $scope.resources.
         * @param id The document id of the search result.
         * @memberof searchCtrl
         */
        $scope.hasHighlight = function (tab, id) {
            return ((id in tab.highlighting) &&
                    (typeof tab.highlighting[id] === "object") &&
                    (Object.keys(tab.highlighting[id]).length > 0));
        };

        /** Get highlighting information for one result.
         * Used in the results template.
         * @param {object} tab The container for settings for a tab.
         *     Pass in either $scope.vocabularies or $scope.resources.
         * @param id The document id of the search result.
         * @memberof searchCtrl
         */
        $scope.getHighlight = function (tab, id) {
            return tab.highlighting[id];
        };

        /** Callback to clear the search query.
         * Used in the results template.
         * @memberof searchCtrl
         */
        $scope.clearQuery = function () {
            $scope.form.query = '';
            $scope.search();
        };

        /** Is a particular filter name applicable to a particular
         * tab?
         * @param filter The name of a filter, e.g., 'v_p'.
         * @param tab The name of a tab; either 'vocabularies' or
         *            'resources'.
         * @returns {boolean} True if the the filter is applicable
         *   to the tab.
         * @memberof searchCtrl
         */
        function isFilterForTab(filter, tab) {
            switch (filter) {
            case 'q':
            case 'pp':
            case 'sort':
                return true;
            default:
                if (filter.startsWith('v_') && tab == 'vocabularies') {
                    return true;
                }
                if (filter.startsWith('r_') && tab == 'resources') {
                    return true;
                }
                return false;
            }
        }

        /** Callback to toggle one filter.
         * Used in the results template.
         * @param {string} type The name of the facet on which to
         *   filter, for example, `'subject_labels'`, `'publisher'`.
         * @param {string} value The value of the facet to use as a
         *   filter. For now, all invocations of this method specify
         *   the value `facet.name`.
         * @param {boolean} [execute=false] Whether to execute the
         *   search. For now, all invocations of this method
         *   pass in the value `true`.
         * @memberof searchCtrl
         */
        $scope.toggleFilter = function (type, value, execute) {
            if ($scope.filters[type]) {
                if ($scope.filters[type] == value) {
                    $scope.clearFilter(type, value);
                } else {
                    if ($scope.filters[type].indexOf(value) == -1) {
                        $scope.addFilter(type, value);
                    } else {
                        $scope.clearFilter(type, value);
                    }
                }
            } else {
                $scope.addFilter(type, value);
            }
            if (!$scope.filters['activeTab']) {
                // Oops!
                $scope.filters['v_p'] = 1;
            } else {
                switch ($scope.filters['activeTab']) {
                case 'resources':
                    $scope.filters['r_p'] = 1;
                    break;
                case 'vocabularies':
                default:
                    //If default, then oops!
                    $scope.filters['v_p'] = 1;
                }
            }
            if (execute) {
                $scope.search();
            }
        };

        /** Callback to toggle the visibility of additional filter
         * values beyond the first n (where, currently, the value of n
         * used in the template is 8).  Used in the results template.
         * @param {string} facet_type The name of the facet for which
         *   the facet values are to be hidden or shown.
         * @memberof searchCtrl
         */
        $scope.toggleFacet = function (facet_type) {
            $('#more'+facet_type).slideToggle();
            //$('#link'+facet_type).toggle();
            // The slide toggle does not happen instantaneously,
            // and the visibility of the "View More..." text
            // depends on the visibility of the "#more..."
            // element. So after a suitable timeout,
            // force a recalculation of the visibility of
            // the "View More..." text.
            $timeout(function() {
                // A no-op is enough.
            }, 500);
        };

        /** Add a filter to the search terms.
         * Used in the results template.
         * @param {string} type The name of the facet on which to
         *   filter, for example, `'subject_labels'`, `'publisher'`.
         * @param {string} value The value of the facet to use as a
         *   filter. For now, all invocations of this method specify
         *   the value `facet.name`.
         * @memberof searchCtrl
         */
        $scope.addFilter = function (type, value) {
            if ($scope.filters[type]) {
                // filters[type] is present.
                if (typeof $scope.filters[type] == 'string') {
                    // filters[type] is just one string.
                    var old = $scope.filters[type];
                    $scope.filters[type] = [];
                    $scope.filters[type].push(old);
                    $scope.filters[type].push(value);
                } else if (typeof $scope.filters[type] == 'object') {
                    // filters[type] is an array containing more than
                    // one string.
                    $scope.filters[type].push(value);
                }
            } else {
                // filters[type] is not present.
                $scope.filters[type] = value;
            }
        };

        /** Remove one filter from the search terms.
         * Used in the results template.
         * @param {string} type The name of the facet on which to
         *   filter, for example, `'subject_labels'`, `'publisher'`.
         * @param {string} value The value of the facet to use as a
         *   filter. For now, all invocations of this method specify
         *   the value `facet.name`.
         * @param {boolean} [execute=false] Whether to execute the
         *   search. For now, all invocations of this method
         *   don't provide a value for this parameter.
         * @memberof searchCtrl
         */
        $scope.clearFilter = function (type, value, execute) {
            if (typeof $scope.filters[type] != 'object') {
                // filters[type] is a string; we remove the
                // key completely from filters.
                delete $scope.filters[type];
            } else if (typeof $scope.filters[type] == 'object') {
                // filters[type] is an array containing more than one
                // string; remove just this one value.
                var index = $scope.filters[type].indexOf(value);
                $scope.filters[type].splice(index, 1);
                // And remove the key completely if we now have
                // an empty array. This means $scope.anyFilters()
                // can be written more easily (it doesn't have to
                // check if arrays are empty).
                if ($scope.filters[type].length == 0) {
                    delete $scope.filters[type];
                }
            }
            if (execute) {
                $scope.search();
            }
        };

        /** Is there currently a filter in place for a specified facet
         * and value?  Used in the results template.
         * @param {string} type The name of the facet being checked,
         *   for example, `'subject_labels'`, `'publisher'`.
         * @param {string} value The value of the facet to check to
         *   see if is being used as a filter. For now, all
         *   invocations of this method specify the value
         *   `facet.name`.
         * @returns {boolean} True if there is currently a filter
         *   being applied for this facet and value.
         * @memberof searchCtrl
         */
        $scope.isFacet = function (type, value) {
            if ($scope.filters[type]) {
                if (typeof $scope.filters[type] == 'string' &&
                    $scope.filters[type] == value) {
                    return true;
                } else if (typeof $scope.filters[type] == 'object') {
                    return $scope.filters[type].indexOf(value) != -1;
                }
                return false;
            }
            return false;
        };

        /** In the case that there are more values for a facet than
         * the initial display limit (currently, 8), is it the case
         * that all possible values are currently being shown (i.e.,
         * because the user has clicked the "More..." button)?  Used
         * in the results template to show/hide the "More..." and
         * "Less..." buttons.
         * @param {string} type The name of the facet being checked,
         *   for example, `'subject_labels'`, `'publisher'`.
         * @returns {boolean} True if all values for a facet are
         *   currently being displayed.
         * @memberof searchCtrl
         */
        $scope.isMoreVisible = function (type) {
            return $("#more" + type ).is(":visible");
        }

        /** Get a "human-readable" version of the collapse setting.
         * If there is no current setting, return the "human-readable"
         * of the default setting.
         * If we can't give one (oops, that "shouldn't" happen),
         * return the id of the collapse setting.
         * @returns {string} The "human-readable" version of the collapse
         *   setting, or its id, if we don't have one.
         * @memberof searchCtrl
         */
        $scope.collapseOptionPretty = function () {
            if (!('collapse' in $scope.form) ||
                $scope.form.collapse == undefined) {
                return $scope.collapseOptions[0].name;
            }
            var entity = $scope.collapseOptions.find(function(o) {
                return o.id === $scope.form.collapse;
            });
            if (entity == undefined) {
                return $scope.collapseOptions[0].name;
            }
            return entity.name;
        }

        /** Callback to reset the collapse option.
         * @memberof searchCtrl
         */
        $scope.resetCollapse = function () {
            $scope.filters['r_collapse_expand'] = $scope.collapseOptions[0].id;
            $scope.form.collapse = $scope.collapseOptions[0].id;
            $scope.search();
        };

        /** Get a "human-readable" version of an RDF type for use in
         * faceting.
         * If we can't give one (oops, that "shouldn't" happen),
         * return the IRI of the RDF type.
         * @param {string} iri The IRI of the RDF type.
         * @returns {string} The "human-readable" version of the type,
         *   or the IRI, if we don't have one.
         * @memberof searchCtrl
         */
        $scope.rdfTypePretty = function (iri) {
            if (iri in rdfTypesHumanReadable) {
                return rdfTypesHumanReadable[iri];
            }
            return iri;
        }

        /** Get a "human-readable" version of an RDF type for use in
         * a "lozenge" for a search result.
         * If we can't give one (oops, that "shouldn't" happen),
         * return the IRI of the RDF type.
         * The difference between this method and rdfTypePretty()
         * is that this method gives a different answer for the
         * special iri "NONE".
         * @param {string} iri The IRI of the RDF type.
         * @returns {string} The "human-readable" version of the type,
         *   or the IRI, if we don't have one.
         * @memberof searchCtrl
         */
        $scope.rdfTypePrettyForLozenge = function (iri) {
            if (iri == 'NONE') {
                return 'Manually-entered';
            }
            if (iri in rdfTypesHumanReadable) {
                return rdfTypesHumanReadable[iri];
            }
            return iri;
        }

        /** Get a "human-readable" version of a version status.
         * @param {string} status The version status, as returned from
         *   Solr.
         * @returns {string} The "human-readable" version of the version
         *   status.
         * @memberof searchCtrl
         */
        $scope.versionStatusPretty = function (status) {
            return status.toLowerCase();
        }

        /** Callback invoked when the user has clicked a tab heading.
         * Note: this is invoked irrespective of whether the tab is
         * already the active tab.
         * @param {string} newTab The selected tab, either 'vocabularies'
         *   or 'resources'.
         * @memberof searchCtrl
         */
        $scope.tabChanged = function (newTab) {
            // console.log('tabChanged called with tab: ' + newTab);
            if (newTab == $scope.filters['activeTab']) {
                // console.log('tabChanged did nothing');
                return;
            }
            if ('result' in $scope.vocabularies
                && 'response' in $scope.vocabularies.result) {
                $scope.vocabularies.result.response.docs = [];
            }
            if ('result' in $scope.resources
                && 'response' in $scope.resources.result) {
                $scope.resources.result.response.docs = [];
            }
            $scope.filters.activeTab = newTab;
            scrollToTop();
            $location.search($scope.filters);
        }

        // Possible future work, when we support multilingual
        // resource search results better.
        // /**
        //  * @param {object} doc The Solr document to be analysed.
        //  * @param {string} fieldName The base field name, e.g.,
        //  *   'skos_prefLabel'.
        //  * @memberof searchCtrl
        //  */
        // $scope.getFieldValuesForField = function(doc, fieldName) {
        //     // In the following, we use a running example of
        //     // fieldName=='skos_prefLabel'.
        //     // There are three possibilities:
        //     // (1) doc contains a field skos_prefLabel_all.
        //     //
        //     // (2) doc _doesn't_ contain a field skos_prefLabel_all,
        //     // (3) doc _doesn't_ contain any fields skos_prefLabel*.

        // }

        /** Callback invoked when the user clicks a
         * "View resource details" button, to have the Portal log
         * the fact that the user did that.
         * @param {object} doc The Solr document for the resource
         *   for which the user has requested to view details.
         * @memberof searchCtrl
         */
        $scope.logViewResourceDetails = function(doc) {
            var params = {
                'vocab_id': doc.vocabulary_id,
                'vocab_owner': doc.owner,
                'vocab_title': doc.vocabulary_title,
                'version_id': doc.version_id,
                'version_status': doc.status.toLowerCase(),
                'version_title': doc.version_title,
                'resource_iri': doc.iri,
                'resource_title': doc.title
            };
            // $.param does percent-encoding for us.
            var portal_callback = base_url + 'vocabs/logResourceDetails?' +
                $.param(params);
            $.ajax(portal_callback);
        }

        /** Callback invoked when the user clicks a
         * "View resource as linked data" button, to have the Portal log
         * the fact that the user did that.
         * @param {object} doc The Solr document for the resource
         *   for which the user has requested to view details.
         * @memberof searchCtrl
         */
        $scope.logViewInLDA = function(doc) {
            var params = {
                'vocab_id': doc.vocabulary_id,
                'vocab_owner': doc.owner,
                'vocab_title': doc.vocabulary_title,
                'version_id': doc.version_id,
                'version_status': doc.status.toLowerCase(),
                'version_title': doc.version_title,
                'ap_url': doc.sissvoc_endpoint + '/concept',
                'ap_type': 'sissvoc',
                'resource_iri': doc.iri,
                'resource_title': doc.title,
                'referrer_type': 'search'
            };
            // $.param does percent-encoding for us.
            var portal_callback = base_url + 'vocabs/logAccessPoint?' +
                $.param(params);
            $.ajax(portal_callback);
        }

        /** Determine if we are on the page https://.../search
         * using the location URL.
         * @returns {boolean} True iff the location's URL says we are
         *   on the search page.
         * @memberof searchCtrl
         */
        $scope.onSearchPage = function () {
            // Cope with both the canonical path "/vocabs/search"
            // and the shortcut "/search".
            var urlAfterBase = $location.absUrl().slice(base_url.length);
            return urlAfterBase.startsWith('vocabs/search') ||
                urlAfterBase.startsWith('search');
        }

        // Deal with one specific case here: we've come to the page
        // https://.../search directly, and there are no filters in
        // the URL. In that case, the watcher defined above wouldn't
        // do anything without a little help. We call $scope.search()
        // to set the filters to do the default search.
        if ($scope.onSearchPage()) {
            // This is the search page. Now see if there
            // were no filters provided in the URL.
            // (See the initialization of $scope.filters at
            // the top of this file.)
            if (typeof $scope.filters === "object" &&
                Object.keys($scope.filters).length === 0) {
                $scope.search();
            }
        }
    }

})();
