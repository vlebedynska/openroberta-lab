package de.fhg.iais.roberta.javaServer.restServices.all.controller;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Inject;

import de.fhg.iais.roberta.javaServer.provider.OraData;
import de.fhg.iais.roberta.main.MailManagement;
import de.fhg.iais.roberta.persistence.UserGroupProcessor;
import de.fhg.iais.roberta.persistence.UserProcessor;
import de.fhg.iais.roberta.persistence.bo.User;
import de.fhg.iais.roberta.persistence.util.DbSession;
import de.fhg.iais.roberta.persistence.util.HttpSessionState;
import de.fhg.iais.roberta.robotCommunication.RobotCommunicator;
import de.fhg.iais.roberta.util.Key;
import de.fhg.iais.roberta.util.ServerProperties;
import de.fhg.iais.roberta.util.Statistics;
import de.fhg.iais.roberta.util.Util;
import de.fhg.iais.roberta.util.UtilForREST;

@Path("/userGroup")
public class UserGroupController {

    private static final Logger LOG = LoggerFactory.getLogger(UserGroupController.class);

    private final RobotCommunicator brickCommunicator;
    private final MailManagement mailManagement;

    private final boolean isPublicServer;

    private static String[] statusText = new String[2];
    private static long statusTextTimestamp;

    @Inject
    public UserGroupController(RobotCommunicator brickCommunicator, ServerProperties serverProperties, MailManagement mailManagement) {
        this.brickCommunicator = brickCommunicator;
        this.mailManagement = mailManagement;
        this.isPublicServer = serverProperties.getBooleanProperty("server.public");
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getUserGroup")
    public Response getUserGroup(@OraData DbSession dbSession, JSONObject fullRequest) throws Exception {
        String cmd = "getUserGroup";

        JSONObject response = new JSONObject();

        try {
            response.put("cmd", cmd);
        } catch ( JSONException e ) {
            // Can not happen, because the key is neither null, nor is the value numeric and infinite
            e.printStackTrace();
        }

        UserGroupController.LOG.info("command is: " + cmd);

        HttpSessionState httpSessionState = UtilForREST.handleRequestInit(UserGroupController.LOG, fullRequest);

        if ( !httpSessionState.isUserLoggedIn() ) {
            UserGroupController.LOG.error("Invalid command: " + cmd);
            UtilForREST.addErrorInfo(response, Key.USER_ERROR_NOT_LOGGED_IN);
            return UtilForREST.responseWithFrontendInfo(response, httpSessionState, this.brickCommunicator);
        }

        int loggedInUserId = httpSessionState.getUserId();
        String groupName;

        try {
            groupName = fullRequest.getJSONObject("data").getString("groupName");
        } catch ( JSONException e ) {
            UserGroupController.LOG.error("Invalid command: " + cmd);
            UtilForREST.addErrorInfo(response, Key.COMMAND_INVALID);
            return UtilForREST.responseWithFrontendInfo(response, httpSessionState, this.brickCommunicator);
        }

        try {
            if ( !httpSessionState.isUserLoggedIn() ) {
                UserGroupController.LOG.error("Invalid command: " + cmd);
                UtilForREST.addErrorInfo(response, Key.COMMAND_INVALID);
            } else {
                UserProcessor up = new UserProcessor(dbSession, httpSessionState);
                User user = up.getUser(httpSessionState.getUserId());

                UtilForREST.addResultInfo(response, up);

                if ( user != null ) {

                    UserGroupProcessor ugp = new UserGroupProcessor(dbSession, httpSessionState, this.isPublicServer);

                    int id = user.getId();
                    String account = user.getAccount();
                    String userName = user.getUserName();
                    String email = user.getEmail();
                    boolean age = user.isYoungerThen14();
                    response.put("userId", id);
                    response.put("userAccountName", account);
                    response.put("userName", userName);
                    response.put("userEmail", email);
                    response.put("isYoungerThen14", age);
                }
            }
        } catch ( Exception e ) {
            dbSession.rollback();
            String errorTicketId = Util.getErrorTicketId();
            UserGroupController.LOG.error("Exception. Error ticket: " + errorTicketId, e);
            UtilForREST.addErrorInfo(response, Key.SERVER_ERROR).append("parameters", errorTicketId);
        } finally {
            if ( dbSession != null ) {
                dbSession.close();
            }
        }
        return UtilForREST.responseWithFrontendInfo(response, httpSessionState, this.brickCommunicator);
    }

    /**
     * TODO: Check for isPublic on whether or not a global user can have a group or not
     *
     * @param dbSession
     * @param fullRequest
     * @return
     */

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/createUserGroup")
    public Response createUserGroup(@OraData DbSession dbSession, JSONObject fullRequest) {
        String cmd = "createUserGroup";
        JSONObject response = new JSONObject();

        try {
            response.put("cmd", cmd);
        } catch ( JSONException e ) {
            // Can not happen, because the key is neither null, nor is the value numeric and infinite
            e.printStackTrace();
        }

        UserGroupController.LOG.info("command is: " + cmd);

        HttpSessionState httpSessionState = UtilForREST.handleRequestInit(UserGroupController.LOG, fullRequest);

        if ( !httpSessionState.isUserLoggedIn() ) {
            UserGroupController.LOG.error("Invalid command: " + cmd);
            try {
                UtilForREST.addErrorInfo(response, Key.USER_ERROR_NOT_LOGGED_IN);
            } catch ( JSONException e ) {
                // Can not happen
            }
            return UtilForREST.responseWithFrontendInfo(response, httpSessionState, this.brickCommunicator);
        }

        UserProcessor up = new UserProcessor(dbSession, httpSessionState);
        User groupOwner;
        try {
            groupOwner = up.getUser(httpSessionState.getUserId());
        } catch ( Exception e ) {
            try {
                UtilForREST.addErrorInfo(response, up.getMessage());
            } catch ( JSONException e1 ) {
                // Can not happen
            }
            return UtilForREST.responseWithFrontendInfo(response, httpSessionState, this.brickCommunicator);
        }

        if ( groupOwner == null || !up.succeeded() ) {
            UserGroupController.LOG.error("Invalid command: " + cmd);
            //TODO: Discuss - This should always work. Shall we therefore really pass the processor
            //error to the user, or rather send a default server error instead?
            try {
                UtilForREST.addErrorInfo(response, up.getMessage());
            } catch ( JSONException e ) {
                // Can not happen
            }
            return UtilForREST.responseWithFrontendInfo(response, httpSessionState, this.brickCommunicator);
        }

        String groupName;
        try {
            groupName = fullRequest.getJSONObject("data").getString("groupName");
        } catch ( JSONException e ) {
            UserGroupController.LOG.error("Invalid command: " + cmd);
            try {
                UtilForREST.addErrorInfo(response, Key.COMMAND_INVALID);
            } catch ( JSONException e1 ) {
                // Can not happen
            }
            return UtilForREST.responseWithFrontendInfo(response, httpSessionState, this.brickCommunicator);
        }

        UserGroupProcessor ugp = new UserGroupProcessor(dbSession, httpSessionState, this.isPublicServer);
        ugp.createGroup(groupName, groupOwner);

        Statistics.info("UserCreate", "success", ugp.succeeded());

        try {
            UtilForREST.addResultInfo(response, ugp);
        } catch ( JSONException e ) {
            // Can not happen
        }

        if ( !ugp.succeeded() ) {
            dbSession.rollback();
        }

        dbSession.close();
        return UtilForREST.responseWithFrontendInfo(response, httpSessionState, this.brickCommunicator);
    }

}
