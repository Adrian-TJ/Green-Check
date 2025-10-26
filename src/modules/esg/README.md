# ESG Scoring System Documentation

This document explains how each pillar of the ESG (Environment, Social, Governance) scoring system is calculated.

## Overview

The ESG scoring system evaluates corporate sustainability across three pillars:
- **Environment (E)**: Resource consumption and efficiency
- **Social (S)**: Workforce equity, training, and wellbeing
- **Governance (G)**: Ethics and anti-corruption policies

Each pillar is scored on a **0-100 scale**, and the final ESG score is the **average of all three pillars**.

---

## Environment Score (0-100)

**Location**: `src/modules/resources/services/getEnvironmentScore.ts`

### Calculation Method

Uses **weighted scoring** based on environmental impact (CO2 footprint). Resources with higher carbon emissions have more weight in the final score.

### Resource Weights

| Resource    | Weight | Environmental Impact      |
|-------------|--------|---------------------------|
| Water       | 15%    | Low carbon footprint      |
| Electricity | 35%    | High carbon (grid mix)    |
| Gas         | 30%    | High carbon (combustion)  |
| Transport   | 20%    | Medium-high carbon        |

### Formula

**Step 1:** Calculate individual resource score (0-100):
```typescript
reduction% = ((baseline - current) / baseline) * 100
score = min(max(reduction% + 50, 0), 100)

// -100% (doubled) → 0 pts
//    0% (no change) → 50 pts
// +100% (eliminated) → 100 pts
```

**Step 2:** Apply weights and normalize:
```typescript
weightedScore = (aguaScore × 0.15) +
                (luzScore × 0.35) +
                (gasScore × 0.30) +
                (transporteScore × 0.20)

normalizedScore = weightedScore / totalWeight  // 0-100
```

### Example

```
Baseline: agua=1300m³, luz=850kWh, gas=600m³, transporte=500L
Current:  agua=1040m³, luz=700kWh, gas=570m³, transporte=200L

Individual scores:
Water:       20% reduction → 70/100
Electricity: 18% reduction → 68/100
Gas:          5% reduction → 55/100
Transport:   60% reduction → 100/100

Weighted calculation:
(70×0.15) + (68×0.35) + (55×0.30) + (100×0.20) = 70.8

Environment Score = 71/100 ✓
```

**See detailed documentation:** `src/modules/resources/ENVIRONMENT_SCORING.md`

---

## Social Score (0-100)

**Location**: `src/modules/social/services/getSocial.ts`

### Calculation Method

Uses **weighted scoring** aligned with UN Sustainable Development Goals (SDGs) across four social responsibility dimensions.

### Social Dimension Weights

| Dimension   | Weight | SDG Alignment | Focus                              |
|-------------|--------|---------------|------------------------------------|
| Equity      | 30%    | SDG 5, 10     | Gender balance & inclusion         |
| Development | 25%    | SDG 4, 8      | Training & skills development      |
| Wellbeing   | 25%    | SDG 3, 8      | Employee satisfaction & health     |
| Protection  | 20%    | SDG 1, 11     | Social security & community        |

### Formula

**Step 1:** Calculate individual dimension scores (0-100):

```typescript
// Equity: Gender balance in workforce + leadership
equityScore = workforceBalance(50pts) + leadershipBalance(50pts)

// Development: Training hours (normalized to 80h/year ILO standard)
developmentScore = min((training_hours / 80) × 100, 100)

// Wellbeing: Employee satisfaction
wellbeingScore = satisfaction_rate × 100

// Protection: Insurance coverage + community programs
protectionScore = (insuranceRatio × 70) + (community ? 30 : 0)
```

**Step 2:** Apply weights:

```typescript
socialScore =
  (equityScore × 0.30) +
  (developmentScore × 0.25) +
  (wellbeingScore × 0.25) +
  (protectionScore × 0.20)
```

### Example

```
Women: 8, Men: 15, Leadership: 2/6 women
Training: 45h, Satisfaction: 85%
Insurance: 18/23, Community: Yes

Equity:      60/100 (workforce 27 + leadership 33)
Development: 56/100 (45/80 hours)
Wellbeing:   85/100 (85% satisfaction)
Protection:  85/100 (insurance 55 + community 30)

Weighted:
(60×0.30) + (56×0.25) + (85×0.25) + (85×0.20) = 70/100 ✓
```

