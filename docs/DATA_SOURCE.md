# Data Source Documentation
## AquaSure - Jaipur Water Quality Sample Data

**Last Updated:** October 2024

---

## Data Overview

The sample data in the AquaSure system represents realistic water quality measurements from various locations in Jaipur, Rajasthan. This data is used for:
- System testing and validation
- Dashboard demonstration
- TQM process demonstration
- Quality control chart analysis

---

## Data Characteristics

### Sample Distribution
- **Total Samples:** 25 samples
- **Locations:** 15+ different areas across Jaipur
- **Time Range:** Samples spread over the last 30 days
- **Status Distribution:**
  - Safe: ~60% (QI ≥ 80)
  - Borderline: ~25% (50 ≤ QI < 80)
  - Unsafe: ~15% (QI < 50)

### Parameter Ranges (Reflecting Jaipur Conditions)

**pH Levels:**
- Range: 6.9 - 8.2
- Most common: 7.0 - 7.5
- Note: Some industrial areas show higher pH (8.0+)

**Total Dissolved Solids (TDS):**
- Range: 350 - 920 mg/L
- Good quality areas: 350-500 mg/L
- Moderate areas: 500-700 mg/L
- Areas of concern: 700-920 mg/L
- Note: Jaipur groundwater often shows elevated TDS due to geological factors

**Turbidity:**
- Range: 0.5 - 3.5 NTU
- Good quality: < 1.0 NTU
- Moderate: 1.0 - 2.0 NTU
- Areas of concern: > 2.0 NTU

**Residual Chlorine:**
- Range: 0.18 - 0.40 mg/L
- Ideal: 0.2 - 0.5 mg/L
- Some areas show insufficient chlorination

---

## Location Coverage

### High Quality Areas
- Vidyadhar Nagar
- Malviya Nagar
- C-Scheme
- Vaishali Nagar
- Raja Park
- Pratap Nagar

### Moderate Quality Areas
- Jhotwara (Residential)
- Mansarovar
- Ajmer Road
- Sitapura (Residential)

### Areas Requiring Attention
- Jhotwara Industrial Area
- Bani Park (near railway station)
- Sitapura Industrial Area
- Shyam Nagar

---

## Data Source Basis

The sample data is **representative** and based on:

1. **General Water Quality Standards:**
   - WHO Guidelines for Drinking-water Quality
   - BIS (Bureau of Indian Standards) standards
   - EPA drinking water standards

2. **Jaipur-Specific Characteristics:**
   - Studies indicate Jaipur groundwater often has elevated TDS (400-900 mg/L)
   - Some areas show pH variations (7.0-8.5)
   - Industrial areas typically show higher TDS and turbidity
   - Residential areas generally have better quality

3. **Real-World Patterns:**
   - Industrial areas: Higher TDS, elevated turbidity
   - Residential areas: Better quality, within acceptable limits
   - Mixed zones: Borderline quality requiring monitoring

---

## Data Usage in TQM Context

### Process Demonstration
- **Control Charts:** Quality index trends over time
- **Status Distribution:** Safe/Borderline/Unsafe classification
- **Geographic Analysis:** Location-based quality patterns
- **Trend Analysis:** Parameter variations across locations

### Quality Management
- **Corrective Actions:** Samples with "Unsafe" status trigger action items
- **Audit Trail:** Some samples marked as verified by auditors
- **Continuous Monitoring:** Regular sampling across locations
- **Data-Driven Decisions:** Quality index calculation guides status determination

---

## Data Seeding

### Command
```bash
cd backend
npm run seed
```

### What It Does
1. Connects to MongoDB database
2. Clears existing sample data
3. Inserts 25 representative samples
4. Calculates quality indices automatically
5. Assigns status (Safe/Borderline/Unsafe)
6. Sets timestamps spread over 30 days
7. Marks some samples as verified (for audit trail demo)

---

## Data Accuracy Note

**Important:** This data is **representative** and created for demonstration purposes. While it reflects realistic patterns based on:
- General water quality standards
- Jaipur's known water quality characteristics
- Typical variations across different area types

It is **not** actual measured data from specific dates or locations. For production use, the system would collect real-time data from actual water quality monitoring equipment or laboratory tests.

---

## Alignment with Project Schedule

### Week 5 (Integration Phase)
- Database seeding implemented
- Test data available for frontend-backend integration
- Dashboard populated with realistic data

### Week 6 (Testing Phase)
- Test data used for:
  - Control chart validation
  - Status classification testing
  - Report generation testing
  - Quality audit demonstrations

### Week 7 (Deployment)
- Sample data ready for demonstration
- Realistic scenarios for presentation
- TQM principles demonstrated with actual data patterns

---

## Future Data Collection

For production deployment, the system would:
1. Integrate with laboratory equipment APIs
2. Accept manual data entry from field inspectors
3. Import data from water quality monitoring stations
4. Support batch uploads from CSV/Excel files

---

**Document Status:** Complete  
**Maintained By:** Development Team  
**Review Date:** October 2024

