define([ 'exports', 'log', 'message', 'util', 'group.model', 'guiState.controller', 'blocks', 'jquery', 'jquery-validate', 'blocks-msg' ], function(exports, LOG, MSG, UTIL, GROUP,
        GUISTATE_C, Blockly, $) {

    var $divForms;
    var $formSingleModal;

    function init() {
        initEvents();
        initGroupForms();
    }
    exports.init = init;
    
    /**
     * Create new group
     */
    
    function createGroupToServer() {
        $('.modal').modal('hide'); // close all opened popups
        var groupName = $('#singleModalInput').val().trim();
        if (!/^[a-zA-Z0-9=+!?.,%#+&^@_ ]+$/gi.test(groupName)){
        	$('#singleModalOk').button("disable");
        	return null;
        }
        LOG.info('create group ' + groupName);
        GROUP.createGroupToServer(groupName, function(result) {
        UTIL.response(result);
        if (result.rc === 'ok') {
            result.name = groupName;
            GUISTATE_C.setGroupName(result);
            $('#groupList').find('button[name="refresh"]').trigger('click');
        }
        MSG.displayInformation(result, "MESSAGE_EDIT_SAVE_GROUP_AS", result.message, GUISTATE_C.getGroupName());
        });
    }
    
    exports.createGroupToServer = createGroupToServer;
    
   
    function showSaveAsModal() {
        $.validator.addMethod("loginRegex", function(value, element) {
            return this.optional(element) || /^[a-zA-Z0-9=+!?.,%#+&^@_ ]+$/gi.test(value);
        }, "This field contains nonvalid symbols.");

        UTIL.showSingleModal(function() {
            $('#singleModalInput').attr('type', 'text');
            $('#single-modal h3').text("Register a group");
            $('#single-modal label').text(Blockly.Msg["POPUP_NAME"]);
        }, createGroupToServer, function() {
        	if (loginRegex === false){
        		return null;
        	}
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
