package de.fhg.iais.roberta.persistence.bo;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import de.fhg.iais.roberta.util.Util;
import de.fhg.iais.roberta.util.dbc.Assert;

@Entity
@Table(name = "ACCESSRIGHT_HISTORY")
public class AccessRightHistory implements WithSurrogateId {
    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "USERGROUP_ID")
    private Group group;

    @Column(name = "CREATED")
    private Timestamp created;

    @Enumerated(EnumType.STRING)
    @Column(name = "OLD_ACCESS_RIGHT")
    private AccessRight oldAccessRight;

    protected AccessRightHistory() {
        // Hibernate
    }

    /**
     * create a new access right history
     *
     * @param group the group whose access rights we consider
     */
    public AccessRightHistory(Group group, AccessRight accessRightToSave) {
        Assert.notNull(group);
        this.group = group;
        this.oldAccessRight = accessRightToSave;
        this.created = Util.getNow();
    }

    @Override
    public int getId() {
        return this.id;
    }

    /**
     * get the old access right
     *
     * @return the oldAccessRight, never <code>null</code>
     */

    public AccessRight getOldAccessRight() {
        return this.oldAccessRight;
    }

    /**
     * get the user, who is the owner
     *
     * @return the owner, never <code>null</code>
     */
    public Group getGroup() {
        return this.group;
    }

    public Timestamp getCreated() {
        return this.created;
    }

    @Override
    public String toString() {
        return "AccessRightHistory [id=" + this.id + ", old access right=" + this.oldAccessRight + ", created=" + this.created + "]";
    }
}
