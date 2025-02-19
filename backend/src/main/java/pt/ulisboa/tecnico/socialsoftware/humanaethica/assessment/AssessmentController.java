package pt.ulisboa.tecnico.socialsoftware.humanaethica.assessment;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.assessment.dto.AssessmentDto;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.auth.domain.AuthUser;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.enrollment.dto.EnrollmentDto;

import java.security.Principal;
import java.util.List;

@RestController()
@RequestMapping
public class AssessmentController {
    @Autowired
    AssessmentService assessmentService;

    @GetMapping("/institutions/{institutionId}/assessments")
    public List<AssessmentDto> getInstitutionAssessments(@PathVariable Integer institutionId) {
        return assessmentService.getAssessmentsByInstitution(institutionId);
    }

    @GetMapping("/assessment/volunteer")
    @PreAuthorize("(hasRole('ROLE_VOLUNTEER'))")
    public List<AssessmentDto> getVolunteerAssessments(Principal principal) {
        int userId = ((AuthUser) ((Authentication) principal).getPrincipal()).getUser().getId();
        return assessmentService.getVolunteerAssessments(userId);
    }

    @PostMapping("/institutions/{institutionId}/assessments")
    @PreAuthorize("(hasRole('ROLE_VOLUNTEER'))")
    public AssessmentDto createAssessment(Principal principal, @PathVariable Integer institutionId, @Valid @RequestBody AssessmentDto assessmentDto) {
        int userId = ((AuthUser) ((Authentication) principal).getPrincipal()).getUser().getId();
        return assessmentService.createAssessment(userId, institutionId, assessmentDto);
    }
}
