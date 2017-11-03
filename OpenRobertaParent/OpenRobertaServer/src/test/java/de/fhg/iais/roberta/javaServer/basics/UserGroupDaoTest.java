package de.fhg.iais.roberta.javaServer.basics;

import org.hibernate.Session;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import de.fhg.iais.roberta.persistence.bo.UserGroup;
import de.fhg.iais.roberta.persistence.dao.UserGroupDao;
import de.fhg.iais.roberta.persistence.util.DbSession;
import de.fhg.iais.roberta.persistence.util.DbSetup;
import de.fhg.iais.roberta.persistence.util.SessionFactoryWrapper;

public class UserGroupDaoTest {
    private SessionFactoryWrapper sessionFactoryWrapper;
    private DbSetup memoryDbSetup;
    private String connectionUrl;
    private Session nativeSession;
    private DbSession hSession;
    UserGroupDao userGroupDao;

    @Before
    public void setup() throws Exception {
        this.connectionUrl = "jdbc:hsqldb:mem:createNewGroupDb";
        this.sessionFactoryWrapper = new SessionFactoryWrapper("hibernate-test-cfg.xml", this.connectionUrl);
        this.nativeSession = this.sessionFactoryWrapper.getNativeSession();
        this.memoryDbSetup = new DbSetup(this.nativeSession);
        this.memoryDbSetup.createEmptyDatabase();
        this.hSession = this.sessionFactoryWrapper.getSession();
        this.userGroupDao = new UserGroupDao(this.hSession);
    }

    @Test
    public void persistUserGroupNotNull() throws Exception {
        UserGroup userGroup = this.userGroupDao.persistUserGroup("Roberta", "TestGroup138");
        this.hSession.commit();
        Assert.assertNotNull(userGroup);
    }

    @Test
    public void persistUserGroupNull() throws Exception {
        UserGroup userGroup = this.userGroupDao.persistUserGroup("Roberta", "TestGroup");
        this.hSession.commit();
        Assert.assertNull(userGroup);
    }

    @Test
    public void deleteByIds() throws Exception {
        int deleted = this.userGroupDao.deleteByIds("Roberta", "TestGroup1");
        this.hSession.commit();
        Assert.assertTrue(deleted == 1);
    }

    @Test
    public void deleteByIdsNotDeleted() throws Exception {
        int deleted = this.userGroupDao.deleteByIds("Roberta", "TestGroup138");
        this.hSession.commit();
        Assert.assertTrue(deleted == 0);
    }

}
