
$(function(){
	var $membersAdvancedSelector = $("#membersAdvancedSelector");
	$membersAdvancedSelector.useradvancedSelector(
              {
                  canadd: true,       // enable to create the new item
                  showGroups: true, // show the group list
                  onechosen: false,   // list without checkbox, you can choose only one item 
                  withGuests: false
              }).on("showList", function (e, items) {
                var $o = $("#template-selector-selected-items").tmpl({ Items: items });
                $("#membersDepartmentList").html($o);

            });;
})