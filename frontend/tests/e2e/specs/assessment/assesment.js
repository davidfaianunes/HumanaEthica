describe('Assessment', () => {
  beforeEach(() => {
    cy.deleteAllButArs();
    cy.createAssessmentEntities();
  });

  afterEach(() => {
    cy.deleteAllButArs();
  });

  it('Creates an assessment', () => {
    const ASSESSMENT_TEXT = "VERY NICE, I LIKE!";

    // As a volunteer:
    cy.demoVolunteerLogin();
    cy.intercept("GET", "/activities").as("getActivities");
    cy.intercept("GET", "/participations/volunteer").as("getParticipations");
    cy.intercept("GET", "/assessment/volunteer").as("getAssessments");
    cy.get('[data-cy="volunteerActivities"]').click();
    cy.wait("@getActivities");
    cy.wait("@getParticipations");
    cy.wait("@getAssessments");

    // 1) Verify that the activity table has 6 rows
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .should("have.length", 6);
    // 2) Verify that the first activity has the name "A1"
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
        .eq(0)
        .children()
        .eq(0)
        .should("contain.text", "A1");

    // 3) Create an assessment for the first activity
    cy.intercept("POST", "/institutions/*/assessments").as("postAssessment");
    cy.get('[data-cy="newAssessment"]').eq(0).click();
    cy.get('[data-cy="reviewInput"]').type(ASSESSMENT_TEXT);
    cy.get('[data-cy="createAssessment"]').click();
    cy.wait("@postAssessment");

    cy.logout();

    // As a member:
    cy.demoMemberLogin();
    cy.intercept("GET", '/users/*/getInstitution').as("getInstitutions");
    cy.intercept('GET', '/institutions/*/assessments').as('assessments')

    cy.get('[data-cy="institution"]').click();
    cy.get('[data-cy="assessments"]').click();
    cy.wait("@getInstitutions");
    cy.wait("@assessments");

    // 1) Verify that the assessment table has only 1 row
    cy.get('[data-cy="institutionAssessmentsTable"] tbody tr')
        .should("have.length", 1);

    // 2) Verify that the assessment has the review ASSESSMENT_TEXT
    cy.get('[data-cy="institutionAssessmentsTable"] tbody tr')
        .eq(0)
        .children()
        .eq(0)
        .should("contain.text", ASSESSMENT_TEXT);

    cy.logout();
  });
});