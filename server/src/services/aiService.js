/**
 * Smart Campus AI Engine
 * Provides deterministic prioritization, risk calculation, and smart resource allocation scoring,
 * with optional LLM integration.
 */

export const calculateIncidentAIScore = (incidentData) => {
  const { category, severity, affectedPeople = 1, location = '', slaStatus = 'On Track' } = incidentData;

  let score = 0;
  const breakdown = [];

  // Severity Weight (Max 35)
  if (severity === 'Critical') {
    score += 35;
    breakdown.push('Critical Severity (+35)');
  } else if (severity === 'High') {
    score += 25;
    breakdown.push('High Severity (+25)');
  } else if (severity === 'Medium') {
    score += 15;
    breakdown.push('Medium Severity (+15)');
  } else {
    score += 5;
    breakdown.push('Low Severity (+5)');
  }

  // Category Risk Weight (Max 30)
  const highRiskCategories = ['Medical', 'Fire', 'Security'];
  const midRiskCategories = ['Electrical', 'Infrastructure', 'Network'];
  
  if (highRiskCategories.includes(category)) {
    score += 30;
    breakdown.push(`High Hazard Category [${category}] (+30)`);
  } else if (midRiskCategories.includes(category)) {
    score += 18;
    breakdown.push(`Operations Critical Category [${category}] (+18)`);
  } else {
    score += 10;
    breakdown.push(`Standard Category [${category}] (+10)`);
  }

  // Affected People Impact (Max 20)
  const count = Number(affectedPeople) || 1;
  if (count >= 100) {
    score += 20;
    breakdown.push(`Mass Impact (>100 people: ${count}) (+20)`);
  } else if (count >= 50) {
    score += 15;
    breakdown.push(`High Impact (50-99 people: ${count}) (+15)`);
  } else if (count >= 20) {
    score += 10;
    breakdown.push(`Medium Impact (20-49 people: ${count}) (+10)`);
  } else if (count >= 5) {
    score += 6;
    breakdown.push(`Local Impact (5-19 people: ${count}) (+6)`);
  } else {
    score += 3;
    breakdown.push(`Isolated Impact (<5 people: ${count}) (+3)`);
  }

  // Location Vulnerability (Max 10)
  const highVulnerabilityZones = ['Server Room', 'Medical Center', 'Hostel A', 'Hostel B', 'Main Ground', 'Chemistry Lab', 'Power Substation'];
  const isHighRiskLoc = highVulnerabilityZones.some(loc => location.toLowerCase().includes(loc.toLowerCase()));
  if (isHighRiskLoc) {
    score += 10;
    breakdown.push(`Critical Campus Zone [${location}] (+10)`);
  } else {
    score += 4;
    breakdown.push(`Standard Zone [${location}] (+4)`);
  }

  // SLA Urgency (Max 5)
  if (slaStatus === 'Breached') {
    score += 5;
    breakdown.push('SLA Breached (+5)');
  } else if (slaStatus === 'At Risk') {
    score += 3;
    breakdown.push('SLA At Risk (+3)');
  }

  // Clamp score between 10 and 99
  const finalScore = Math.min(99, Math.max(10, Math.round(score)));

  // Suggested Priority
  let suggestedPriority = 'Low';
  if (finalScore >= 80) suggestedPriority = 'Critical';
  else if (finalScore >= 60) suggestedPriority = 'High';
  else if (finalScore >= 35) suggestedPriority = 'Medium';

  return {
    aiScore: finalScore,
    suggestedPriority,
    reasoning: `AI Evaluated Risk: ${finalScore}%. Factors: ${breakdown.join(' | ')}.`
  };
};

/**
 * Smart Resource Allocation Recommendation Engine
 */
export const calculateStaffSuitability = (incident, staffList) => {
  const incCategory = (incident.category || '').toLowerCase();
  const incDesc = `${incident.title || ''} ${incident.description || ''}`.toLowerCase();

  return staffList.map(staff => {
    let skillMatchScore = 30; // base score
    const skills = staff.skills || [];
    
    // Check keyword overlaps
    const matchedSkills = [];
    skills.forEach(skill => {
      const sk = skill.toLowerCase();
      if (incCategory.includes(sk) || incDesc.includes(sk) || sk.includes(incCategory)) {
        skillMatchScore += 35;
        matchedSkills.push(skill);
      }
    });
    skillMatchScore = Math.min(98, skillMatchScore);

    // Department match
    let deptScore = 40;
    const staffDept = (staff.department || '').toLowerCase();
    if (
      (incCategory === 'medical' && staffDept.includes('medical')) ||
      (incCategory === 'security' && staffDept.includes('security')) ||
      ((incCategory === 'network' || incCategory === 'electrical') && (staffDept.includes('it') || staffDept.includes('technical'))) ||
      ((incCategory === 'fire' || incCategory === 'infrastructure') && (staffDept.includes('facilities') || staffDept.includes('emergency')))
    ) {
      deptScore = 100;
    }

    // Availability
    let availScore = 20;
    if (staff.availability === 'AVAILABLE') availScore = 100;
    else if (staff.availability === 'BUSY') availScore = 45;
    else if (staff.availability === 'OFF_DUTY') availScore = 0;

    // Workload Capacity (inverse of workloadPercentage)
    const workloadCapacity = Math.max(0, 100 - (staff.workloadPercentage || 0));

    // Composite suitability score (Weighted)
    const overallSuitability = Math.round(
      (skillMatchScore * 0.40) +
      (deptScore * 0.25) +
      (availScore * 0.20) +
      (workloadCapacity * 0.15)
    );

    return {
      staffId: staff._id,
      name: staff.name,
      email: staff.email,
      department: staff.department,
      skills: staff.skills,
      availability: staff.availability,
      workloadPercentage: staff.workloadPercentage,
      skillMatchScore,
      matchedSkills,
      overallSuitability: Math.min(99, Math.max(15, overallSuitability)),
      isRecommended: false // will be set for top candidate
    };
  }).sort((a, b) => b.overallSuitability - a.overallSuitability);
};
