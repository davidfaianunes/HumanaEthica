describe('Enrollment', () => {
    beforeEach(() => {
        cy.deleteAllButArs();
        cy.demoEnrollmentLogin();
    });

    afterEach(() => {
        cy.deleteAllButArs();
    });

    it('create enrollment', () => {
        const MOTIVATION = "GAIN EXPERIENCE"

        // As member
        cy.demoMemberLogin();
        cy.intercept("GET", '/users/*/getInstitution').as("getInstitutions");
        cy.intercept('GET', '/themes/availableThemes').as('availableThemes')

        cy.get('[data-cy="institution"]').click();
        cy.get('[data-cy="activities"]').click();
        cy.wait("@getInstitutions");
        cy.wait("@availableThemes");

        // check if there are 3 activities in the table
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .should("have.length", 3)
            .eq(0)
            .children()
            .should("have.length", 12)

        // check if the first activity has no applications
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0)
            .children()
            .eq(3)
            .should("contain", 0)

        cy.logout();

        // As volunteer
        cy.demoVolunteerLogin();

        cy.intercept("GET", "/activities").as("getActivities");
        cy.intercept("GET", "/enrollments/volunteer").as("getVolunteerEnrollments");
        cy.intercept('POST', "/activities/*/enrollments").as("postEnrollment");

        cy.get('[data-cy="volunteerActivities"]').click();
        cy.wait("@getActivities");
        cy.wait("@getVolunteerEnrollments");

        // enroll in the first activity
        cy.get('[data-cy="newEnrollment"]').eq(0).click();
        cy.get('[data-cy="motivationInput"]').type(MOTIVATION);

        cy.get('[data-cy="createEnrollment"]').click();
        cy.wait("@postEnrollment");

        cy.logout();

        // As member
        cy.demoMemberLogin();

        cy.intercept('GET', '/users/*/getInstitution').as('getInstitution');
        cy.intercept('GET', '/themes/availableThemes').as('availableThemes')
        cy.get('[data-cy="institution"]').click();
        cy.get('[data-cy="activities"]').click();
        cy.wait("@getInstitution");
        cy.wait("@availableThemes");

        // check if the first activity has 1 application
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0)
            .children()
            .eq(3)
            .should("contain", 1)

        // check motivation
        cy.intercept('GET', '/activities/*/enrollments').as('getActivityEnrollments');

        cy.get('[data-cy="showEnrollments"]').eq(0).click();
        cy.wait("@getActivityEnrollments");

        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .should("have.length", 1)
        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .eq(0).children().eq(0).should('contain', MOTIVATION)

        cy.logout();
    });
});
