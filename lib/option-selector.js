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
        css: {
            hideRootClass: "root-selector-hide",
            rootClass: "root-selector",
            rootListClass: "root-selector-list",
            rootListItemClass: "root-selector-list-item",
            listClass: "selector-list",
            listItemClass: "selector-list-item",
            selectedListItemClass: "selector-list-selected-item",
        },
        mainListTemplate: "<ul></ul>",
        mainListItemTemplate: "<li></li>",
        listTemplate: "<ul></ul>",
        itemTemplate: "<li></li>",
        events: {
            onClicked: function (e) { },
            onSelectionChanged: function (e) { },
            onVisibilityChanged: function (e) { }
        },
        extensions: {
            formatter: function (element) { }
        }
    };

    var local = {
        visible: true,
        enabled: true,
        settings: null,
        data: null,
        selectedIndexes: [],
        uiRoot: null,
        uiRootList: null,
        uiLists: [],
        activeListIndex: 0
    };

    //Settings
    local.settings = $.extend(true, {}, defaults, options);
    local.visible = local.settings.visible;
    local.enabled = local.settings.enabled;
    local.uiRoot = $('<div></div>').addClass(local.settings.css.rootClass);
    local.uiRootList = $(local.settings.mainListTemplate).addClass(local.settings.css.rootListClass).appendTo(local.uiRoot);

    $.each(local.settings.lists, function (index, listInfo) {
        local.selectedIndexes[index] = -1;
        var $list = $(local.settings.listTemplate).addClass(local.settings.css.listClass).addClass(listInfo.listClass);
        var $rootItem = $(local.settings.mainListItemTemplate).addClass(local.settings.css.rootListItemClass).append($list);
        local.uiRootList.append($rootItem).addClass(local.settings.css.rootListClass);
        local.uiLists.push($list);
    });

    local.activeListIndex = (local.settings.defaultListIndex > -1) ? local.settings.defaultListIndex : 0;

    ////////////////////////////////////////
    // PUBLIC FUNCTIONS
    ////////////////////////////////////////

    // returns top most element of the plugin
    this.getUIRoot = function () {
        return local.uiRoot;
    }

    // returns ui lists
    this.getUILists = function () {
        return local.uiLists;
    }

    this.getEnabled = function () {
        return local.enabled;
    }

    this.setEnabled = function (enabled) {
        local.enabled = !!enabled;
    }

    // returns data blob
    this.getData = function () {
        return local.data;
    }

    // creates list items by removing previous.
    this.setData = function (data) {
        this.clear();

        if (data && Array.isArray(data) && data.length == local.uiLists.length) {
            local.data = data;
            draw();
            this.setSelectedIndex();
        }
    }

    // returns number of lists.
    this.getListCount = function () {
        return local.uiLists.length;
    }

    // returns number of items in the list by list index.
    this.getListItemCount = function (index) {
        if (local.uiLists[index]) {
            return local.uiLists[index].children().length;
        }
    }

    // retuns flag whether the conrol is visible or not.
    this.getVisible = function () {
        return local.visible;
    }

    // changes visibility of the plugin.
    this.setVisible = function (visible) {
        var isChanged = false;

        if (visible && !local.visible) {
            local.uiRoot.removeClass(local.settings.css.hideRootClass);
            local.visible = true;
            isChanged = true;
        }
        else if (!visible && local.visible) {
            local.uiRoot.addClass(local.settings.css.hideRootClass);
            local.visible = false;
            isChanged = true;
        }

        if (isChanged && local.settings.events.onVisibilityChanged != null && local.enabled) {
            local.settings.events.onVisibilityChanged.call(this, local.visible);
        }
    }

    // clears the list items.
    this.clear = function () {
        local.data = null;
        $.each(local.uiLists, function (index, list) {
            list.empty();
        });
        $.each(local.selectedIndexes, function (index, item) { item = -1 });
        local.activeListIndex = (local.settings.defaultListIndex > -1) ? local.settings.defaultListIndex : 0;
    }

    // returns selected data item.
    this.getSelectedDataItem = function () {
        if (local.data && local.activeListIndex > -1 && local.selectedIndexes[local.activeListIndex] > -1) {
            return local.data[local.activeListIndex][local.selectedIndexes[local.activeListIndex]];
        }
        return null;
    }

    // returns selected item index.
    this.getSelectedIndex = function () {
        return (local.data && local.activeListIndex > -1 && local.selectedIndexes[local.activeListIndex] > -1) ? {
            listIndex: local.activeListIndex,
            listItemIndex: local.selectedIndexes[local.activeListIndex]
        } : null;
    }

    // sets selected list item.
    this.setSelectedIndex = function (itemIndex, listIndex) {

        if (listIndex == local.activeListIndex && itemIndex == local.selectedIndexes[local.activeListIndex]) {
            return;
        }

        var x = (typeof listIndex != 'number') ? local.activeListIndex : listIndex;
        var y = (typeof itemIndex != 'number') ? local.settings.defaultIndex : itemIndex;

        if (x > -1 && x < local.uiLists.length) {
            if (y > -1 && y < local.uiLists[x].children().length) {

                $.each(local.uiLists, function (j) {
                    var $children = local.uiLists[j].children();
                    var selectedClass = local.settings.lists[j].selectedListItemClass;

                    $children.each(function (i, item) {
                        if (j != x) {
                            decorateItem(selectedClass, $(item), -1, i);
                        }
                        else {
                            decorateItem(selectedClass, $(item), y, i);
                        }
                    });

                    local.activeListIndex = x;
                    local.selectedIndexes[local.activeListIndex] = y;

                });

                if (typeof itemIndex == 'number' &&
                    local.settings.events.onSelectionChanged != null &&
                    local.enabled) {
                    local.settings.events.onSelectionChanged.call(this,
                        { activeListIndex: local.activeListIndex, activeListItemIndex: y });
                }
            }
        }
    }

    ////////////////////////////////////////
    // PRIVATE FUNCTIONS
    ////////////////////////////////////////

    //raised when a list item is clicked
    var onClicked = function (e) {
        if (local.enabled) {
            var $element = $(e.target);
            var $listItem = $element.closest('.' + local.settings.css.listItemClass);
            var selectedListIndex = local.activeListIndex;

            $.each(local.uiLists, function (i, $list) {
                if ($list.is($listItem.parent())) {
                    selectedListIndex = i;
                }
            });

            this.setSelectedIndex(parseInt($listItem.data(local.settings.itemDataAttribute), 10), selectedListIndex);

            if (local.settings.events.onClicked != null) {
                local.settings.events.onClicked.call(this, $listItem);
            }
        }
    }

    //Private Static - creates list items using data property
    // To use complete data item structure such as { name: 'anyname', data: 'anyhash' } change this method.
    // To use elements other than list change this method.
    var draw = function () {
        if (local.data) {
            $.each(local.settings.lists, function (j, listInfo) {
                var $list = local.uiLists[j];
                if (local.data[j]) {
                    $.each(local.data[j], function (i, dataItem) {
                        var $listItem = $(local.settings.itemTemplate)
                            .data(local.settings.itemDataAttribute, i)
                            .addClass(local.settings.css.listItemClass)
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
            item.removeClass(local.settings.css.selectedListItemClass).removeClass(cssClass);
        }
        else if (!item.hasClass(cssClass)) {
            item.addClass(local.settings.css.selectedListItemClass).addClass(cssClass);
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
    $.each(local.uiLists, function (index, list) {
        list.on('click', '> *', contextBinder(onClicked, _self));
    });

    if (local.settings.data) {
        this.setData(local.settings.data);
    }

    if (!local.settings.visible) {
        local.uiRoot.addClass(local.settings.css.hideRootClass);
    }
}
