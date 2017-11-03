package de.fhg.iais.roberta.javaServer.basics;

import java.util.Map;

import javax.ws.rs.core.Response;

import org.hibernate.Session;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import de.fhg.iais.roberta.factory.IRobotFactory;
import de.fhg.iais.roberta.javaServer.restServices.all.ClientGroup;
import de.fhg.iais.roberta.javaServer.restServices.all.ClientUser;
import de.fhg.iais.roberta.main.ServerStarter;
import de.fhg.iais.roberta.persistence.util.DbSetup;
import de.fhg.iais.roberta.persistence.util.HttpSessionState;
import de.fhg.iais.roberta.persistence.util.SessionFactoryWrapper;
import de.fhg.iais.roberta.robotCommunication.RobotCommunicator;
import de.fhg.iais.roberta.testutil.JSONUtilForServer;
import de.fhg.iais.roberta.util.Key;
import de.fhg.iais.roberta.util.RobertaProperties;
import de.fhg.iais.roberta.util.Util1;

/**
 * Testing the REST interface for groups of the OpenRoberta server
 *
 * @author eovhinnikova
 */
public class ClientGroupTest {

    private SessionFactoryWrapper sessionFactoryWrapper; // used by REST services to retrieve data base sessions
    private DbSetup memoryDbSetup; // use to query the test data base, change the data base at will, etc.

    private Response response; // store all REST responses here
    private HttpSessionState sPid;

    // objects for specialized user stories
    private String connectionUrl;
    private RobertaProperties robertaProperties;
    private ClientUser restUser;
    private ClientGroup restGroup;
    private RobotCommunicator robotCommunicator;

    @Before
    public void setup() throws Exception {
        this.robertaProperties = new RobertaProperties(Util1.loadProperties(null));
        this.connectionUrl = "jdbc:hsqldb:mem:restTestInMemoryDb";
        this.robotCommunicator = new RobotCommunicator();
        this.restUser = new ClientUser(this.robotCommunicator, this.robertaProperties, null);
        this.restGroup = new ClientGroup(this.robotCommunicator);
        this.sessionFactoryWrapper = new SessionFactoryWrapper("hibernate-test-cfg.xml", this.connectionUrl);
        Session nativeSession = this.sessionFactoryWrapper.getNativeSession();
        this.memoryDbSetup = new DbSetup(nativeSession);
        this.memoryDbSetup.createEmptyDatabase();
        Map<String, IRobotFactory> robotPlugins = ServerStarter.configureRobotPlugins(this.robotCommunicator, this.robertaProperties);
        this.sPid = HttpSessionState.init(this.robotCommunicator, robotPlugins, this.robertaProperties, 1);
    }

