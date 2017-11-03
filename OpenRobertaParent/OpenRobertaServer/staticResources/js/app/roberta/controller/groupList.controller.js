define([ 'require', 'exports', 'log', 'util', 'comm', 'groupList.model', 'group.model', 'group.controller', 'guiState.controller', 'blocks-msg', 'jquery', 'bootstrap-table' ], function(
        require, exports, LOG, UTIL, COMM, GROUPLIST, GROUP, GROUP_C, GUISTATE_C, Blockly, $) {

    /**
     * Initialize table of groups
     */
    function init() {
        initGroupList();
        initGroupListEvents();
        LOG.info('init group list view');
    }
    exports.init = init;

    function initGroupList() {

        $('#groupNameTable').bootstrapTable({
            height : UTIL.calcDataTableHeight(),
            pageList : '[ 10, 25, All ]',
            toolbar : '#groupListToolbar',
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
                title : "<span lkey='Blockly.Msg.DATATABLE_GROUP_NAME'>Name of the group</span>",
                sortable : true,
            }, {
                title : "<span lkey='Blockly.Msg.DATATABLE_CREATED_BY'>Created by</span>",
                sortable : true,
            }, {
                checkbox : true,
                valign : 'middle',
            },
            {
                events : eventsDeleteLoad,
                title : titleActions,
                align : 'left',
                valign : 'top',
                formatter : formatDeleteLoad,
                width : '60px',
            }, ]
        });
        $('#groupNameTable').bootstrapTable('togglePagination');
    }

    function initGroupListEvents() {

        $(window).resize(function() {
            $('#groupNameTable').bootstrapTable('resetView', {
                height : UTIL.calcDataTableHeight()
            });
        });
        
        $('#tabGroupList').on('show.bs.tab', function(e) {
            guiStateController.setView('tabGroupList');
            GROUPLIST.loadGroupList(update);
        });
                
               
        $('#groupList').find('button[name="refresh"]').onWrap('click', function() {
            GROUPLIST.loadGroupList(update);    
            return false;
        }, "refresh group list clicked");
        
        $('#createGroup').onWrap('click', function() {
            GROUP_C.showSaveAsModal();
            return false;
        }, "create a group")

        $('#groupNameTable').onWrap('check-all.bs.table', function($element, rows) {
            $('.deleteSomeGroup').removeClass('disabled');
            $('.delete').addClass('disabled');
            $('.load').addClass('disabled');
        }, 'check all groups');
        

        $('#groupNameTable').onWrap('check.bs.table', function($element, row) {
            $('.deleteSomeGroup').removeClass('disabled');
            $('.delete').addClass('disabled');
            $('.load').addClass('disabled');
        }, 'check one group');
        
        $('#groupNameTable').onWrap('uncheck-all.bs.table', function($element, rows) {
            $('.deleteSomeGroup').addClass('disabled');
            $('.delete').removeClass('disabled');
            $('.load').removeClass('disabled');
        }, 'uncheck all groups');

        $('#groupNameTable').onWrap('uncheck.bs.table', function($element, row) {
            var selectedRows = $('#groupNameTable').bootstrapTable('getSelections');
            if (selectedRows.length <= 0 || selectedRows == null) {
                $('.deleteSomeGroup').addClass('disabled');
                $('.delete').removeClass('disabled');
                $('.load').removeClass('disabled');
            }
        }, 'uncheck one group');

        $('#backGroupList').onWrap('click', function() {
            $('#tabProgram').trigger('click');
            return false;
        }, "back to program view")
        
        $(document).onWrap('click', '.deleteSomeGroup', function() {
            var group = $('#groupNameTable').bootstrapTable('getSelections', {});
            var names = '';
            for (var i = 0; i < group.length; i++) {
                names += group[i][0];
                names += '<br>';
            }
            $('#confirmDeleteGroupName').html(names);
            $('#confirmDeleteGroup').one('hide.bs.modal', function(event) {
                GROUPLIST.loadGroupList(update);
            });
            $("#confirmDeleteGroup").data('group', group);
            $("#confirmDeleteGroup").modal("show");
            return false;
        }, "delete groups");
        
        
        $('#groupNameTable').onWrap('dbl-click-row.bs.table', function($element, row) {
            GUISTATE_C.setGroupName(row[0]);
            $('#tabUserGroupList').data('type', 'userGroup');
            $('#tabUserGroupList').click();
        }, "Load group from listing double clicked");
        
        
        $('#groupNameTable').on('shown.bs.collapse hidden.bs.collapse', function(e) {
            $('#groupNameTable').bootstrapTable('resetWidth');
        });

        function update(result) {
            UTIL.response(result);
            if (result.rc === 'ok') {
                $('#groupNameTable').bootstrapTable("load", result.groupNames);
                $('#groupNameTable').bootstrapTable("showColumn", '2');
                $('#groupNameTable').bootstrapTable("showColumn", '3');
                if ($('#tabGroupList').data('type') === 'group') {
                    $('.deleteSomeGroup').show();
                } else {
                    $('.deleteSomeGroup').hide();
                }
            }
        }
    }

    var eventsDeleteLoad = {
        'click .delete' : function(e, value, row, index) {
            var selectedRows = [ row ];
            var names = '';
            for (var i = 0; i < selectedRows.length; i++) {
                names += selectedRows[i][0];
                names += '<br>';
            }
            $('#confirmDeleteGroupName').html(names);
            $("#confirmDeleteGroup").data('group', selectedRows);
            $('#confirmDeleteGroup').one('hidden.bs.modal', function(event) {
            });
            $("#confirmDeleteGroup").modal("show");
            return false;
        },
        'click .load' : function(e, value, row, index) {
            GUISTATE_C.setGroupName(row[0]);
            $('#tabUserGroupList').data('type', 'userGroup');
            $('#tabUserGroupList').click();
        }
    };

    
    var formatDeleteLoad = function(value, row, index) {
        var result = '';
        if ($('#tabGroupList').data('type') === 'group') {
            result += '<a href="#" class="delete" title="Delete group"><span class="typcn typcn-delete"></span></a>';
        }
        result += '<a href="#" class="load "  title="Load group"><span class="typcn typcn-document"></span></a>';
        return result;
    }
    
    var titleActions = '<a href="#" id="deleteSomeGroup" class="deleteSomeGroup disabled" rel="tooltip" lkey="Blockly.Msg.GROUPLIST_DELETE_ALL_TOOLTIP" data-original-title="" data-container="body" title="">'
    + '<span class="typcn typcn-delete"></span></a>';
});