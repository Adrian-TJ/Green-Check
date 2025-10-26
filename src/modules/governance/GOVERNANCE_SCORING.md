# Governance Score Calculation

## Overview

The Governance score (0-100) evaluates corporate governance practices with **weighted scoring** and **policy maturity assessment**.

---

## Weighted Scoring System

### Governance Components (Total = 100%)

| Component       | Weight | Focus                                          |
|-----------------|--------|------------------------------------------------|
| Ethics Code     | 50%    | Foundational governance & ethical culture      |
| Anti-Corruption | 50%    | Risk management & compliance                   |

**Equal weighting** reflects that both are fundamental pillars of good governance.

---

## Calculation Formula

### Two-Stage Scoring

Each policy component receives:
1. **Base Score** (60 pts) - For having the policy
2. **Maturity Bonus** (40 pts) - For policy maturation over time

### 1. Ethics Code Score (0-100)

```typescript
if (has_codigo_etica) {
  baseScore = 60  // Having policy in place

  // Maturity bonus: +10 pts per period since adoption
  periodsSinceAdoption = current_period - adoption_period
  maturityBonus = min(periodsSinceAdoption × 10, 40)

  ethicsScore = baseScore + maturityBonus
} else {
  ethicsScore = 0
}
```

**Rationale:** Simply having a policy is not enough. Effective governance requires time for:
- Policy internalization
- Training and awareness
- Cultural integration
- Continuous improvement

### 2. Anti-Corruption Score (0-100)

Same calculation as Ethics Code:

```typescript
if (has_anti_corrupcion) {
  baseScore = 60
  periodsSinceAdoption = current_period - adoption_period
  maturityBonus = min(periodsSinceAdoption × 10, 40)

  antiCorruptionScore = baseScore + maturityBonus
} else {
  antiCorruptionScore = 0
}
```

### 3. Weighted Total

```typescript
governanceScore =
  (ethicsScore × 0.50) +
  (antiCorruptionScore × 0.50)
```

---

## Real Example (Based on Seed Data)

### Policy Adoption Timeline:
```
Period 0 (Jan 2024):  No policies → 0/100
Period 2 (May 2024):  Ethics code adopted
Period 4 (Sep 2024):  Anti-corruption adopted
Period 12 (Nov 2025): Both policies mature
```

### Score Progression:

#### Period 0-1 (Before any policies)
```
Ethics: 0
Anti-Corruption: 0

Governance Score = 0/100
```

#### Period 2 (Ethics code just adopted)
```
Ethics: 60 (base) + 0 (0 periods mature) = 60
Anti-Corruption: 0 (not yet adopted)

Governance Score = (60 × 0.5) + (0 × 0.5) = 30/100
```

#### Period 3 (1 period after ethics)
```
Ethics: 60 + 10 (1 period) = 70
Anti-Corruption: 0

Governance Score = (70 × 0.5) + (0 × 0.5) = 35/100
```

#### Period 4 (Anti-corruption adopted)
```
Ethics: 60 + 20 (2 periods) = 80
Anti-Corruption: 60 + 0 (just adopted) = 60

Governance Score = (80 × 0.5) + (60 × 0.5) = 70/100
```

#### Period 6 (Both maturing)
```
Ethics: 60 + 40 (4 periods, maxed) = 100
Anti-Corruption: 60 + 20 (2 periods) = 80

Governance Score = (100 × 0.5) + (80 × 0.5) = 90/100
```

#### Period 12 (Both fully mature)
```
Ethics: 60 + 40 (maxed at 4+ periods) = 100
Anti-Corruption: 60 + 40 (maxed at 4+ periods) = 100

Governance Score = (100 × 0.5) + (100 × 0.5) = 100/100 ✓
```

---

## Maturity Stages

| Periods Since Adoption | Maturity Bonus | Stage          | Characteristics                    |
|------------------------|----------------|----------------|------------------------------------|
| 0                      | 0 pts          | Initial        | Policy just documented             |
| 1                      | +10 pts        | Awareness      | Training begins                    |
| 2                      | +20 pts        | Implementation | Processes established              |
| 3                      | +30 pts        | Integration    | Culture shift visible              |
| 4+                     | +40 pts (max)  | Mature         | Embedded in organizational DNA     |

---

## Complete Timeline Visualization

```
Period  │ Ethics │ Anti-C │ Score │ Stage
━━━━━━━━┼━━━━━━━━┼━━━━━━━━┼━━━━━━━┼━━━━━━━━━━━━━━━━━
0       │   0    │   0    │  0/100│ No policies
1       │   0    │   0    │  0/100│ No policies
2       │  60    │   0    │ 30/100│ Ethics adopted ✓
3       │  70    │   0    │ 35/100│ Ethics maturing
4       │  80    │  60    │ 70/100│ Anti-C adopted ✓
5       │  90    │  70    │ 80/100│ Both maturing
6       │ 100    │  80    │ 90/100│ Ethics mature
7       │ 100    │  90    │ 95/100│ Both nearly mature
8+      │ 100    │ 100    │100/100│ Both fully mature ✓
```

---

## Key Features

✅ **Progressive Scoring** - Rewards policy maturation, not just adoption
✅ **Realistic Timeline** - Acknowledges governance takes time to implement
✅ **Incentivizes Early Adoption** - Earlier adoption = higher scores sooner
✅ **Normalized 0-100** - Consistent with other ESG pillars
✅ **Weighted & Balanced** - Both components equally important

---

## Future Enhancements

To make governance scoring even more robust, consider adding:

1. **Training Metrics**
   - % employees trained on ethics code
   - Hours of governance training per employee

2. **Incident Tracking**
   - Number of ethics violations reported
   - Resolution time for incidents

3. **Audit Compliance**
   - Internal audit scores
   - External certification (ISO, etc.)

4. **Board Diversity**
   - Board composition diversity
   - Independent directors ratio

5. **Transparency**
   - Public reporting frequency
   - Stakeholder engagement score

These would require additional database fields but would provide a more comprehensive governance assessment.

---

## Converting to 0-1 Scale

To use 0-1 scale instead of 0-100:

```typescript
// Current (0-100):
score: Math.round(weightedScore)

// Alternative (0-1):
score: parseFloat((weightedScore / 100).toFixed(2))
```
