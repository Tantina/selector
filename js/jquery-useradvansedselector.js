
(function ($, win, doc, body) {

    var useradvancedSelector = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.useradvancedSelector.defaults, options);

        this.init();
    };

    useradvancedSelector.prototype = $.extend({}, $.fn.advancedSelector.Constructor.prototype, {
        constructor: useradvancedSelector,
        initCreationBlock: function (data) {
            var that = this,
                 opts = {},
                 itemsSimpleSelect = [],
                 groups = data.groups;

            for (var i = 0, length = groups.length; i < length; i++) {
                itemsSimpleSelect.push(
                    {
                        title: groups[i].title,
                        id: groups[i].id
                    }
                );
            }

            opts.newoptions =
                    [
                        { title: "Type", type: "choice", tag: "type", items: [
                                        { type: "user", title: "User" },
                                        { type: "visitor", title: "Visitor" }
                            ]
                        },
                        { title: "First name", type: "input", tag: "first-name" },
                        { title: "Last name", type: "input", tag: "last-name" },
                        { title: "Email", type: "input", tag: "email" },
                        { title: "Group", type: "select", tag: "group" }
                    ],
            opts.newbtn = "Invite";

            that.displayAddItemBlock.call(that, opts);
            that.initDataSimpleSelector.call(that, { tag: "group", items: itemsSimpleSelect });

            var $addPanel = that.$advancedSelector.find(".advanced-selector-add-new-block");

            if (!that.options.withGuests) {
                $addPanel.find(".type").hide();
            }
        },

        initAdvSelectorData: function () {
        var that = this;
        $.getJSON("js/users.json", function (response) {
                
                var data = response;
                if (!that.options.withGuests) {
                    data = $.grep(data, function (el) { return el.isVisitor == false });
                }
                that.rewriteObjectItem.call(that, data);
            });  
        },

        initAdvSelectorGroupsData: function () {
            var that = this;
            $.getJSON("js/groups.json", function (response) {
                
                var data = response;

                that.rewriteObjectGroup.call(that, data);
                if (that.options.isAdmin) {
                    var groups = [],
                        dataIds = [];
                    that.$groupsListSelector.find(".advanced-selector-list li").hide();
                    that.items.forEach(function (e) {
                        groups = groups.concat(e.groups).unique();
                    });

                    groups.forEach(function (elem) {
                        that.$groupsListSelector.find(".advanced-selector-list li[data-id=" + elem.id + "]").show();
                    });
                }
            });  
        },

        rewriteObjectItem: function (data) {
            var that = this;
            that.items = [];

            for (var i = 0, length = data.length; i < length; i++) {
                var newObj = {};
                newObj.title = data[i].displayName || data[i].title;
                newObj.id = data[i].id;
                newObj.isVisitor = data[i].isVisitor;
                if (data[i].hasOwnProperty("isPending")) {
                    newObj.status = data[i].isPending ? "pending" : "";
                }
                if (data[i].hasOwnProperty("groups")) {
                    newObj.groups = data[i].groups;
                    if (data[i].groups && data[i].groups.length && !data[i].groups[0].id) {
                        newObj.groups.map(function (el) {
                            el.id = el.ID;
                        })
                    }
                }
                that.items.push(newObj);
            }

            that.items = that.items.sort(SortData);
            that.$element.data('items', that.items);
            that.showItemsListAdvSelector.call(that);
        },

        createNewItemFn: function () {
            var that = this,
                $addPanel = that.$advancedSelector.find(".advanced-selector-add-new-block"),
                $btn = $addPanel.find(".advanced-selector-btn-add"),
                isError,
                isVisitor;

            if (that.options.withGuests) {
                switch ($addPanel.find(".type select").val()) {
                    case "user":
                        isVisitor = false;
                        break;
                    case "visitor":
                        isVisitor = true;
                        break;
                };
            } else {
                isVisitor = false;
            }

            var $department = $addPanel.find(".group input");
                departmentId = $department.attr("data-id");
            var newUser = {
                isVisitor: isVisitor,
                firstname: $addPanel.find(".first-name input").val().trim(),
                lastname: $addPanel.find(".last-name input").val().trim(),
                email: $addPanel.find(".email input").val().trim(),
                department: (departmentId && departmentId.length) ? [departmentId] : []
            };

            if (!newUser.firstname) {
                that.showErrorField.call(that, { field: $addPanel.find(".first-name"), error: "Empty First Name" });
                isError = true;
            }
            if (!newUser.lastname) {
                that.showErrorField.call(that, { field: $addPanel.find(".last-name"), error: "Empty Last Name" });
                isError = true;
            }
            if (!newUser.email) {
                that.showErrorField.call(that, { field: $addPanel.find(".email"), error: "Empty email" });
                isError = true;
            }
            if (newUser.firstname && newUser.firstname.length > 64) {
                that.showErrorField.call(that, { field: $addPanel.find(".first-name"), error: "MesLongField64" });
                isError = true;
            }
            if (newUser.lastname && newUser.lastname.length > 64) {
                that.showErrorField.call(that, { field: $addPanel.find(".last-name"), error: "MesLongField64" });
                isError = true;
            }
            if (!isValidEmail(newUser.email)) {
                that.showErrorField.call(that, { field: $addPanel.find(".email"), error: "Not Correct Email" });
                isError = true;
            }
            if (!newUser.department.length && $addPanel.find(".group input").val()) {
                that.showErrorField.call(that, { field: $addPanel.find(".group"), error: "Group Not Exists" });
                isError = true;
            }

            if (isError) {
                $addPanel.find(".error input").first().focus();
                return;
            }
                            var newuser = {
                                id: guid(),
                                title: newUser.firstname + newUser.lastname,
                                isVisitor: newUser.isVisitor,
                                status: "pending",
                                groups: [{
                                    id:  $department.attr("data-id"),
                                    title:  $department.val()
                                }]
                            };
                            toastr.success(newuser.title + "was created");
                            that.actionsAfterCreateItem.call(that, { newitem: newuser, response: newuser, nameProperty: "groups" });
    
        },

        addNewItemObj: function (item) {
            var newuser = {
                id: item.id,
                title: item.displayName,
                isVisitor: item.isVisitor,
                status: item.isPending ? "pending" : "",
                groups: []
            };
            this.actionsAfterCreateItem.call(this, { newitem: newuser, response: item, nameProperty: "groups" });
        },


    });

    $.fn.useradvancedSelector = function (option, val) {
        var selfargs = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
            var $this = $(this),
                data = $this.data('useradvancedSelector'),
                options = $.extend({},
                        $.fn.useradvancedSelector.defaults,
                        $this.data(),
                        typeof option == 'object' && option);
            if (!data) $this.data('useradvancedSelector', (data = new useradvancedSelector(this, options)));
            if (typeof option == 'string') data[option].apply(data, selfargs);
        });
  }
    $.fn.useradvancedSelector.defaults = $.extend({}, $.fn.advancedSelector.defaults, {
        showme: true,
        addtext: "Add user",
        noresults: "no result",
        noitems: "no users",
        nogroups: "no groups",
        emptylist: "emprty list",
        isAdmin: false,
        withGuests: true,
        isInitializeItems: true
    });


})(jQuery, window, document, document.body);