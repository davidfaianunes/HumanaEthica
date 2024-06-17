<template>
  <v-dialog v-model="dialog" persistent width="1300">
    <v-card>
      <v-card-title>
        <span class="headline">New Assessment</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" lazy-validation>
          <v-row>
            <v-col cols="12">
              <v-text-field
                  label="*Review"
                  required
                  v-model="newAssessment.review"
                  data-cy="reviewInput"
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
            @click="$emit('close-assessment-dialog')"
        >
          Close
        </v-btn>
        <v-btn
            color="blue-darken-1"
            variant="text"
            @click="createAssessment"
            data-cy="createAssessment"
            v-if="newAssessment.review != null && newAssessment.review.length >= 10"
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
import Assessment from '@/models/assessment/Assessment';
import Institution from '@/models/institution/Institution';

@Component({})
export default class AssessmentDialog extends Vue {
  @Model('dialog', Boolean) dialog!: boolean;
  @Prop({ type: Assessment, required: true }) readonly assessment!: Assessment;
  @Prop({ type: Institution, required: true }) readonly institution!: Institution;

  newAssessment: Assessment = new Assessment();

  async created() {
    this.newAssessment = new Assessment(this.assessment);
  }

  async createAssessment() {
    if ((this.$refs.form as Vue & { validate: () => boolean }).validate()) {
      try {
        if (this.institution.id !== null) {
          const result = await RemoteServices.createAssessment(this.institution.id, this.newAssessment);
          this.$emit('save-assessment', result);
        }
      } catch (e) {
        await this.$store.dispatch('error', e);
      }
    }
  }
}
</script>

<style scoped lang="scss"></style>
