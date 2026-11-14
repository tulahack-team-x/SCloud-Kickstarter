package wtf.tulahack.kickstarter.identify.internal.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import wtf.tulahack.kickstarter.shared.model.AccountRole;
import wtf.tulahack.kickstarter.shared.persistence.StoredEntity;

@Getter
@Setter
@NoArgsConstructor
@DatabaseTable(tableName = "accounts")
public class UserAccount extends StoredEntity {
    @DatabaseField(canBeNull = false, unique = true, width = 254)
    private String email;

    @JsonIgnore
    @DatabaseField(canBeNull = false, width = 100)
    private String passwordHash;

    @DatabaseField(canBeNull = false, width = 100)
    private String name;

    @DatabaseField(canBeNull = false)
    private AccountRole role;
}
