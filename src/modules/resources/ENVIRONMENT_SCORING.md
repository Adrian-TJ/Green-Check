# Environment Score Calculation

## Overview

The Environment score (0-100) evaluates resource consumption efficiency using **weighted scoring** based on environmental impact (CO2 footprint).

---

## Weighted Scoring System

### Resource Weights (Total = 100%)

| Resource    | Weight | Rationale                                    |
|-------------|--------|----------------------------------------------|
| Water       | 15%    | Low carbon footprint                         |
| Electricity | 35%    | High carbon (depends on energy grid mix)     |
| Gas         | 30%    | High carbon (natural gas combustion)         |
| Transport   | 20%    | Medium-high carbon (gasoline combustion)     |

**Why weighted?** Resources with higher carbon emissions have more environmental impact and therefore contribute more to the overall score.

---

## Calculation Formula

### Step 1: Calculate Individual Resource Scores (0-100 scale)

For each resource type:

```typescript
// Measure reduction vs baseline (first measurement)
reduction% = ((baseline - current) / baseline) * 100

// Convert to 0-100 score
// -100% (doubled) → 0 pts
//    0% (no change) → 50 pts
// +100% (eliminated) → 100 pts
score = min(max(reduction% + 50, 0), 100)
```

**Examples:**
```
Baseline: 1000 units
Current: 800 units
Reduction: 20%
Score: 20 + 50 = 70/100 ✓

Baseline: 1000 units
Current: 1200 units
Reduction: -20% (increased!)
Score: -20 + 50 = 30/100 ✗

Baseline: 1000 units
Current: 500 units
Reduction: 50%
Score: 50 + 50 = 100/100 ✓✓
```

### Step 2: Apply Weights

```typescript
weightedScore = (aguaScore × 0.15) +
                (luzScore × 0.35) +
                (gasScore × 0.30) +
                (transporteScore × 0.20)
```

### Step 3: Normalize (handles missing data)

```typescript
// If all 4 resources present: totalWeight = 1.0
// If only 3 present: totalWeight = 0.85 (for example)
normalizedScore = weightedScore / totalWeight

// Result is always 0-100
```

---

## Real Example (Based on Seed Data)

### Period 1 (Jan 2024) - BASELINE
```
Water:       1300 m³
Electricity: 850 kWh
Gas:         600 m³
Transport:   500 L
```

### Period 6 (Nov 2024)
```
Water:       1144 m³  (-12% reduction)
Electricity: 760 kWh  (-11% reduction)
Gas:         576 m³   (-4% reduction)
Transport:   405 L    (-19% reduction)
```

### Individual Scores:
```
Water:       12 + 50 = 62/100
Electricity: 11 + 50 = 61/100
Gas:          4 + 50 = 54/100
Transport:   19 + 50 = 69/100
```

### Weighted Calculation:
```
weightedScore = (62 × 0.15) + (61 × 0.35) + (54 × 0.30) + (69 × 0.20)
              = 9.3 + 21.35 + 16.2 + 13.8
              = 60.65

Environment Score = 61/100 (rounded)
```

---

## Period 12 (Nov 2025) - Projection
```
Water:       1040 m³  (-20% reduction)
Electricity: 700 kWh  (-18% reduction)
Gas:         570 m³   (-5% reduction)
Transport:   200 L    (-60% reduction)
```

### Individual Scores:
```
Water:       20 + 50 = 70/100
Electricity: 18 + 50 = 68/100
Gas:          5 + 50 = 55/100
Transport:   60 + 50 = 100/100 (capped)
```

### Weighted Calculation:
```
weightedScore = (70 × 0.15) + (68 × 0.35) + (55 × 0.30) + (100 × 0.20)
              = 10.5 + 23.8 + 16.5 + 20
              = 70.8

Environment Score = 71/100 ✓
```

---

## Converting to 0-1 Scale (Optional)

If you need a 0-1 scale instead of 0-100:

```typescript
// Simply divide by 100
score_0_to_1 = normalizedScore / 100

// Example:
// 71/100 → 0.71
// 50/100 → 0.50
// 95/100 → 0.95
```

To implement this, change line 113 in `getEnvironmentScore.ts`:

```typescript
// Current (0-100):
score: Math.round(Math.min(Math.max(normalizedScore, 0), 100))

// Alternative (0-1):
score: parseFloat((Math.min(Math.max(normalizedScore, 0), 100) / 100).toFixed(2))
```

---

## Key Features

✅ **Weighted by Environmental Impact** - High-carbon resources matter more
✅ **Normalized to 0-100** - Easy to interpret (percentage-like)
✅ **Handles Missing Data** - Automatically renormalizes if resources unavailable
✅ **Baseline Comparison** - Tracks improvement over time
✅ **Capped at Extremes** - Prevents unrealistic scores from outliers

---

## Adjusting Weights

You can customize weights based on your region's carbon grid mix:

```typescript
// Example: Renewable energy region (lower electricity impact)
const weights = {
  agua: 0.20,       // Increase water weight
  luz: 0.25,        // Decrease electricity (greener grid)
  gas: 0.35,        // Increase gas weight
  transporte: 0.20, // Keep transport same
};

// Example: Heavy industry (more gas usage)
const weights = {
  agua: 0.10,
  luz: 0.30,
  gas: 0.40,        // Increase gas impact
  transporte: 0.20,
};
```

**Note:** Always ensure weights sum to 1.0 (100%) for proper normalization.
