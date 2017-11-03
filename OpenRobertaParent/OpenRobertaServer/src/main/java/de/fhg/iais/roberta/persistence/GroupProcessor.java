package de.fhg.iais.roberta.persistence;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.codehaus.jettison.json.JSONArray;

import de.fhg.iais.roberta.persistence.bo.Group;
import de.fhg.iais.roberta.persistence.bo.User;
import de.fhg.iais.roberta.persistence.dao.GroupDao;
import de.fhg.iais.roberta.persistence.dao.UserDao;
import de.fhg.iais.roberta.persistence.util.DbSession;
import de.fhg.iais.roberta.persistence.util.HttpSessionState;
import de.fhg.iais.roberta.util.Key;

public class GroupProcessor extends AbstractProcessor {

    public GroupProcessor(DbSession dbSession, HttpSessionState httpSessionState) {
        super(dbSession, httpSessionState);
    }

    /**
     * load a group from the data base.
     *
     * @param groupName the group to load
     * @param groupId - group id
     * @return the group; null, if no group was found
     */
    public Group getGroup(String groupName) {
        GroupDao groupDao = new GroupDao(this.dbSession);
        Group group = groupDao.loadGroup(groupName);
        if ( group != null ) {
            setSuccess(Key.GROUP_GET_ONE_SUCCESS);
            return group;
        } else {
            setError(Key.GROUP_GET_ONE_ERROR_NOT_FOUND);
            return null;
        }
    }

    public List<Group> loadOwnerGroups(int ownerId) {
        GroupDao groupDao = new GroupDao(this.dbSession);
        List<Group> groups = groupDao.loadOwnerGroups(ownerId);
        if ( groups != null ) {
            setSuccess(Key.USER_GET_GROUPS_SUCCESS);
            return groups;
        } else {
            setError(Key.GROUP_GET_ONE_ERROR_NOT_FOUND);
            return null;
        }
    }

    /**
     * Find out who are in a group
     *
     * @param groupName the name of the group
     */
    public JSONArray getMembersList(String groupName) {
        GroupDao groupDao = new GroupDao(this.dbSession);
        List<User> users = groupDao.loadMembersByGroup(groupName);
        JSONArray userNamesInfs = new JSONArray();
        for ( User user : users ) {
            JSONArray userNamesInf = new JSONArray();
            userNamesInf.put(user.getAccount());
            userNamesInfs.put(userNamesInf);
        }
        setSuccess(Key.GROUP_GET_MEMBERS_SUCCESS, "" + userNamesInfs);
        return userNamesInfs;
    }

    /**
     * Find to which groups the user belongs
     *
     * @param userName the user
     */
    public JSONArray getGroupsList(int userId) {
        GroupDao groupDao = new GroupDao(this.dbSession);
        User usr;
        UserDao usrDao = new UserDao(this.dbSession);
        List<Group> groups = groupDao.loadGroupsByMember(userId);
        JSONArray groupNamesInfs = new JSONArray();
        for ( Group group : groups ) {
            JSONArray groupNamesInf = new JSONArray();
            usr = usrDao.get(group.getOwner());
            groupNamesInf.put(group.getName());
            groupNamesInf.put(usr.getUserName());
            groupNamesInfs.put(groupNamesInf);
        }
        setSuccess(Key.USER_GET_GROUPS_SUCCESS, "" + groupNamesInfs);
        return groupNamesInfs;
    }

    /**
     * create a given group owned by a given user. Overwrites an existing group if mayExist == true.
     *
     * @param groupName the name of the program
     * @param userId the owner of the program
     * @throws Exception
     */
    public Group persistGroup(String groupName, int userId) throws Exception {
        Pattern p = Pattern.compile("[^a-zA-Z0-9=+!?.,%#+&^@_ ]", Pattern.CASE_INSENSITIVE);
        Matcher group_symbols = p.matcher(groupName);
        boolean group_check = group_symbols.find();
        if ( group_check || groupName.isEmpty() ) {
            setError(Key.GROUP_ERROR_NAME_INVALID, groupName);
            return null;
        } else {
            if ( this.httpSessionState.isUserLoggedIn() ) {
                GroupDao groupDao = new GroupDao(this.dbSession);
                Group result;
                result = groupDao.persistGroup(groupName, userId);
                if ( result == null ) {
                    setError(Key.GROUP_CREATE_ERROR_NOT_SAVED_TO_DB);
                }
                return result;
            } else {
                setError(Key.USER_ERROR_NOT_LOGGED_IN);
                return null;
            }
        }
    }

    /**
     * delete a given group
     *
     * @param groupName the name of the program
     */
    public void deleteByName(String groupName) {
        GroupDao groupDao = new GroupDao(this.dbSession);
        int rowCount = groupDao.deleteByName(groupName);
        if ( rowCount > 0 ) {
            setSuccess(Key.GROUP_DELETE_SUCCESS);
        } else {
            setError(Key.GROUP_DELETE_ERROR);
        }
    }
}
