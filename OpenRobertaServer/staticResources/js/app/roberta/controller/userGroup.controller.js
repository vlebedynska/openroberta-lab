define([ 'exports', 'log', 'message', 'util', 'user.model', 'guiState.controller', 'jquery', 'blocks', 'blocks-msg' ], function(exports, LOG, MSG, UTIL, USER,
        GUISTATE_C, $, Blockly) {
    function showPanel() {
        $('#userGroupList').click();
    }
    exports.showPanel = showPanel;

    function initUserGroupList() {
        $('#userGroupTable').bootstrapTable({
            height : UTIL.calcDataTableHeight(),
            pageList : '[ 10, 25, All ]',
            toolbar : '#userGroupListToolbar',
            showRefresh : 'true',
            sortName : 1,
            sortOrder : 'asc',
            showPaginationSwitch : 'true',
            pagination : 'false',
            buttonsAlign : 'right',
            resizable : 'true',
            iconsPrefix : 'typcn',
            icons : {
                paginationSwitchDown : 'typcn-document-text',
                paginationSwitchUp : 'typcn-book',
                refresh : 'typcn-refresh',
            },
            columns : [ {
                title : "<span lkey='Blockly.Msg.DATATABLE_USERGROUP_NAME'>" + (Blockly.Msg.DATATABLE_USERGROUP_NAME || "Name der Gruppe") + "</span>",
                sortable : true,
            }, {
                events : showParticipants,
                title : "<span class='typcn typcn-flow-merge'></span>",
                sortable : true,
                sorter : sortRelations,
                formatter : formatRelations,
                align : 'left',
                valign : 'middle',
            }, {
                events : eventsRelations,
                title : "<span class='typcn typcn-flow-merge'></span>",
                sortable : true,
                sorter : sortRelations,
                formatter : formatRelations,
                align : 'left',
                valign : 'middle',
            }, {
                title : "<span lkey='Blockly.Msg.DATATABLE_CREATED_ON'>" + (Blockly.Msg.DATATABLE_CREATED_ON || "Erzeugt am") + "</span>",
                sortable : true,
                formatter : UTIL.formatDate
            }, {
                checkbox : true,
                valign : 'middle',
            }, {
                events : eventsDeleteShareLoad,
                title : titleActions,
                align : 'left',
                valign : 'top',
                formatter : formatDeleteShareLoad,
                width : '117px',
            }, ]
        });
        $('#programNameTable').bootstrapTable('togglePagination');
    }
    exports.initUserGroupList = initUserGroupList;
});
