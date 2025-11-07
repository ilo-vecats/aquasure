# PERT Chart Description
## AquaSure Project - Program Evaluation and Review Technique

**Project:** AquaSure - Drinking Water Quality Check System  
**Team:** PureLogic  
**Duration:** September 1 - October 15, 2024

---

## PERT Activities Table

| ID | Activity | Predecessors | Optimistic (days) | Most Likely (days) | Pessimistic (days) | Expected Duration (days) | Start Date | End Date |
|----|----------|-------------|-------------------|-------------------|-------------------|-------------------------|------------|----------|
| A | Requirements & SRS | - | 2 | 4 | 6 | 4.0 | Sep 1 | Sep 4 |
| B | System Design (UML, DB) | A | 2 | 4 | 6 | 4.0 | Sep 5 | Sep 8 |
| C | Frontend MVP | B | 4 | 6 | 8 | 6.0 | Sep 9 | Sep 14 |
| D | Backend MVP | B | 4 | 6 | 8 | 6.0 | Sep 9 | Sep 14 |
| E | Integration & QI | C, D | 3 | 4 | 6 | 4.0 | Sep 15 | Sep 18 |
| F | Testing & QA (TQM) | E | 3 | 5 | 7 | 5.0 | Sep 19 | Sep 23 |
| G | Deployment & Docs | F | 1 | 2 | 3 | 2.0 | Sep 24 | Sep 25 |

---

## Expected Duration Calculation

**Formula:** Expected Duration = (Optimistic + 4×Most Likely + Pessimistic) / 6

**Example for Activity A:**
- Expected = (2 + 4×4 + 6) / 6 = 24 / 6 = 4.0 days

---

## Critical Path Analysis

**Critical Path:** A → B → C → E → F → G

**Total Expected Duration:**
- A (4) + B (4) + C (6) + E (4) + F (5) + G (2) = **25 days**

**Note:** Activities C and D can run in parallel (both depend on B), but C is on the critical path.

---

## Activity Dependencies

```
A (Requirements)
  ↓
B (System Design)
  ↓
  ├─→ C (Frontend MVP)
  └─→ D (Backend MVP)
      ↓
      E (Integration) ← C
      ↓
      F (Testing)
      ↓
      G (Deployment)
```

---

## Float/Slack Analysis

- **Activity A:** Critical (0 float)
- **Activity B:** Critical (0 float)
- **Activity C:** Critical (0 float)
- **Activity D:** Has float (can start later, but must finish before E)
- **Activity E:** Critical (0 float)
- **Activity F:** Critical (0 float)
- **Activity G:** Critical (0 float)

---

## Risk Assessment

**High Risk Activities:**
- **C (Frontend MVP):** Complex UI components, chart integration
- **D (Backend MVP):** Database design, API development
- **E (Integration):** Frontend-backend integration challenges

**Mitigation:**
- Early prototyping
- Parallel development where possible
- Regular team communication
- Buffer time included in schedule

---

## PERT Chart Visualization

To create the visual PERT chart, use one of these tools:
1. **MS Project** - Import the activity table
2. **draw.io** - Create network diagram
3. **Lucidchart** - Drag-and-drop PERT chart
4. **ProjectLibre** - Open-source project management

**Chart Elements:**
- Nodes: Activities (A, B, C, D, E, F, G)
- Arrows: Dependencies
- Critical Path: Highlighted in red
- Duration: Shown on each activity

---

## Timeline Summary

- **Week 1 (Sep 1-7):** Activities A, B
- **Week 2 (Sep 8-14):** Activities B, C, D
- **Week 3 (Sep 15-21):** Activities E, F (start)
- **Week 4 (Sep 22-28):** Activities F, G
- **Week 5-7 (Sep 29 - Oct 15):** Buffer, refinement, documentation

**Total Project Duration:** 45 days (6.5 weeks)  
**Critical Path Duration:** 25 days  
**Buffer Time:** 20 days (for contingencies, refinement, documentation)

---

## Notes for PERT Software

When importing into PERT software:

1. **Activities:** Use the ID column (A, B, C, etc.)
2. **Dependencies:** Use Predecessors column
3. **Duration:** Use Expected Duration column
4. **Dates:** Use Start Date and End Date columns
5. **Resources:** Assign team members to activities

**Export Format:** PNG or PDF for documentation

---

**Generated:** September 2024  
**For:** Total Quality Management Assignment

