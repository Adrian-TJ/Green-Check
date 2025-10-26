# Social Score Calculation

## Overview

The Social score (0-100) evaluates workforce equity, development, wellbeing, and social protection using **weighted scoring** aligned with UN Sustainable Development Goals (SDGs).

---

## Weighted Scoring System

### Social Dimension Weights (Total = 100%)

| Dimension   | Weight | SDG Alignment | Focus                                      |
|-------------|--------|---------------|--------------------------------------------|
| Equity      | 30%    | SDG 5, 10     | Gender balance & inclusion                 |
| Development | 25%    | SDG 4, 8      | Training & skills development              |
| Wellbeing   | 25%    | SDG 3, 8      | Employee satisfaction & health             |
| Protection  | 20%    | SDG 1, 11     | Social security & community engagement     |

---

## Calculation Formula

### 1. Equity Score (0-100)

Measures gender balance in workforce and leadership positions.

```typescript
// Workforce balance (50 pts) - closer to 50/50 is better
workforceRatio = min(women, men) / max(women, men)
workforceBalance = workforceRatio × 50

// Leadership balance (50 pts) - ideal is 40-60% women
leadershipRatio = women_in_leadership / total_leadership

if (0.4 ≤ leadershipRatio ≤ 0.6) {
  leadershipBalance = 50  // Perfect balance
} else {
  deviation = |leadershipRatio - 0.5|
  leadershipBalance = max(0, 50 - deviation × 100)
}

equityScore = workforceBalance + leadershipBalance
```

**Example:**
```
Workforce: 15 men, 8 women
Leadership: 4 men, 2 women

Workforce: 8/15 = 0.53 → 0.53 × 50 = 26.5 pts
Leadership: 2/6 = 0.33 → deviation = 0.17 → 50 - 17 = 33 pts

Equity Score = 26.5 + 33 = 59.5/100
```

### 2. Development Score (0-100)

Based on training hours per employee, normalized to ILO recommended 80 hours/year.

```typescript
developmentScore = min((training_hours / 80) × 100, 100)
```

**Example:**
```
Training: 45 hours/year
Score = (45/80) × 100 = 56.25 → 56/100
```

### 3. Wellbeing Score (0-100)

Direct conversion from employee satisfaction rate.

```typescript
wellbeingScore = satisfaction_rate × 100
```

**Example:**
```
Satisfaction: 0.85 (85%)
Score = 0.85 × 100 = 85/100
```

### 4. Protection Score (0-100)

Combination of social security coverage and community engagement.

```typescript
// Insurance coverage (70 pts)
insuranceRatio = insured_employees / total_employees
insuranceScore = insuranceRatio × 70

// Community programs (30 pts)
communityScore = has_community_programs ? 30 : 0

protectionScore = insuranceScore + communityScore
```

**Example:**
```
Employees: 23 total, 18 insured
Community programs: Yes

Insurance: (18/23) × 70 = 54.8 pts
Community: 30 pts

Protection Score = 54.8 + 30 = 84.8 → 85/100
```

---

## Weighted Total Calculation

```typescript
socialScore =
  (equityScore × 0.30) +
  (developmentScore × 0.25) +
  (wellbeingScore × 0.25) +
  (protectionScore × 0.20)
```

---

## Complete Example (Period 6)

### Input Data:
```
Men: 15, Women: 8
Men in leadership: 4, Women in leadership: 2
Training hours: 45
Satisfaction rate: 0.85
Insured: 18, Uninsured: 5
Community programs: Yes
```

### Individual Scores:
```
Equity:      59.5/100 (workforce 26.5 + leadership 33)
Development: 56/100   (45/80 hours)
Wellbeing:   85/100   (85% satisfaction)
Protection:  85/100   (insurance 55 + community 30)
```

### Weighted Calculation:
```
socialScore = (59.5 × 0.30) + (56 × 0.25) + (85 × 0.25) + (85 × 0.20)
            = 17.85 + 14 + 21.25 + 17
            = 70.1

Social Score = 70/100 ✓
```

---

## Score Progression (Seed Data)

| Period | Women | Leadership | Training | Satisfaction | Community | Score |
|--------|-------|------------|----------|--------------|-----------|-------|
| 1      | 6     | 1/5        | 22h      | 74%          | No        | ~58   |
| 3      | 7     | 1/5        | 24h      | 77%          | Yes       | ~63   |
| 6      | 8     | 2/6        | 28h      | 81%          | Yes       | ~67   |
| 9      | 9     | 2/6        | 32h      | 85%          | Yes       | ~71   |
| 12     | 10    | 3/7        | 36h      | 89%          | Yes       | ~75   |

Shows progressive improvement across all dimensions! 📈

---

## Key Features

✅ **SDG-Aligned** - Mapped to UN Sustainable Development Goals
✅ **Multi-dimensional** - Covers equity, development, wellbeing, protection
✅ **Balanced Leadership** - Rewards 40-60% diversity range (not just 50/50)
✅ **ILO Standards** - Training normalized to 80h/year recommendation
✅ **Normalized 0-100** - Consistent with other ESG pillars

---

## Customizing Weights

Adjust based on company priorities or industry standards:

```typescript
// Example: Tech startup (high focus on development)
const weights = {
  equity: 0.25,
  development: 0.35,  // Increased for skills focus
  wellbeing: 0.25,
  protection: 0.15,
};

// Example: Manufacturing (high focus on protection)
const weights = {
  equity: 0.25,
  development: 0.20,
  wellbeing: 0.20,
  protection: 0.35,   // Increased for safety/security
};
```

**Note:** Always ensure weights sum to 1.0 (100%).
