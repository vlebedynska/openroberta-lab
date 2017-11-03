/**
 * Rest calls to the server related to user operations (create user, login ...)
 * 
 * @module rest/program
 */
define([ 'exports', 'comm' ], function(exports, COMM) {

  

    /**
     * Retrieve group from server.
     * 
     * @param groupName
     *            {String} - name of the group
     * 
     * 
     */
    function getGroupFromServer(groupName, successFn) {
        COMM.json("/usergroups", {
            "cmd" : "getGroup",
            "groupName" : groupName

        }, successFn, "get group '" + groupName + "' from server");
    }

    exports.getGroupFromServer = getGroupFromServer;

    /**
     * Create group to server.
     * 
     * @param groupName
     *            {String} - name of the group
     * 
     */
    function createGroupToServer(groupName, successFn) {
        COMM.json("/usergroups", {
            "cmd" : "createGroup",
            "groupName" : groupName,
        }, successFn, "save group '" + groupName + "' to server");
    }

    exports.createGroupToServer = createGroupToServer;
    
    /**
     * Get all users those belong to a group.
     * 
     * @param groupName
     *            {String} - name of the group
     * 
     */
    function getGroupMembers(groupName, successFn) {
        COMM.json("/usergroups", {
            "cmd" : "getGroupMembers",
            "groupName" : groupName,
        }, successFn, "get group '" + groupName + "' members to server");
    }

    exports.getGroupMembers = getGroupMembers;
    
    /**
     * Get all groups where the user is registered.
     * 
     * @param groupName
     *            {String} - group of the account
     * 
     */
    function getMemberGroups(userName, successFn) {
        COMM.json("/usergroups", {
            "cmd" : "getGroupMembers",
            "userName" : userName,
        }, successFn, "get group '" + userName + "' members to server");
    }

    exports.getMemberGroups = getMemberGroups;


 
    /**
     * Delete group from the server.
     * 
     * @param groupName
     *            {String} - group name
     * 
     */
    function deleteGroupFromListing(groupName, successFn) {
        COMM.json("/usergroups", {
            "cmd" : "deleteGroup",
            "groupName" : groupName,
        }, successFn, "delete group '" + groupName + "' on server");
    }

    exports.deleteGroupFromListing = deleteGroupFromListing;
    
    
   

});
