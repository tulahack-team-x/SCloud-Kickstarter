package wtf.tulahack.kickstarter.composition.config;

import jakarta.annotation.PostConstruct;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Configuration;

import wtf.tulahack.kickstarter.files.internal.domain.Attachment;
import wtf.tulahack.kickstarter.funding.internal.domain.Contribution;
import wtf.tulahack.kickstarter.identify.internal.domain.UserAccount;
import wtf.tulahack.kickstarter.organization.internal.domain.Organization;
import wtf.tulahack.kickstarter.organization.internal.domain.OrganizationMember;
import wtf.tulahack.kickstarter.reputation.domain.CooperationReview;
import wtf.tulahack.kickstarter.research.internal.domain.ProjectReadGrant;
import wtf.tulahack.kickstarter.research.internal.domain.ProjectStage;
import wtf.tulahack.kickstarter.research.internal.domain.ProjectUpdate;
import wtf.tulahack.kickstarter.research.internal.domain.ResearchProject;
import wtf.tulahack.kickstarter.shared.persistence.Database;
import wtf.tulahack.kickstarter.work.internal.domain.OrderActivity;
import wtf.tulahack.kickstarter.work.internal.domain.OrderStage;
import wtf.tulahack.kickstarter.work.internal.domain.ResearchOrder;
import wtf.tulahack.kickstarter.work.internal.domain.ResearchProposal;
import wtf.tulahack.kickstarter.work.internal.domain.ResearchRequest;
import wtf.tulahack.kickstarter.work.internal.domain.StageReport;

import java.sql.SQLException;

@Configuration
@RequiredArgsConstructor
public class SchemaConfiguration {
    private final Database database;

    @PostConstruct
    public void initialize() throws SQLException {
        database.initialize(UserAccount.class);
        database.initialize(Organization.class);
        database.initialize(OrganizationMember.class);
        database.initialize(ResearchProject.class);
        database.initialize(ProjectStage.class);
        database.initialize(ProjectUpdate.class);
        database.initialize(ProjectReadGrant.class);
        database.initialize(ResearchRequest.class);
        database.initialize(ResearchProposal.class);
        database.initialize(ResearchOrder.class);
        database.initialize(OrderStage.class);
        database.initialize(StageReport.class);
        database.initialize(OrderActivity.class);
        database.initialize(Contribution.class);
        database.initialize(CooperationReview.class);
        database.initialize(Attachment.class);
    }
}
