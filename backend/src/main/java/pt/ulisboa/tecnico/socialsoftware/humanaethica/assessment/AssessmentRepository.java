package pt.ulisboa.tecnico.socialsoftware.humanaethica.assessment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.assessment.domain.Assessment;
import pt.ulisboa.tecnico.socialsoftware.humanaethica.enrollment.domain.Enrollment;

import java.util.List;

@Repository
@Transactional
public interface AssessmentRepository extends JpaRepository<Assessment, Integer> {
    @Query("SELECT a FROM Assessment a WHERE a.institution.id = :institutionId")
    List<Assessment> getAssessmentsByInstitutionId(Integer institutionId);

    @Query("SELECT e FROM Assessment e WHERE e.volunteer.id = :userId")
    List<Assessment> getAssessmentsForVolunteerId(Integer userId);
}
