; function OptionSelector(options) {
    "use strict";
    var _self = this;

    if (!options.lists || !Array.isArray(options.lists) || !options.lists.length) {
        throw "There must be atleast one list defined in options.";
    }
  
    var defaults = {
        lists: [],
        data: null,
        itemDataAttribute: "index",
        defaultListIndex: 0,
        defaultIndex: -1,
        visible: true,
        enabled: true,
        displayProperty: "inline-block",
        rootClass: "root-selector",
        rootListClass: "root-selector-list",
        rootListItemClass: "root-selector-list-item",
        listClass: "selector-list",
        listItemClass: "selector-list-item",
        selectedListItemClass: "selector-list-selected-item",
        mainListTemplate: "<ul></ul>",
        mainListItemTemplate: "<li></li>",
        listTemplate: "<ul></ul>",
        itemTemplate: "<li></li>",
        events: {
            onClicked: function (e) {},
            onSelectionChanged: function (e) {},
            onVisibilityChanged: function (e) {}
        },
        extensions: {
            formatter: function (element) {}
        }
    };

    var local = {
        visible: true,
        enabled: true,
        settings: null
    };

    //Settings
    local.settings = $.extend(true, {}, defaults, options);
    local.visible = local.settings.visible;
    local.enabled = local.settings.enabled;

    //Properties 
    var _data = null;
    var _selectedIndexes = [];
    var _uiRoot = $('<div></div>').addClass(local.settings.rootClass).css({ display: (local.visible ? local.displayProperty : 'none') });
    var _uiRootList = $(local.settings.mainListTemplate).addClass(local.settings.rootListClass).appendTo(_uiRoot);
    var _uiLists = [];

    $.each(local.settings.lists, function (index, listInfo) {
        _selectedIndexes[index] = -1;
        var $list = $(local.settings.listTemplate).addClass(local.settings.listClass).addClass(listInfo.listClass);
        var $rootItem = $(local.settings.mainListItemTemplate).addClass(local.settings.rootListItemClass).append($list);
        _uiRootList.append($rootItem).addClass(local.settings.rootListClass);
        _uiLists.push($list);
    });

    var _activeListIndex = (local.settings.defaultListIndex > -1) ? local.settings.defaultListIndex : 0;

    ////////////////////////////////////////
    // PUBLIC FUNCTIONS
    ////////////////////////////////////////

    // returns top most element of the plugin
    this.getUIRoot = function () {
        return _uiRoot;
    }

    // returns ui lists
    this.getUILists = function () {
        return _uiLists;
    }

    this.getEnabled = function () {
        return local.enabled;
    }

    this.setEnabled = function (enabled) {
      local.enabled = !!enabled;
    }

    // returns data blob
    this.getData = function () {
        return _data;
    }

    this.setLoading = function (isLoading) {
        if (isLoading) {

        } else {

        }
    }

    // creates list items by removing previous.
    this.setData = function (data) {
        this.clear();

        if (data && Array.isArray(data) && data.length == _uiLists.length) {
            _data = data;
            draw();
            this.setSelectedIndex();
        }
    }

    // returns number of lists.
    this.getListCount = function () {
        return _uiLists.length;
    }

    // returns number of items in the list by list index.
    this.getListItemCount = function (index) {
        if (_uiLists[index]) {
            return _uiLists[index].children().length;
        }
    }

    // changes visibility of the plugin.
    this.setVisible = function (visible) {
        if (local.enabled || local.visible) {
            this.setVisibleInternal(visible);
        }
    }

    this.setVisibleInternal = function (visible) {
        var isChanged = false;

        if (visible && !local.visible) {
            _uiRoot.css('display', local.settings.displayProperty);
            local.visible = true;
            isChanged = true;
        }
        else if (!visible && local.visible) {
            _uiRoot.css('display', 'none');
            local.visible = false;
            isChanged = true;
        }

        if (!visible) {
            this.clear();
        }

        if (isChanged && local.settings.events.onVisibilityChanged != null && local.enabled) {
            local.settings.events.onVisibilityChanged.call(this, local.visible);
        }
    }

    // retuns flag whether the conrol is visible or not.
    this.getVisible = function () {
        return local.visible;
    }

    // returns display type (block/none).
    this.getDisplayType = function () {
        return local.settings.displayProperty;
    }

    // clears the list items.
    this.clear = function () {
        _data = null;
        $.each(_uiLists, function (index, list) {
            list.empty();
        });
        $.each(_selectedIndexes, function (index, item) { item = -1 });
        _activeListIndex = (local.settings.defaultListIndex > -1) ? local.settings.defaultListIndex : 0;
    }

    // returns selected data item.
    this.getSelectedDataItem = function () {
        if (_data && _activeListIndex > -1 && _selectedIndexes[_activeListIndex] > -1) {
            return _data[_activeListIndex][_selectedIndexes[_activeListIndex]];
        }
        return null;
    }

    // returns selected item index.
    this.getSelectedIndex = function () {
        return (_data && _activeListIndex > -1 && _selectedIndexes[_activeListIndex] > -1) ? {
            listIndex: _activeListIndex,
            listItemIndex: _selectedIndexes[_activeListIndex]
        } : null;
    }

    // sets selected list item.
    this.setSelectedIndex = function (itemIndex, listIndex) {

        if (listIndex == _activeListIndex && itemIndex == _selectedIndexes[_activeListIndex]) {
            return;
        }

        var x = (typeof listIndex != 'number') ? _activeListIndex : listIndex;
        var y = (typeof itemIndex != 'number') ? local.settings.defaultIndex : itemIndex;

        if (x > -1 && x < _uiLists.length) {
            if (y > -1 && y < _uiLists[x].children().length) {

                $.each(_uiLists, function (j) {
                    var $children = _uiLists[j].children();
                    var selectedClass = local.settings.lists[j].selectedListItemClass;

                    $children.each(function (i, item) {
                        if (j != x) {
                            decorateItem(selectedClass, $(item), -1, i);
                        }
                        else {
                            decorateItem(selectedClass, $(item), y, i);
                        }
                    });

                    _activeListIndex = x;
                    _selectedIndexes[_activeListIndex] = y;

                });

                if (typeof itemIndex == 'number' && 
                        local.settings.events.onSelectionChanged != null && 
                        local.enabled) {
                    local.settings.events.onSelectionChanged.call(this, 
                        { activeListIndex: _activeListIndex, activeListItemIndex: y });
                }
            }
        }
    }

    ////////////////////////////////////////
    // PRIVATE FUNCTIONS
    ////////////////////////////////////////

    //raised when a list item is clicked
    var onClicked = function (e) {
        var $element = $(e.target);
        var $listItem = $element.closest('.' + local.settings.listItemClass);
        var selectedListIndex = _activeListIndex;

        $.each(_uiLists, function (i, $list) {
            if ($list.is($listItem.parent())) {
                selectedListIndex = i;
            }
        });

        this.setSelectedIndex(parseInt($listItem.data(local.settings.itemDataAttribute), 10), selectedListIndex);

        if (local.settings.events.onClicked != null && local.enabled) {
            local.settings.events.onClicked.call(this, $listItem);
        }
    }

    //Private Static - creates list items using data property
    // To use complete data item structure such as { name: 'anyname', data: 'anyhash' } change this method.
    // To use elements other than list change this method.
    var draw = function () {
        if (_data) {
            $.each(local.settings.lists, function (j, listInfo) {
                var $list = _uiLists[j];
                if (_data[j]) {
                    $.each(_data[j], function (i, dataItem) {
                        var $listItem = $(local.settings.itemTemplate)
                            .attr('data-' + local.settings.itemDataAttribute, i)
                            .addClass(local.settings.listItemClass)
                            .addClass(listInfo.listItemClass);

                        if (local.settings.extensions.formatter) {
                            $listItem.append(local.settings.extensions.formatter(dataItem, $listItem));
                        }
                        else {
                            $listItem.text(dataItem);
                        }

                        decorateItem(listInfo.selectedListItemClass, $listItem, -1, i);
                        $list.append($listItem);
                    });
                }
            });
        }
    }

    // decorates item by adding/removing css classes
    var decorateItem = function (cssClass, item, selIndex, currIndex) {
        if (selIndex != currIndex) {
            item.removeClass(local.settings.selectedListItemClass).removeClass(cssClass);
        }
        else if (!item.hasClass(cssClass)) {
            item.addClass(local.settings.selectedListItemClass).addClass(cssClass);
        }
    }

    //changes function scope so that 'this' could point to source object
    var contextBinder = function (func, scope) {
        if (func.bind) {
            return func.bind(scope);
        } else {
            return function () {
                func.apply(scope, arguments);
            };
        }
    };

    // binds all list items to onClicked event in one go.
    // If we change the ui element from List to something else we need to handle the event binding below.
    $.each(_uiLists, function (index, list) {
        list.on('click', '> *', contextBinder(onClicked, _self));
    });

    if (local.settings.data) {
        this.setData(local.settings.data);
    }

    if (local.settings.visible) {
        _uiRoot.css('display', local.settings.displayProperty);
    } else {
        _uiRoot.css('display', 'none;');
    }
}
