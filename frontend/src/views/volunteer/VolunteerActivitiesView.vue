<template>
  <div>
    <v-card class="table">
      <v-data-table
          :headers="headers"
          :items="activities"
          :search="search"
          disable-pagination
          :hide-default-footer="true"
          :mobile-breakpoint="0"
          data-cy="volunteerActivitiesTable"
      >
        <template v-slot:top>
          <v-card-title>
            <v-text-field
                v-model="search"
                append-icon="search"
                label="Search"
                class="mx-2"
            />
            <v-spacer />
          </v-card-title>
        </template>
        <template v-slot:[`item.themes`]="{ item }">
          <v-chip v-for="theme in item.themes" v-bind:key="theme.id">
            {{ theme.completeName }}
          </v-chip>
        </template>
        <template v-slot:[`item.action`]="{ item }">
          <v-tooltip v-if="item.state === 'APPROVED'" bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                class="mr-2 action-button"
                color="red"
                v-on="on"
                data-cy="reportButton"
                @click="reportActivity(item)"
              >warning
              </v-icon>
            </template>
            <span>Report Activity</span>
          </v-tooltip>
          <v-tooltip v-if="checkAssessmentConditions(item)" bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                  class="mr-2 action-button"
                  color="blue"
                  v-on="on"
                  data-cy="newAssessment"
                  @click="newAssessment(item)"
              >mdi-square-edit-outline</v-icon
              >
            </template>
            <span>Write Assessment</span>
          </v-tooltip>
          <v-tooltip v-if="item.state === 'APPROVED'
           && !afterEnrollmentDate(item) && !alreadyEnrolled(item)" bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                  class="mr-2 action-button"
                  color="blue"
                  v-on="on"
                  data-cy="newEnrollment"
                  @click="newEnrollment(item)"
              >login</v-icon
              >
            </template>
            <span>Apply for Activity</span>
          </v-tooltip>
        </template>
      </v-data-table>
      <assessment-dialog
        v-if="assessmentDialog && currentAssessment && currentInstitution"
        v-model="assessmentDialog"
        :assessment="currentAssessment"
        :institution="currentInstitution"
        @close-assessment-dialog="onCloseAssessmentDialog"
        @save-assessment="onSaveAssessment"
      />
      <enrollment-dialog
          v-if="currentActivity && enrollmentDialog"
          v-model="enrollmentDialog"
          :activity="currentActivity"
          v-on:save-enrollment="onSaveEnrollment"
          v-on:close-enrollment-dialog="onCloseEnrollmentDialog"
      />
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import Activity from '@/models/activity/Activity';
import { show } from 'cli-cursor';
import AssessmentDialog from '@/views/volunteer/AssessmentDialog.vue';
import Assessment from '@/models/assessment/Assessment';
import Participation from '@/models/participation/Participation';
import Institution from '@/models/institution/Institution';
import EnrollmentDialog from './EnrollmentDialog.vue';
import Enrollment from '@/models/enrollment/Enrollment';

@Component({
  computed: {
    Institution() {
      return Institution
    }
  },
  components: {
    'enrollment-dialog': EnrollmentDialog,
    'assessment-dialog': AssessmentDialog,
  },
  methods: { show },
})
export default class VolunteerActivitiesView extends Vue {
  activities: Activity[] = [];
  participations: Participation[] = [];
  assessments: Assessment[] = [];
  enrollments: Enrollment[] = [];
  search: string = '';

  currentAssessment: Assessment | null = null;
  currentInstitution: Institution | null = null;
  assessmentDialog: boolean = false;


  currentActivity: Activity | null = null;
  enrollmentDialog: boolean = false;

  headers: object = [
    {
      text: 'Name',
      value: 'name',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Region',
      value: 'region',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Participants',
      value: 'participantsNumberLimit',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Themes',
      value: 'themes',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Description',
      value: 'description',
      align: 'left',
      width: '30%',
    },
    {
      text: 'State',
      value: 'state',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Start Date',
      value: 'formattedStartingDate',
      align: 'left',
      width: '5%',
    },
    {
      text: 'End Date',
      value: 'formattedEndingDate',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Application Deadline',
      value: 'formattedApplicationDeadline',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Actions',
      value: 'action',
      align: 'left',
      sortable: false,
      width: '5%',
    },
  ];

  async created() {
    await this.$store.dispatch('loading');
    try {
      this.activities = await RemoteServices.getActivities();
      this.participations = await RemoteServices.getVolunteerParticipations();
      this.assessments = await RemoteServices.getVolunteerAssessments();
      this.enrollments = await RemoteServices.getVolunteerEnrollments();
    } catch (error) {
      await this.$store.dispatch('error', error);
    }
    await this.$store.dispatch('clearLoading');
  }

  async reportActivity(activity: Activity) {
    if (activity.id !== null) {
      try {
        const result = await RemoteServices.reportActivity(
              this.$store.getters.getUser.id,
              activity.id,
        );
        this.activities = this.activities.filter((a) => a.id !== activity.id);
        this.activities.unshift(result);
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
    }
  }

  newAssessment(activity: Activity) {
    this.currentAssessment = new Assessment();
    this.currentInstitution = new Institution(activity.institution);
    this.assessmentDialog = true;
  }

  onCloseAssessmentDialog() {
    this.assessmentDialog = false;
    this.currentAssessment = null;
    this.currentInstitution = null;
  }

  onSaveAssessment(assessment: Assessment) {
    this.assessments.push(assessment);
    this.onCloseAssessmentDialog();
  }

  checkAssessmentConditions(activity: Activity) {
    return (
        this.checkActivityDate(activity) &&
        this.volunteerHasParticipationOnActivity(activity) &&
        !this.volunteerAlreadyAssessedInstitution(activity)
    );
  }

  checkActivityDate(activity: Activity) {
    return new Date(activity.endingDate) < new Date();
  }

  volunteerAlreadyAssessedInstitution(activity: Activity) {
    return this.assessments.some(
        (assessment) =>
            assessment.institutionId === activity.institution.id
    );
  }

  volunteerHasParticipationOnActivity(activity: Activity) {
    return this.participations.some(
        (participation) =>
            participation.activityId === activity.id
    );
  }

  afterEnrollmentDate(activity: Activity) {
    const now = new Date();
    const applicationDeadline = new Date(activity.applicationDeadline);

    return (now > applicationDeadline);
  }

  alreadyEnrolled(activity: Activity) {
    if(activity.id === null) return false;

    return (this.enrollments.filter((e) => e.activityId == activity.id).length > 0);
  }

  newEnrollment(activity: Activity) {
    this.currentActivity = activity;
    this.enrollmentDialog = true;
  }

  onCloseEnrollmentDialog() {
    this.currentActivity = null;
    this.enrollmentDialog = false;
  }

  onSaveEnrollment(enrollment: Enrollment) {
    this.enrollments.unshift(enrollment);
    this.enrollmentDialog = false;
    this.currentActivity = null;
  }
}
</script>

<style lang="scss" scoped></style>