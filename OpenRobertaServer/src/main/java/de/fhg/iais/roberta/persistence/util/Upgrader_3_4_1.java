package de.fhg.iais.roberta.persistence.util;

import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * medium complex upgrade to version 3.4.1
 *
 * @author rbudde
 */
public class Upgrader_3_4_1 {
    private static final Logger LOG = LoggerFactory.getLogger(Upgrader_3_4_1.class);

    private final SessionFactoryWrapper sessionFactoryWrapper;
    private Session nativeSession;

    Upgrader_3_4_1(SessionFactoryWrapper sessionFactoryWrapper) {
        this.sessionFactoryWrapper = sessionFactoryWrapper;
    }

    /**
     * execute the update<br>
     * run the script update-3-4-1.sql
     */
    public void run() {
        this.nativeSession = this.sessionFactoryWrapper.getNativeSession();
        DbSetup dbSetup = new DbSetup(this.nativeSession);
        dbSetup
            .sqlFile(
                null, //
                null,
                "/update-3-4-1.sql");
        this.nativeSession.createSQLQuery("shutdown").executeUpdate();
        this.nativeSession.close();
    }
}