    private void createTwoUsers() throws Exception {
        Assert.assertTrue(!this.sPid.isUserLoggedIn());
        Assert.assertEquals(3, this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER"));
        restUser(
            this.sPid,
            "{'cmd':'createUser';'accountName':'bertran123';'userName':'bertran123';'password':'bertran123';'userEmail':'';'role':'STUDENT', 'isYoungerThen14': 'true', 'language': 'de'}",
            "ok",
            Key.USER_CREATE_SUCCESS);
        Assert.assertEquals(4, this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER"));
        restUser(
            this.sPid,
            "{'cmd':'createUser';'accountName':'minscha';'userName':'cavy';'password':'bertran123';'userEmail':'';'role':'STUDENT', 'isYoungerThen14': 'true', 'language': 'de'}",
            "ok",
            Key.USER_CREATE_SUCCESS);
        Assert.assertEquals(5, this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER"));
        Assert.assertTrue(!this.sPid.isUserLoggedIn());
    }

    /**
     * Each method call of this test method is a separate test testing separate components of the server. The methods have to be called in sequence, because
     * they depend on database state (e.g.: login expects an existing user, which is created by methods called before).
     *
     * @throws Exception
     */
    @Test
    public void test() throws Exception {
        createTwoUsers();
        restUser(this.sPid, "{'cmd':'login';'accountName':'bertran123';'password':'bertran123'}", "ok", Key.USER_GET_ONE_SUCCESS);
        addUserNotNull();
        addUserNullGroup();
        addUserNullUser();
        createGroupNotNull();
        createGroupNullWrongSymbol();
        createGroupNull();
        getGroupMembersNotNull();
        getGroupMembersNull();
        getGroupMembersZero();
        getMemberGroups();
        getGroupNotNull();
        getGroupNull();
        getUserGroupNotNull();
        getUserGroupNull();
        deleteUserNotNull();
        deleteUserNullGroup();
        deleteUserNullUser();
        deleteGroupNotNull();
        deleteGroupNull();
    }

    public void createGroupNotNull() throws Exception {
        Assert.assertEquals(8, this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from GROUPS"));
        Assert.assertTrue(this.sPid.isUserLoggedIn());
        long initNumberOfGroups = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from GROUPS");
        restGroup(this.sPid, "{'cmd':'createGroup';'userId':'" + this.sPid.getUserId() + "','groupName':'restTestGroup1716';}", "ok", Key.GROUP_CREATE_SUCCESS);
        long finalNumberOfGroups = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from GROUPS");
        long diff = finalNumberOfGroups - initNumberOfGroups;
        Assert.assertEquals(1, diff);
    }

    public void createGroupNullWrongSymbol() throws Exception {
        Assert.assertEquals(9, this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from GROUPS"));
        Assert.assertTrue(this.sPid.isUserLoggedIn());
        long initNumberOfGroups = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from GROUPS");
        restGroup(this.sPid, "{'cmd':'createGroup';'userId':'0','groupName':'<><><><';}", "error", Key.GROUP_CREATE_ERROR_NOT_SAVED_TO_DB);
        long finalNumberOfGroups = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from GROUPS");
        long diff = finalNumberOfGroups - initNumberOfGroups;
        Assert.assertEquals(0, diff);
    }

    public void createGroupNull() throws Exception {
        Assert.assertEquals(9, this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from GROUPS"));
        Assert.assertTrue(this.sPid.isUserLoggedIn());
        long initNumberOfGroups = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from GROUPS");
        restGroup(this.sPid, "{'cmd':'createGroup';'userId':'0','groupName':'';}", "error", Key.GROUP_CREATE_ERROR_NOT_SAVED_TO_DB);
        long finalNumberOfGroups = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from GROUPS");
        long diff = finalNumberOfGroups - initNumberOfGroups;
        Assert.assertEquals(0, diff);
    }

    public void deleteGroupNotNull() throws Exception {
        Assert.assertEquals(9, this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from GROUPS"));
        Assert.assertTrue(this.sPid.isUserLoggedIn());
        long initNumberOfGroups = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from GROUPS");
        restGroup(this.sPid, "{'cmd':'deleteGroup';'groupName':'restTestGroup1716'}", "ok", Key.GROUP_DELETE_SUCCESS);
        long finalNumberOfGroups = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from GROUPS");
        long diff = finalNumberOfGroups - initNumberOfGroups;
        Assert.assertEquals(-1, diff);
    }

    public void deleteGroupNull() throws Exception {
        long initNumberOfGroups = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from GROUPS");
        restGroup(this.sPid, "{'cmd':'deleteGroup';'groupName':'ghjghj'}", "error", Key.GROUP_DELETE_ERROR);
        long finalNumberOfGroups = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from GROUPS");
        long diff = finalNumberOfGroups - initNumberOfGroups;
        Assert.assertEquals(0, diff);
    }

    public void getGroupMembersNotNull() throws Exception {
        restGroup(this.sPid, "{'cmd':'getMembersList';'groupName':'restTestGroup15'}", "ok", Key.GROUP_GET_MEMBERS_SUCCESS);
        System.out.println("getGroupMembersNotNull");
        Assert.assertTrue(this.response.getEntity().toString().contains("bertran123") && this.response.getEntity().toString().contains("minscha"));
    }

    public void getGroupMembersNull() throws Exception {
        restGroup(this.sPid, "{'cmd':'getMembersList';'groupName':'Qererett'}", "error", Key.SERVER_ERROR);
    }

    public void getGroupMembersZero() throws Exception {
        restGroup(this.sPid, "{'cmd':'getMembersList';'groupName':'TestGroup2'}", "ok", Key.GROUP_GET_MEMBERS_SUCCESS);
    }

    public void getMemberGroups() throws Exception {
        restGroup(this.sPid, "{'cmd':'getGroupsList'}", "ok", Key.USER_GET_GROUPS_SUCCESS);
        Assert.assertTrue(this.response.getEntity().toString().contains("\"restTestGroup15\",\"bertran123\""));
    }

    public void getGroupNotNull() throws Exception {
        restGroup(this.sPid, "{'cmd':'getGroup';'groupName':'TestGroup1'}", "ok", Key.GROUP_GET_ONE_SUCCESS);
        Assert.assertTrue(this.response.getEntity().toString().contains("[id=2, owner=1]"));
    }

    public void getGroupNull() throws Exception {
        restGroup(this.sPid, "{'cmd':'getGroup';'groupName':'qwqwqw'}", "error", Key.GROUP_GET_ONE_ERROR_NOT_FOUND);
    }

    public void getUserGroupNotNull() throws Exception {
        restGroup(this.sPid, "{'cmd':'getUserGroup';'account':'bertran123';'groupName':'restTestGroup1716'}", "ok", Key.USER_GROUP_GET_ONE_SUCCESS);
        Assert.assertTrue(this.response.getEntity().toString().contains("[id=7, userId=" + this.sPid.getUserId() + ", group=9]"));
    }

    public void getUserGroupNull() throws Exception {
        restGroup(this.sPid, "{'cmd':'getUserGroup';'account':'bertran123';'groupName':'Test576'}", "error", Key.SERVER_ERROR);
    }

    public void addUserNotNull() throws Exception {
        restGroup(this.sPid, "{'cmd':'createGroup';'userId':'" + this.sPid.getUserId() + "','groupName':'restTestGroup15';}", "ok", Key.GROUP_CREATE_SUCCESS);
        Assert.assertEquals(5, this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP"));
        long initNumberOfUsersInGroup = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP");
        restGroup(this.sPid, "{'cmd':'addUser';'account':'minscha';'groupName':'restTestGroup15'}", "ok", Key.USER_GROUP_SAVE_SUCCESS);
        long finalNumberOfUsersInGroup = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP");
        long diff = finalNumberOfUsersInGroup - initNumberOfUsersInGroup;
        Assert.assertEquals(1, diff);
    }

    public void addUserNullGroup() throws Exception {
        Assert.assertEquals(6, this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP"));
        long initNumberOfUsersInGroup = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP");
        restGroup(this.sPid, "{'cmd':'addUser';'account':'bertran123';'groupName':'TestGroup98989'}", "error", Key.SERVER_ERROR);
        long finalNumberOfUsersInGroup = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP");
        long diff = finalNumberOfUsersInGroup - initNumberOfUsersInGroup;
        Assert.assertEquals(0, diff);
    }

    public void addUserNullUser() throws Exception {
        Assert.assertEquals(6, this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP"));
        long initNumberOfUsersInGroup = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP");
        restGroup(this.sPid, "{'cmd':'addUser';'account':'bert';'groupName':'restTestGroup15'}", "error", Key.USER_TO_ADD_NOT_FOUND);
        long finalNumberOfUsersInGroup = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP");
        long diff = finalNumberOfUsersInGroup - initNumberOfUsersInGroup;
        Assert.assertEquals(0, diff);
    }

    public void deleteUserNotNull() throws Exception {
        Assert.assertEquals(7, this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP"));
        long initNumberOfUsersInGroup = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP");
        restGroup(this.sPid, "{'cmd':'deleteUser';'account':'bertran123';'groupName':'restTestGroup15'}", "ok", Key.USER_GROUP_DELETE_SUCCESS);
        long finalNumberOfUsersInGroup = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP");
        long diff = finalNumberOfUsersInGroup - initNumberOfUsersInGroup;
        Assert.assertEquals(-1, diff);
    }

    public void deleteUserNullGroup() throws Exception {
        Assert.assertEquals(6, this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP"));
        long initNumberOfUsersInGroup = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP");
        restGroup(this.sPid, "{'cmd':'deleteUser';'account':'bertran123';'groupName':'TestGroup551545'}", "error", Key.SERVER_ERROR);
        long finalNumberOfUsersInGroup = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP");
        long diff = finalNumberOfUsersInGroup - initNumberOfUsersInGroup;
        Assert.assertEquals(0, diff);
    }

    public void deleteUserNullUser() throws Exception {
        Assert.assertEquals(6, this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP"));
        long initNumberOfUsersInGroup = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP");
        restGroup(this.sPid, "{'cmd':'deleteUser';'account':'bert4545';'groupName':'restTestGroup15'}", "error", Key.USER_GROUP_DELETE_ERROR);
        long finalNumberOfUsersInGroup = this.memoryDbSetup.getOneBigIntegerAsLong("select count(*) from USER_GROUP");
        long diff = finalNumberOfUsersInGroup - initNumberOfUsersInGroup;
        Assert.assertEquals(0, diff);
    }

    private void restGroup(HttpSessionState httpSession, String jsonAsString, String result, Key msgOpt) throws Exception {
        this.response = this.restGroup.command(httpSession, this.sessionFactoryWrapper.getSession(), JSONUtilForServer.mkD(jsonAsString));
        JSONUtilForServer.assertEntityRc(this.response, result, msgOpt);
    }

    /**
     * call a REST service for user-related commands. Store the response into <code>this.response</code>. Check whether the expected result and the expected
     * message key are found
     *
     * @param httpSession the session on which behalf the call is executed
     * @param jsonAsString the command (will be parsed to a JSON object)
     * @param result the expected result is either "ok" or "error"
     * @param msgOpt optional key for the message; maybe null
     * @throws Exception
     */
    private void restUser(HttpSessionState httpSession, String jsonAsString, String result, Key msgOpt) throws Exception {
        this.response = this.restUser.command(httpSession, this.sessionFactoryWrapper.getSession(), JSONUtilForServer.mkD(jsonAsString));
        JSONUtilForServer.assertEntityRc(this.response, result, msgOpt);
    }

}
