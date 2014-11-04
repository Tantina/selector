﻿
(function ($, win, doc, body) {
    var projectadvancedSelector = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.projectadvancedSelector.defaults, options);

        this.init();
    };

    projectadvancedSelector.prototype = $.extend({}, $.fn.advancedSelector.Constructor.prototype, {
        constructor: projectadvancedSelector,
        initCreationBlock: function (data) {
            var that = this,
                opts = {},
                itemsSimpleSelect = [];

            opts.newoptions = [
                      { title: ASC.Resources.Master.Resource.SelectorTitle, type: "input", tag: "title" },
                      { title: ASC.Resources.Master.Resource.SelectorManager, type: "select", tag: "manager" }
            ];
            opts.newbtn = ASC.Resources.Master.Resource.CreateButton;

            that.displayAddItemBlock.call(that, opts);

            var filter = {
                employeeStatus: 1,
                employeeType: 1
            };

            Teamlab.getProfilesByFilter({}, {
                before: function () {
                    that.showLoaderSimpleSelector.call(that, "manager");
                },
                filter: filter,
                success: function (params, data) {
                    for (var i = 0, length = data.length; i < length; i++) {
                        if (data[i].id == Teamlab.profile.id) {
                            itemsSimpleSelect.unshift(
                                {
                                    title: ASC.Resources.Master.Resource.MeLabel,
                                    id: data[i].id
                                }
                            );
                        }
                        else {
                            itemsSimpleSelect.push(
                                {
                                    title: data[i].displayName,
                                    id: data[i].id
                                }
                            );
                        }
                    }
                    that.initDataSimpleSelector.call(that, { tag: "manager", items: itemsSimpleSelect });
                    that.hideLoaderSimpleSelector.call(that, "manager");
                },

                error: function (params, errors) {
                    toastr.error(errors);
                }
            });
        },

        initAdvSelectorData: function () {

        },
        
        rewriteObjectItem: function (data) {
            var that = this;
            
            that.items = data.map(function(item) {
                return { id: item.id, title: item.title, description: item.description, isPrivate: item.isPrivate, responsible: item.responsible, deadline: item.deadline };
            });
            that.items = that.items.sort(that.options.sortMethod || SortData);
            that.showItemsListAdvSelector.call(that);
        },

        selectBeforeShow: function (item) {
            this.$element.trigger("showList", arguments);
            this.select([item.id]);
        },

        createNewItemFn: function () {
            var that = this,
                $addPanel = that.$advancedSelector.find(".advanced-selector-add-new-block"),
                $btn = $addPanel.find(".advanced-selector-btn-add"),
                isError;

            var newProject = {
                title: $addPanel.find(".title input").val().trim(),
                responsibleid: $addPanel.find(".manager input").attr("data-id"),
                notify: false,
                description: "",
                tags: "",
                'private': false
            };

            if (!newProject.title) {
                that.showErrorField.call(that, { field: $addPanel.find(".title"), error: ASC.Resources.Master.Resource.ProjectSelectorEmptyTitleError });
                isError = true;
            }
            if (!newProject.responsibleid) {
                that.showErrorField.call(that, { field: $addPanel.find(".manager"), error: ASC.Resources.Master.Resource.ProjectSelectorEmptyManagerError });
                isError = true;
            }
            if (!newProject.responsibleid && $addPanel.find(".manager input").val()) {
                that.showErrorField.call(that, { field: $addPanel.find(".manager"), error: ASC.Resources.Master.Resource.ProjectSelectorNotPersonError });
                isError = true;
            }
            if (isError) {
                $addPanel.find(".error input").first().focus();
                return;
            }
            Teamlab.addPrjProject({}, newProject, {
                before: function() {
                    that.displayLoadingBtn.call(that, { btn: $btn, text: ASC.Resources.Master.Resource.LoadingProcessing });
                },
                error: function(params, errors) {
                    that.showServerError.call(that, { field: $btn, error: errors });
                },
                success: function(params, project) {
                    project = this.__responses[0];
                    var newproject = {
                        id: project.id,
                        title: project.title
                    }
                    that.actionsAfterCreateItem.call(that, { newitem: newproject, response: project });
                },
                after: function() {
                    that.hideLoadingBtn.call(that, $btn);
                }
            });
        }

    });


    $.fn.projectadvancedSelector = function (option) {
        var selfargs = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            var $this = $(this),
                data = $this.data('projectadvancedSelector'),
                options = $.extend({},
                    $.fn.projectadvancedSelector.defaults,
                    $this.data(),
                    typeof option == 'object' && option);
            if (!data) $this.data('projectadvancedSelector', (data = new projectadvancedSelector(this, options)));
            if (typeof option == 'string') data[option].apply(data, selfargs);
        });
    };
    
    $.fn.projectadvancedSelector.defaults = $.extend({}, $.fn.advancedSelector.defaults, {
        showme: true,
        addtext: ASC.Resources.Master.Resource.ProjectSelectorAddText,
        noresults: ASC.Resources.Master.Resource.ProjectSelectorNoResult,
        noitems: ASC.Resources.Master.Resource.ProjectSelectorNoItems,
        emptylist: ASC.Resources.Master.Resource.ProjectSelectorEmptyList
    });

})(jQuery, window, document, document.body);