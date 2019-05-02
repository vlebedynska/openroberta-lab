package de.fhg.iais.roberta.persistence.dao;

import java.sql.Timestamp;
import java.util.Collections;
import java.util.List;

import org.hibernate.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import de.fhg.iais.roberta.persistence.bo.Group;
import de.fhg.iais.roberta.persistence.bo.User;
import de.fhg.iais.roberta.persistence.util.DbSession;
import de.fhg.iais.roberta.util.Key;
import de.fhg.iais.roberta.util.Pair;
import de.fhg.iais.roberta.util.dbc.Assert;

/**
 * DAO class to operate on group objects. A DAO object is always bound to a session. This session defines the transactional context, in which the database
 * access takes place.
 *
 * @author eovchinnik
 */
public class GroupDao extends AbstractDao<Group> {
    private static final Logger LOG = LoggerFactory.getLogger(GroupDao.class);

    /**
     * create a new DAO for groups. This creation is cheap.
     *
     * @param session the session used to access the database.
     */
    public GroupDao(DbSession session) {
        super(Group.class, session);
    }

    /**
     * persist a group object that is owned by the User 'owner'
     *
     * @param groupName the name of the group, never null
     * @param owner the user who owns this group, never null
     * @param timestamp timestamp of the last change of the group (if this call is an update of the group); <code>null</code> if a new group is saved
     * @return a pair of (message-key, group). If the group is persisted successfully, the group is NOT null.
     */
    public Pair<Key, Group> persistGroup(String groupName, User owner, Timestamp timestamp) //
    {
        Assert.notNull(groupName);
        Assert.isTrue(isAllowedToHaveGroups(owner));
        Group group = load(groupName, owner);
        if ( group == null ) {
            if ( timestamp == null ) {
                group = new Group(groupName, owner);
                this.session.save(group);
                return Pair.of(Key.GROUP_CREATE_SUCCESS, group);
            } else {
                return Pair.of(Key.GROUP_TO_UPDATE_NOT_FOUND, null);
            }
        } else {
            return Pair.of(Key.GROUP_ALREADY_EXISTS, null);
        }
    }

    /**
     * load a group from the database, identified by its owner, its name (both make up the "business" key of a group)<br>
     * The timestamp used for optimistic locking is <b>not</b> checked here. <b>The caller is responsible to do that!</b>
     *
     * @param groupName the name of the program, never null
     * @param owner user who owns the program, never null
     * @return the group, maybe null
     */
    public Group load(String groupName, User owner) {
        Assert.notNull(groupName);
        Assert.isTrue(isAllowedToHaveGroups(owner));
        Query hql = this.session.createQuery("from Group where name=:groupName and owner=:owner");
        hql.setString("groupName", groupName);
        hql.setEntity("owner", owner);
        @SuppressWarnings("unchecked")
        List<Group> il = hql.list();
        Assert.isTrue(il.size() <= 1);
        return il.size() == 0 ? null : il.get(0);
    }

    public int deleteByName(String name, User owner) {
        Group toBeDeleted = load(name, owner);
        if ( toBeDeleted == null ) {
            return 0;
        } else {
            this.session.delete(toBeDeleted);
            return 1;
        }
    }

    /**
     * load all userGroups persisted in the database which are owned by a given user
     *
     * @return the list of all userGroups, may be an empty list, but never null
     */
    public List<Group> loadAll(User owner) {
        Query hql = this.session.createQuery("from Group g where owner=:owner order by g.name asc");
        hql.setEntity("owner", owner);
        @SuppressWarnings("unchecked")
        List<Group> il = hql.list();
        return Collections.unmodifiableList(il);
    }

    public boolean isAllowedToHaveGroups(User owner) {
        return (owner != null) && (owner.getEmail() != null) && (owner.getGroup() == null) && (owner.isActivated());
    }

    /**
     * rename a group object that is owned by the User 'owner'. The group to be renamed must exist.
     *
     * @param groupName the name of the group, never null
     * @param newGroupName the new name of the group, never null
     * @param owner the user who owns this group, never null
     * @param timestamp timestamp of the last change of the group (if this call is an update of the group); <code>null</code> if a new group is saved
     * @return a pair of (message-key, group). If the group is persisted successfully, the group is NOT null.
     */
    public Pair<Key, Group> renameGroup(String groupName, String newGroupName, User owner, Timestamp timestamp) //
    {
        Assert.notNull(groupName);
        Assert.notNull(newGroupName);
        Assert.isTrue(isAllowedToHaveGroups(owner));
        Group group = load(groupName, owner);
        Assert.notNull(group);
        Group newGroup = load(newGroupName, owner);
        if ( newGroup != null ) {
            return Pair.of(Key.GROUP_ALREADY_EXISTS, null);
        }
        group.rename(newGroupName);
        return Pair.of(Key.GROUP_RENAME_SUCCESS, group);
    }

}
