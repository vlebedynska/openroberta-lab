define([ 'require', 'exports', 'log', 'util', 'comm', 'userGroupList.model', 'userGroup.model', 'userGroup.controller', 'guiState.controller', 'blocks-msg', 'jquery', 'bootstrap-table' ], function(
        require, exports, LOG, UTIL, COMM, USERGROUPLIST, USERGROUP, USERGROUP_C, GUISTATE_C, Blockly, $) {

    /**
     * Initialize table of user groups
     */
    function init() {
        initUserGroupList();
        initUserGroupListEvents();
        LOG.info('init user group list view');
    }
    exports.init = init;

    function initUserGroupList() {

        $('#userGroupNameTable').bootstrapTable({
            height : UTIL.calcDataTableHeight(),
            pageList : '[ 10, 25, All ]',
            toolbar : '#userGroupListToolbar',
            showRefresh : 'true',
            showPaginationSwitch : 'true',
            pagination : 'true',
            buttonsAlign : 'right',
            resizable : 'true',
            iconsPrefix : 'typcn',
            icons : {
                paginationSwitchDown : 'typcn-document-text',
                paginationSwitchUp : 'typcn-book',
                refresh : 'typcn-refresh',
            },
            columns : [ {
                title : "<span lkey='Blockly.Msg.DATATABLE_USER_NAME'>Name of the user</span>",
                sortable : true,
                field : '0',
            }, {
                field : '1',
                checkbox : true,
                valign : 'middle',
            },
            {
                field : '2',
                events : eventsDelete,
                title : titleActions,
                align : 'left',
                valign : 'top',
                formatter : formatDelete,
                width : '60px',
            }, ]
        });
        $('#userGroupNameTable').bootstrapTable('togglePagination');
    }

    function initUserGroupListEvents() {

        $(window).resize(function() {
            $('#userGroupNameTable').bootstrapTable('resetView', {
                height : UTIL.calcDataTableHeight()
            });
        });
        
        $('#tabUserGroupList').on('show.bs.tab', function(e) {
            guiStateController.setView('tabUserGroupList');
            groupName = GUISTATE_C.getGroupName();
            USERGROUPLIST.loadUserGroupList(groupName, update);
        });
                
               
        $('#userGroupList').find('button[name="refresh"]').onWrap('click', function() {
            groupName = GUISTATE_C.getGroupName();
            USERGROUPLIST.loadUserGroupList(groupName, update);
            return false;
        }, "refresh user group list clicked");
        
        $('#addUser').onWrap('click', function() {
            USERGROUP_C.showSaveAsModal();
            return false;
        }, "add a user")

        $('#userGroupNameTable').onWrap('check-all.bs.table', function($element, rows) {
            $('.deleteSomeUserGroup').removeClass('disabled');
            $('.delete').addClass('disabled');
        }, 'check all users');

        $('#userGroupNameTable').onWrap('check.bs.table', function($element, row) {
            $('.deleteSomeUserGroup').removeClass('disabled');
            $('.delete').addClass('disabled');
        }, 'check one users');
        
        $('#userGroupNameTable').onWrap('uncheck-all.bs.table', function($element, rows) {
            $('.deleteSomeUserGroup').addClass('disabled');
            $('.delete').removeClass('disabled');
        }, 'uncheck all users');

        $('#userGroupNameTable').onWrap('uncheck.bs.table', function($element, row) {
            var selectedRows = $('#userGroupNameTable').bootstrapTable('getSelections');
            console.log(selectedRows);
            if (selectedRows.length <= 0 || selectedRows == null) {
                $('.deleteSomeUserGroup').addClass('disabled');
                $('.delete').removeClass('disabled');
            }
        }, 'uncheck one user');

        $('#backUserGroupList').onWrap('click', function() {
            $('#tabGroupList').trigger('click');
            return false;
        }, "back to group list view")
        
        $(document).onWrap('click', '.deleteSomeUserGroup', function() {
            var userGroup = $('#userGroupNameTable').bootstrapTable('getSelections', {});
            var names = '';
            for (var i = 0; i < userGroup.length; i++) {
                names += userGroup[i][0];
                names += '<br>';
            }
            $('#confirmDeleteUserGroupName').html(names);
            $('#confirmDeleteUserGroup').one('hide.bs.modal', function(event) {
                USERGROUPLIST.loadUserGroupList(update);
            });
            $("#confirmDeleteUserGroup").data('userGroup', userGroup);
            $("#confirmDeleteUserGroup").modal("show");
            return false;
        }, "delete users from the group");
                       
        
        $('#userGroupNameTable').on('shown.bs.collapse hidden.bs.collapse', function(e) {
            $('#userGroupNameTable').bootstrapTable('resetWidth');
        });

        function update(result) {
            UTIL.response(result);
            if (result.rc === 'ok') {
                $('#userGroupNameTable').bootstrapTable("load", result.memberList);
                $('#userGroupNameTable').bootstrapTable("showColumn", '2');
                if ($('#tabUserGroupList').data('type') == 'userGroup') {
                    $('.deleteSomeUserGroup').show();
                } else {
                    $('.deleteSomeUserGroup').hide();
                }
            }
        }
    }

    var eventsDelete = {
        'click .delete' : function(e, value, row, index) {
            var selectedRows = [ row ];
            var names = '';
            for (var i = 0; i < selectedRows.length; i++) {
                names += selectedRows[i][0];
                names += '<br>';
            }
            $('#confirmDeleteUserGroupName').html(names);
            $("#confirmDeleteUserGroup").data('usergroup', selectedRows);
            $('#confirmDeleteUserGroup').one('hidden.bs.modal', function(event) {
            });
            $("#confirmDeleteUserGroup").modal("show");
            return false;
        }
    };

    
    var formatDelete = function(value, row, index) {
        var result = '';
        if ($('#tabUserGroupList').data('type') === 'userGroup') {
            result += '<a href="#" class="delete" title="Delete user"><span class="typcn typcn-delete"></span></a>';
        }
        return result;
    }
    
    var titleActions = '<a href="#" id="deleteSomeUserGroup" class="deleteSomeUserGroup disabled" rel="tooltip" lkey="Blockly.Msg.USERGROUP_DELETE_ALL_TOOLTIP" data-original-title="" data-container="body" title="">'
    + '<span class="typcn typcn-delete"></span></a>';
});