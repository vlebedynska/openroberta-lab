define([ 'exports', 'log', 'message', 'util', 'userGroup.model', 'guiState.controller', 'jquery', 'blocks', 'blocks-msg' ], function(exports, LOG, MSG, UTIL, USERGROUP,
        GUISTATE_C, $, Blockly) {

    /**
     * Add a user to group
     */
    function addUserToGroup() {
    	$('.modal').modal('hide'); // close all opened popups
        var userName = $('#singleModalInput').val().trim();
        if (!/^[a-zA-Z0-9=+!?.,%#+&^@_ ]+$/gi.test(userName)){
        	return null;
        }
        var groupName = GUISTATE_C.getGroupName();
        LOG.info('add user ' + userName + ' to a group ' + groupName);
        USERGROUP.addUser(userName, groupName, function(result) {
        UTIL.response(result);
        if (result.rc === 'ok') {
            $('#userGroupList').find('button[name="refresh"]').trigger('click');
        }
        MSG.displayInformation(result, "MESSAGE_ADDED_USER", result.message, userName);
        });
    }
    exports.addUserToGroup = addUserToGroup;
       
    function showSaveAsModal() {
        $.validator.addMethod("loginRegex", function(value, element) {
            return this.optional(element) || /^[a-zA-Z0-9=+!?.,%#+&^@_ ]+$/gi.test(value);
        }, "This field contains nonvalid symbols.");

        UTIL.showSingleModal(function() {
            $('#singleModalInput').attr('type', 'text');
            $('#single-modal h3').text("Add a user");
            $('#single-modal label').text("Name");
        }, addUserToGroup, function() {

        }, {
            rules : {
                singleModalInput : {
                    required : true,
                    loginRegex : true
                }
            },
            errorClass : "form-invalid",
            errorPlacement : function(label, element) {
                label.insertAfter(element);
            },
            messages : {
                singleModalInput : {
                    required : Blockly.Msg["VALIDATION_FIELD_REQUIRED"],
                    loginRegex : Blockly.Msg["MESSAGE_INVALID_NAME"]
                }
            }
        });
    }
    exports.showSaveAsModal = showSaveAsModal;

  
});
