package de.fhg.iais.roberta.persistence.bo;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "USER_GROUP")
public class UserGroup implements WithSurrogateId {
    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "USER_ID")
    private int userId;

    @Column(name = "GROUPS_ID")
    private int groupId;

    protected UserGroup() {
        // Hibernate
    }

    public UserGroup(int userId, int groupId) {
        this.userId = userId;
        this.groupId = groupId;
    }

    /**
     * assign a new user group
     *
     * @param user id - id of the user whom we assign the group
     * @param group id - id of the group that is being assigned
     */

    @Override
    public int getId() {
        return this.id;
    }

    public int getUser() {
        return this.userId;
    }

    public int getGroup() {
        return this.groupId;
    }

    @Override
    public String toString() {
        return "UserGroup [id=" + this.id + ", userId=" + this.userId + ", group=" + this.groupId + "]";
    }

}