**See detailed documentation:** `src/modules/social/SOCIAL_SCORING.md`

---

## Governance Score (0-100)

**Location**: `src/modules/governance/services/getGovernance.ts`

### Calculation Method

Uses **weighted scoring with policy maturity assessment**. Scores increase over time as policies become embedded in organizational culture.

### Governance Components

| Component       | Weight | Focus                                    |
|-----------------|--------|------------------------------------------|
| Ethics Code     | 50%    | Foundational governance & ethical culture|
| Anti-Corruption | 50%    | Risk management & compliance             |

### Formula

Each policy receives:
- **Base Score** (60 pts) - For having the policy
- **Maturity Bonus** (40 pts) - Increases +10 pts per period since adoption (max 40)

```typescript
if (has_policy) {
  baseScore = 60
  periodsSinceAdoption = current_period - adoption_period
  maturityBonus = min(periodsSinceAdoption × 10, 40)
  policyScore = baseScore + maturityBonus
} else {
  policyScore = 0
}

governanceScore =
  (ethicsScore × 0.50) +
  (antiCorruptionScore × 0.50)
```

### Example Timeline

```
Period 0: No policies → 0/100
Period 2: Ethics adopted → (60×0.5) + (0×0.5) = 30/100
Period 4: Anti-C adopted → (80×0.5) + (60×0.5) = 70/100
Period 8: Both mature → (100×0.5) + (100×0.5) = 100/100 ✓
```

**Rationale:** Policy maturation reflects real-world implementation time needed for training, cultural integration, and effectiveness.

**See detailed documentation:** `src/modules/governance/GOVERNANCE_SCORING.md`

---

## ESG Total Score

**Location**: `src/modules/esg/hooks/useESG.ts`

### Calculation Method

The ESG total score is the **simple average** of the three pillar scores, calculated only for dates where **all three pillars have data**.

### Formula

```typescript
const esgScore = Math.round(
  (environmentScore + socialScore + governanceScore) / 3
);
```

### Date Alignment

The system ensures data integrity by:
1. Collecting scores from all three pillars
2. Grouping by date
3. **Only calculating ESG score when all three pillars exist for that date**
4. Sorting results chronologically

### Example

```
Date: 2024-11-01
Environment: 75/100
Social: 68/100
Governance: 100/100

ESG Score = (75 + 68 + 100) / 3 = 81/100
```

---

## Data Flow

```
┌─────────────────────────────────────────────────┐
│ Database (PostgreSQL via Prisma)               │
│ - resources (agua, luz, gas, transporte)       │
│ - social (employees, training, satisfaction)   │
│ - governance (ethics, anti-corruption)         │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ Backend Services (Server Actions)              │
│ - getEnvironmentScoreService()                 │
│ - getSocialService()                           │
│ - getGovernanceService()                       │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ Adapters (Client-side API wrappers)            │
│ - getEnvironmentScoreAdapter()                 │
│ - getSocialAdapter()                           │
│ - getGovernanceAdapter()                       │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ Custom Hooks (TanStack Query)                  │
│ - useESG() - Combines all three pillars        │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ Dashboard Components                            │
│ - ESGGaugeCard (circular gauge)                │
│ - ResourceMetricCard (trend cards)             │
│ - ResourceChart (historical charts)            │
└─────────────────────────────────────────────────┘
```

---

## Score Interpretation

| Score Range | Rating      | Description                                    |
|-------------|-------------|------------------------------------------------|
| 90-100      | Excellent   | Outstanding sustainability performance         |
| 75-89       | Good        | Strong sustainability practices                |
| 60-74       | Satisfactory| Moderate sustainability efforts                |
| 40-59       | Needs Work  | Significant room for improvement               |
| 0-39        | Poor        | Major sustainability concerns                  |

---

## Implementation Notes

1. **Seed Data**: Database is seeded with 12 bimonthly entries for all three pillars (aligned dates)
2. **Real-time Updates**: Scores recalculate automatically when new data is added
3. **Historical Tracking**: All scores maintain full history for trend analysis
4. **Animations**: Gauge card uses CSS transitions for smooth score animations
5. **Type Safety**: All scores use TypeScript interfaces for type checking
