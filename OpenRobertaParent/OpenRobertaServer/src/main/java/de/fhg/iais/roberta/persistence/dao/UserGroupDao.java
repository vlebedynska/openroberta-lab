package de.fhg.iais.roberta.persistence.dao;

import java.util.List;

import org.hibernate.Query;

import de.fhg.iais.roberta.persistence.bo.UserGroup;
import de.fhg.iais.roberta.persistence.util.DbSession;
import de.fhg.iais.roberta.util.dbc.Assert;

/**
 * DAO class to load and store programs objects. A DAO object is always bound to a session. This session defines the transactional context, in which the
 * database access takes place.
 */
public class UserGroupDao extends AbstractDao<UserGroup> {

    /**
     * create a new DAO for user groups. This creation is cheap.
     *
     * @param session the session used to access the database.
     */

    UserDao ud;
    GroupDao gd;

    public UserGroupDao(DbSession session) {
        super(UserGroup.class, session);
        this.ud = new UserDao(session);
        this.gd = new GroupDao(session);
    }

    public UserGroup persistUserGroup(String accountName, String groupName) throws Exception {
        Assert.notNull(accountName);
        Assert.notNull(groupName);
        UserGroup userGroup = loadUserGroup(accountName, groupName);
        if ( this.ud.loadUser(accountName) == null ) {
            return null;
        }
        int userId = this.ud.loadUser(accountName).getId();
        int groupId = this.gd.loadGroup(groupName).getId();
        if ( userGroup == null ) {
            userGroup = new UserGroup(userId, groupId);
            this.session.save(userGroup);
            return userGroup;
        } else {
            return null;
        }
    }

    /**
     * load all groups persisted in the database which are owned by a user given
     *
     * @return the list of all groups, may be an empty list, but never null
     */

    public UserGroup loadUserGroup(String accountName, String groupName) {
        Assert.notNull(accountName);
        Assert.notNull(groupName);
        if ( this.ud.loadUser(accountName) == null ) {
            return null;
        }
        int userId = this.ud.loadUser(accountName).getId();
        int groupId = this.gd.loadGroup(groupName).getId();
        Query hql = this.session.createQuery("from UserGroup where userId=:userId and groupId=:groupId");
        hql.setDouble("userId", userId);
        hql.setDouble("groupId", groupId);
        return checkUserGroupExistance(hql);
    }

    private UserGroup checkUserGroupExistance(Query hql) {
        @SuppressWarnings("unchecked")
        final List<UserGroup> il = hql.list();
        Assert.isTrue(il.size() <= 1);
        if ( il.size() == 0 ) {
            return null;
        } else {
            return il.get(0);
        }
    }

    public int deleteByIds(String userName, String groupName) {
        Assert.notNull(userName);
        Assert.notNull(groupName);
        UserGroup toBeDeleted = loadUserGroup(userName, groupName);
        if ( toBeDeleted == null ) {
            return 0;
        } else {
            this.session.delete(toBeDeleted);
            return 1;
        }
    }

}
