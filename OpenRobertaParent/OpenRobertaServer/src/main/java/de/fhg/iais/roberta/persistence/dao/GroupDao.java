package de.fhg.iais.roberta.persistence.dao;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.hibernate.Query;

import de.fhg.iais.roberta.persistence.bo.Group;
import de.fhg.iais.roberta.persistence.bo.User;
import de.fhg.iais.roberta.persistence.bo.UserGroup;
import de.fhg.iais.roberta.persistence.util.DbSession;
import de.fhg.iais.roberta.util.dbc.Assert;

/**
 * DAO class to load and store programs objects. A DAO object is always bound to a session. This session defines the transactional context, in which the
 * database access takes place.
 */
public class GroupDao extends AbstractDao<Group> {

    /**
     * create a new DAO for groups. This creation is cheap.
     *
     * @param session the session used to access the database.
     */
    public GroupDao(DbSession session) {
        super(Group.class, session);
    }

    public Group persistGroup(String groupName, int ownerId) throws Exception {
        Assert.notNull(groupName);
        Group group = loadGroup(groupName);
        UserDao ud = new UserDao(this.session);
        String ownerName = ud.loadUser(ownerId).getAccount();
        UserGroupDao userGroupDao = new UserGroupDao(this.session);
        if ( group == null ) {
            group = new Group(groupName, ownerId);
            this.session.save(group);
            userGroupDao.persistUserGroup(ownerName, groupName);
            return group;
        } else {
            return null;
        }
    }

    /**
     * load all groups persisted in the database which are owned by a user given
     *
     * @return the list of all groups, may be an empty list, but never null
     */

    public Group loadGroup(String groupName) {
        Assert.notNull(groupName);
        Query hql = this.session.createQuery("from Group where name=:name");
        hql.setString("name", groupName);
        return checkGroupExistance(hql);
    }

    public List<Group> loadOwnerGroups(int ownerId) {
        Query hql = this.session.createQuery("from Group where owner=:owner");
        hql.setInteger("owner", ownerId);
        @SuppressWarnings("unchecked")
        List<Group> il = hql.list();
        return Collections.unmodifiableList(il);
    }

    public List<User> loadMembersByGroup(String groupName) {
        Group group = this.loadGroup(groupName);
        UserDao userDao = new UserDao(this.session);
        int groupId = group.getId();
        Query hql = this.session.createQuery("from UserGroup where groupId=:groupId");
        hql.setInteger("groupId", groupId);
        @SuppressWarnings("unchecked")
        List<UserGroup> il = hql.list();
        System.out.println("List");
        System.out.println(il);
        List<User> users = new ArrayList<User>();
        for ( UserGroup usr : il ) {
            users.add(userDao.load(usr.getUser()));
        }
        return users;
    }

    public List<Group> loadGroupsByMember(int userId) {
        GroupDao groupDao = new GroupDao(this.session);
        Query hql = this.session.createQuery("from UserGroup where userId=:userId");
        hql.setInteger("userId", userId);
        @SuppressWarnings("unchecked")
        List<UserGroup> il = hql.list();
        List<Group> groups = new ArrayList<Group>();
        for ( UserGroup grp : il ) {
            groups.add(groupDao.load(grp.getGroup()));
        }
        return groups;
    }

    private Group checkGroupExistance(Query hql) {
        @SuppressWarnings("unchecked")
        final List<Group> il = hql.list();
        Assert.isTrue(il.size() <= 1);
        if ( il.size() == 0 ) {
            return null;
        } else {
            return il.get(0);
        }
    }

    public int deleteByName(String groupName) {
        final Group toBeDeleted = loadGroup(groupName);
        if ( toBeDeleted == null ) {
            return 0;
        } else {
            this.session.delete(toBeDeleted);
            return 1;
        }
    }
}
