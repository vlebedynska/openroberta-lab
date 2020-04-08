package de.fhg.iais.roberta.persistence.dao;

import java.sql.Timestamp;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

import org.apache.commons.lang3.NotImplementedException;
import org.hibernate.Query;

import de.fhg.iais.roberta.persistence.bo.User;
import de.fhg.iais.roberta.persistence.bo.UserGroup;
import de.fhg.iais.roberta.persistence.util.DbSession;
import de.fhg.iais.roberta.util.Key;
import de.fhg.iais.roberta.util.Pair;
import de.fhg.iais.roberta.util.dbc.Assert;

/**
 * DAO class to operate on userGroup objects. A DAO object is always bound to a session. This session defines the transactional context, in which the database
 * access takes place.
 *
 * @author eovchinnik & pmaurer
 */
public class UserGroupDao extends AbstractDao<UserGroup> {

    /**
     * create a new DAO for groups. This creation is cheap.
     *
     * @param session the session used to access the database.
     */
    public UserGroupDao(DbSession session) {
        super(UserGroup.class, session);
    }

    /**
     * persist a group object that is owned by the User 'owner'
     *
     * @param groupName the name of the group, never null
     * @param groupOwner the user who owns this group, never null
     * @param timestamp timestamp of the last change of the group (if this call is an update of the group); <code>null</code> if a new group is saved
     * @return a pair of (message-key, group). If the group is persisted successfully, the group is NOT null.
     */
    public Pair<Key, UserGroup> persistGroup(String groupName, User groupOwner, Timestamp timestamp) //
    {
        Assert.notNull(groupName);
        Assert.notNull(groupOwner);

        UserGroup group = this.loadByName(groupName);
        if ( group == null ) {
            if ( timestamp == null ) {
                group = new UserGroup(groupName, groupOwner);
                this.session.save(group);
                return Pair.of(Key.GROUP_CREATE_SUCCESS, group);
            } else {
                return Pair.of(Key.GROUP_UPDATE_ERROR_NOT_FOUND, null);
            }
        } else {
            if ( timestamp == null ) {
                return Pair.of(Key.GROUP_CREATE_ERROR_ALREADY_EXISTS, null);
            } else {
                if ( group.getOwner().getId() != groupOwner.getId() ) {
                    return Pair.of(Key.GROUP_UPDATE_ERROR_NOT_OWNER, null);
                }
                //TODO: Implement update persisting
                throw new NotImplementedException("Persist UserGroup update");
            }
        }
    }

    /**
     * load a group from the database, identified by its owner, its name (both make up the "business" key of a group)<br>
     * The timestamp used for optimistic locking is <b>not</b> checked here. <b>The caller is responsible to do that!</b>
     *
     * @param groupName the name of the program, never null
     * @param groupOwner user who owns the program, never null
     * @return the group, maybe null
     */
    public UserGroup load(String groupName, User groupOwner) {
        Assert.notNull(groupName);
        Assert.notNull(groupOwner);

        Query hql = this.session.createQuery("from UserGroup where name=:groupName and owner=:owner");
        hql.setString("groupName", groupName);
        hql.setEntity("owner", groupOwner);

        @SuppressWarnings("unchecked")
        List<UserGroup> il = hql.list();
        Assert.isTrue(il.size() <= 1);

        return il.size() == 0 ? null : il.get(0);
    }

    /**
     * TODO: Change unique index in SQL statement to be on the groupName only
     *
     * @param groupName
     * @return
     */
    public UserGroup loadByName(String groupName) {
        Assert.notNull(groupName);

        Query hql = this.session.createQuery("from UserGroup where name=:groupName");
        hql.setString("groupName", groupName);

        @SuppressWarnings("unchecked")
        List<UserGroup> il = hql.list();
        Assert.isTrue(il.size() <= 1);

        return il.size() == 0 ? null : il.get(0);
    }

    public int delete(String groupName, User groupOwner) {
        //Assert check on not null happens in this.load
        UserGroup toBeDeleted = this.load(groupName, groupOwner);

        if ( toBeDeleted == null ) {
            return 0;
        }

        this.session.delete(toBeDeleted);
        return 1;
    }

    /**
     * load all userGroups persisted in the database which are owned by a given user
     *
     * @return the list of all userGroups, may be an empty list, but never null
     */
    public List<UserGroup> loadAll(User groupOwner) {
        Assert.notNull(groupOwner);

        Query hql = this.session.createQuery("from UserGroup g where owner=:owner order by g.name asc");
        hql.setEntity("owner", groupOwner);
        @SuppressWarnings("unchecked")
        List<UserGroup> il = hql.list();

        return Collections.unmodifiableList(il);
    }

    public int getNumberOfGroupsOfOwner(User groupOwner) {
        Assert.notNull(groupOwner);

        Query hql = this.session.createQuery("select count(id) from UserGroup g where owner=:owner");
        hql.setEntity("owner", groupOwner);

        @SuppressWarnings("unchecked")
        Iterator<Integer> resultIterator = hql.iterate();

        return resultIterator.hasNext() ? resultIterator.next().intValue() : 0;
    }

    /*
     * TODO: Move to Processor
     */
    public boolean isValidGroupOwner(User owner) {
        //TODO: Add check for public server
        return owner != null && owner.getEmail() != null && owner.getGroup() == null && (owner.isActivated() || false);
    }

    /**
     * TODO: Move to Processor
     *
     * @param groupName
     * @return
     */
    public boolean isValidGroupName(String groupName) {
        //UserName pattern: Pattern p = Pattern.compile("[^a-zA-Z0-9=+!?.,%#+&^@_\\- ]", Pattern.CASE_INSENSITIVE);
        return groupName != null;
    }

    /**
     * rename a group object that is owned by the User 'owner'. The group to be renamed must exist.
     * TODO: Add renaming of all student accounts, as well.
     *
     * @param groupName the name of the group, never null
     * @param newGroupName the new name of the group, never null
     * @param groupOwner the user who owns this group, never null
     * @param timestamp timestamp of the last change of the group (if this call is an update of the group); <code>null</code> if a new group is saved
     * @return a pair of (message-key, group). If the group is persisted successfully, the group is NOT null.
     */
    public Pair<Key, UserGroup> renameGroup(String groupName, String newGroupName, User groupOwner, Timestamp timestamp) {
        Assert.notNull(groupName);
        Assert.notNull(newGroupName);
        Assert.notNull(groupOwner);

        UserGroup group = this.load(groupName, groupOwner);
        Assert.notNull(group);

        UserGroup newGroup = this.loadByName(newGroupName);
        if ( newGroup != null ) {
            return Pair.of(Key.GROUP_CREATE_ERROR_ALREADY_EXISTS, null);
        }
        group.rename(newGroupName);
        return Pair.of(Key.GROUP_RENAME_SUCCESS, group);
    }

    /**
     * create a write lock for the table USERGROUP to avoid deadlocks. This is a no op if concurrency control is not 2PL, but MVCC
     */
    public void lockTable() {
        this.session.createSqlQuery("lock table USERGROUP write").executeUpdate();
        this.session.addToLog("lock", "is now aquired");
    }
}
