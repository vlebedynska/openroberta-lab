/**
 * Rest calls to the server related to group operations (save, delete ...)
 * 
 * @module rest/group
 */
define([ 'exports', 'comm' ], function(exports, COMM) {

    /**
     * Refresh user group list
     */
    function loadUserGroupList(groupName, successFn) {
        COMM.json("/usergroups", {
            "cmd" : "getMembersList",
            "groupName" : groupName
        }, successFn, "load group's users list");
    }
    exports.loadUserGroupList = loadUserGroupList;

});
