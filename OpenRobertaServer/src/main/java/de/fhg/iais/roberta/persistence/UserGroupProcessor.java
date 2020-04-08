package de.fhg.iais.roberta.persistence;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import de.fhg.iais.roberta.persistence.bo.AccessRight;
import de.fhg.iais.roberta.persistence.bo.User;
import de.fhg.iais.roberta.persistence.bo.UserGroup;
import de.fhg.iais.roberta.persistence.dao.UserGroupDao;
import de.fhg.iais.roberta.persistence.util.DbSession;
import de.fhg.iais.roberta.persistence.util.HttpSessionState;
import de.fhg.iais.roberta.util.Key;
import de.fhg.iais.roberta.util.Pair;

/**
 * @author pmaurer
 */
public class UserGroupProcessor extends AbstractProcessor {

    private final UserGroupDao userGroupDao;

    protected static final int OWNER_GROUP_LIMIT = 100;
    protected static final int GROUP_STUDENT_LIMIT = 100;
    private final boolean isPublicServer;

    public UserGroupProcessor(DbSession dbSession, HttpSessionState httpSessionState, boolean isPublicServer) {
        super(dbSession, httpSessionState.getUserId());
        this.isPublicServer = isPublicServer;

        this.userGroupDao = new UserGroupDao(this.dbSession);
    }

    public UserGroup getGroup(String groupName, User groupOwner) {
        if ( groupOwner == null || groupName == null ) {
            this.setStatus(ProcessorStatus.FAILED, Key.GROUP_GET_ONE_ERROR, new HashMap<>());
            return null;
        }

        if ( !this.canOwnGroup(groupOwner) ) {
            this.setStatus(ProcessorStatus.FAILED, Key.GROUP_ERROR_MISSING_RIGHTS_TO_BE_GROUP_OWNER, new HashMap<>());
            return null;
        }

        if ( !this.isValidGroupName(groupName) ) {
            this.setStatus(ProcessorStatus.FAILED, Key.GROUP_ERROR_NAME_INVALID, new HashMap<>());
            return null;
        }

        UserGroup group = this.userGroupDao.load(groupName, groupOwner);

        if ( group == null ) {
            this.setStatus(ProcessorStatus.FAILED, Key.GROUP_GET_ONE_ERROR_NAME_INCORRECT_OR_NOT_OWNER, new HashMap<>());
            return null;
        }

        this.setStatus(ProcessorStatus.SUCCEEDED, Key.GROUP_GET_ONE_SUCCESS, new HashMap<>());
        return group;
    }

    protected UserGroup getGroup(String groupName) {
        if ( groupName == null ) {
            this.setStatus(ProcessorStatus.FAILED, Key.GROUP_GET_ONE_ERROR, new HashMap<>());
            return null;
        }

        if ( !this.isValidGroupName(groupName) ) {
            this.setStatus(ProcessorStatus.FAILED, Key.GROUP_ERROR_NAME_INVALID, new HashMap<>());
            return null;
        }

        UserGroup group = this.userGroupDao.loadByName(groupName);

        if ( group == null ) {
            this.setStatus(ProcessorStatus.FAILED, Key.GROUP_GET_ONE_ERROR_NAME_INORRECT, new HashMap<>());
            return null;
        }

        this.setStatus(ProcessorStatus.SUCCEEDED, Key.GROUP_GET_ONE_SUCCESS, new HashMap<>());
        return group;
    }

    public List<UserGroup> getGroupsByOwner(User groupOwner) {
        if ( groupOwner == null ) {
            this.setStatus(ProcessorStatus.FAILED, Key.GROUP_GET_ALL_ERROR, new HashMap<>());
            return null;
        }

        if ( !this.canOwnGroup(groupOwner) ) {
            this.setStatus(ProcessorStatus.FAILED, Key.GROUP_ERROR_MISSING_RIGHTS_TO_BE_GROUP_OWNER, new HashMap<>());
            return null;
        }

        List<UserGroup> groups = this.userGroupDao.loadAll(groupOwner);

        this.setStatus(ProcessorStatus.SUCCEEDED, Key.GROUP_GET_ALL_SUCCESS, new HashMap<>());
        return groups;
    }

    public void createGroup(String groupName, User groupOwner) {
        if ( groupOwner == null || groupName == null ) {
            this.setStatus(ProcessorStatus.FAILED, Key.GROUP_CREATE_ERROR, new HashMap<>());
            return;
        }

        Map<String, String> processorParameters = new HashMap<>();
        processorParameters.put("USERGROUP_OWNER", groupOwner.getAccount());

        if ( !this.canOwnGroup(groupOwner) ) {
            this.setStatus(ProcessorStatus.FAILED, Key.GROUP_ERROR_MISSING_RIGHTS_TO_BE_GROUP_OWNER, processorParameters);
            return;
        }

        if ( this.userGroupDao.getNumberOfGroupsOfOwner(groupOwner) >= UserGroupProcessor.OWNER_GROUP_LIMIT ) {
            this.setStatus(ProcessorStatus.FAILED, Key.GROUP_CREATE_ERROR_OWNER_EXCEEDS_LIMIT, processorParameters);
            return;
        }

        processorParameters.put("USERGROUP_NAME", groupName);

        if ( !this.isValidGroupName(groupName) ) {
            this.setStatus(ProcessorStatus.FAILED, Key.GROUP_ERROR_NAME_INVALID, processorParameters);
            return;
        }

        if ( this.getGroup(groupName) != null ) {
            this.setStatus(ProcessorStatus.FAILED, Key.GROUP_CREATE_ERROR_ALREADY_EXISTS, processorParameters);
            return;
        }

        this.userGroupDao.lockTable();

        Pair<Key, UserGroup> createStatus = this.userGroupDao.persistGroup(groupName, groupOwner, null);

        if ( !createStatus.getFirst().equals(Key.GROUP_CREATE_SUCCESS) ) {
            this.setStatus(ProcessorStatus.FAILED, createStatus.getFirst(), processorParameters);
        }

        UserGroup group = createStatus.getSecond();

        //TODO: Currently only ADMIN_READ is supported. Implement other visibilities.
        group.setAccessRight(AccessRight.ADMIN_READ);
    }

    protected boolean canOwnGroup(User owner) {
        return owner != null && owner.getGroup() == null && (!this.isPublicServer || owner.getEmail() != null && owner.isActivated());
    }

    protected boolean isValidGroupName(String groupName) {
        //UserName pattern: Pattern p = Pattern.compile("[^a-zA-Z0-9=+!?.,%#+&^@_\\- ]", Pattern.CASE_INSENSITIVE);
        return groupName != null;
    }
}