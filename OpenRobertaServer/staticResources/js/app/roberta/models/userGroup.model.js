/**
 * Rest calls to the server related to userGroup operations (create user, login ...)
 * 
 * @module rest/program
 */
define([ 'exports', 'comm' ], function(exports, COMM) {


    /**
     * Retrieves userGroup with specified name from the server, if the currently logged in user is its owner
     * 
     * @param groupName
     *            {String} - name of the userGroup
     * @param successFn
     *            {Function} - a callback that is called when the creation succeeds. Needs to take one parameter "data"
     */
    function getUserGroupFromServer(groupName, successFn) {
        COMM.json("/userGroup/getUserGroup", {
            "cmd" : "getUser",
            "groupName" : groupName,
        }, successFn, "got user info from server");
    }

    exports.getUserGroupFromServer = getUserGroupFromServer;

    /**
     * Retrieves all userGroups from the server, for which the currently logged in user is the owner.
     * 
     * @param groupName
     *            {String} - name of the userGroup
     * @param successFn
     *            {Function} - a callback that is called when the creation succeeds. Needs to take one parameter "data"
     */
    function getUserGroupsFromServer(successFn) {
        COMM.json("/userGroup/getUserGroup", {
            "cmd" : "getUser",
            "groupName" : groupName,
        }, successFn, "got user info from server");
    }

    exports.getUserGroupsFromServer = getUserGroupsFromServer;

    /**
     * Create user to server.
     * 
     * @param groupName
     *            {String} - name of the userGroup
     * @param successFn
     *            {Function} - a callback that is called when the creation succeeds. Needs to take one parameter "data"
     * 
     */
    function createUserGroupToServer(groupName, successFn) {
        COMM.json("/userGroup/createUserGroup", {
            "cmd" : "createUserGroup",
            "groupName" : groupName,
        }, function (data) {debugger; successFn(data);}, "save user '" + accountName + "' to server");
    }

    exports.createUserGroupToServer = createUserGroupToServer;

});
