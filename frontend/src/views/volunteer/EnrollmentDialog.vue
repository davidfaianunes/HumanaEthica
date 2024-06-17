<template>
  <v-dialog v-model="dialog" persistent width="1300">
    <v-card>
      <v-card-title>
        <span class="headline">New Application</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" lazy-validation>
          <v-row>
            <v-col cols="12">
              <v-text-field
                label="*Motivation"
                required
                v-model="newEnrollment.motivation"
                data-cy="motivationInput"
                :rules="[(v) => v.length >= 10 || 'Motivation must be at least 10 characters']"
            ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="$emit('close-enrollment-dialog')"
        >
          Close
        </v-btn>
        <v-btn
          v-if="validMotivation()"
          color="blue-darken-1"
          variant="text"
          @click="createEnrollment"
          data-cy="createEnrollment"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {Vue, Component, Prop, Model} from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import Enrollment from '@/models/enrollment/Enrollment';
import Activity from '@/models/activity/Activity';

@Component({})
export default class EnrollmentDialog extends Vue {
  @Model('dialog', Boolean) dialog!: boolean;
  @Prop({ type: Activity, required: true }) readonly activity!: Activity;
  newEnrollment: Enrollment = new Enrollment();
  activityId: number | null = null;


  async created() {
    this.newEnrollment = new Enrollment();
    this.activityId = this.activity.id as number;
  }

  validMotivation() {
    return (
      this.newEnrollment.motivation != null &&
      this.newEnrollment.motivation.length >= 10
    );
  }

  async createEnrollment() {
    if ((this.$refs.form as Vue & { validate: () => boolean }).validate()) {
      try {
        const result = await RemoteServices.createEnrollment(this.activityId as number, this.newEnrollment);
        this.$emit('save-enrollment', result);

      } catch (error) {
        console.error(error);
      }
    }
  }
}
</script>

<style scoped lang="scss"></style>
