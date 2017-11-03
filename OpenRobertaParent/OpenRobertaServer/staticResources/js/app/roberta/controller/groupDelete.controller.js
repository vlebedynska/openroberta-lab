define([ 'require', 'exports', 'log', 'util', 'message', 'comm', 'group.model', 'blocks-msg', 'jquery', 'bootstrap-table' ], function(require, exports, LOG,
        UTIL, MSG, COMM, GROUP, Blockly, $) {

    function init() {
        initEvents();
        LOG.info('init group delete');
    }
    exports.init = init;

    function initEvents() {
        /**
         * Delete the groups that were selected in a group list
         */
        $('#doDeleteGroup').onWrap('click', function() {
            var group = $("#confirmDeleteGroup").data('group');
            for (var i = 0; i < group.length; i++) {
                var gr = group[i];
                var groupName = gr[0];
                var resulting;
                GROUP.deleteGroupFromListing(groupName, function(result, resulting) {
                UTIL.response(result);
                if (result.rc === 'ok') {
                    MSG.displayInformation(result, "MESSAGE_GROUP_DELETED", result.message, groupName);
                    $('#groupList').find('button[name="refresh"]').trigger('click');
                    LOG.info('delete group "' + groupName + "'");
                }
            });
                
            }
            $('.modal').modal('hide');
        }), 'doDeleteGroup clicked';
    }
});
