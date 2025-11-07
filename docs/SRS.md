# Software Requirements Specification (SRS)
## AquaSure - Drinking Water Quality Check System

**Version:** 1.0  
**Date:** September 2024  
**Team:** PureLogic  
**Project:** Total Quality Management Assignment

---

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for AquaSure, a web-based application for monitoring and managing drinking water quality. The system implements Total Quality Management (TQM) principles to ensure continuous improvement in water quality monitoring processes.

### 1.2 Scope
AquaSure is a MERN stack (MongoDB, Express.js, React, Node.js) application that:
- Collects water quality sample data (pH, TDS, turbidity, chlorine, temperature)
- Calculates quality indices based on WHO/EPA standards
- Provides real-time dashboards and control charts
- Generates quality reports for audits
- Tracks corrective actions and maintains audit trails

### 1.3 Definitions and Acronyms
- **TQM:** Total Quality Management
- **TDS:** Total Dissolved Solids
- **NTU:** Nephelometric Turbidity Units
- **PDCA:** Plan-Do-Check-Act (TQM cycle)
- **SIPOC:** Suppliers, Inputs, Process, Outputs, Customers
- **RCA:** Root Cause Analysis
- **QI:** Quality Index

### 1.4 References
- WHO Guidelines for Drinking-water Quality
- EPA Drinking Water Standards
- ISO 9001 Quality Management Systems

---

## 2. Overall Description

### 2.1 Product Perspective
AquaSure is a standalone web application that can be deployed on cloud platforms. It interfaces with:
- **Users:** Water quality inspectors, auditors, operators
- **Database:** MongoDB for data persistence
- **External Systems:** Potential integration with laboratory equipment (future)

### 2.2 Product Functions
1. Sample data collection and entry
2. Quality index calculation
3. Real-time dashboard visualization
4. Historical data analysis
5. Report generation
6. Sample verification and audit trails
7. Corrective action tracking

### 2.3 User Classes
- **Operators:** Submit water quality samples
- **Auditors:** Verify samples and review quality data
- **Administrators:** Manage users and system configuration

### 2.4 Operating Environment
- **Frontend:** Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Backend:** Node.js runtime environment
- **Database:** MongoDB (cloud or local)
- **Deployment:** Cloud platforms (Heroku, Render, Vercel)

---

## 3. System Features

### 3.1 Sample Submission (FR-1)
**Description:** Users can submit water quality samples with required parameters.

**Priority:** High

**Inputs:**
- Location (string, required)
- pH (number, 0-14, required)
- TDS (number, ≥0, required)
- Turbidity (number, ≥0, required)
- Chlorine (number, ≥0, required)
- Temperature (number, optional)
- Notes (string, optional)

**Processing:**
- Validate all inputs
- Calculate quality index
- Determine status (Safe/Borderline/Unsafe)
- Store in database

**Outputs:**
- Sample record with calculated quality index and status
- Success/error message

**TQM Integration:**
- Input validation (Process control)
- Automatic quality assessment (Data-driven decisions)

---

### 3.2 Quality Index Calculation (FR-2)
**Description:** System automatically calculates quality index (0-100) based on water parameters.

**Priority:** High

**Algorithm:**
- Base score: 100
- pH penalty: Deviation from ideal (7.0)
- TDS penalty: Values above 500 mg/L
- Turbidity penalty: Values above 1 NTU
- Chlorine penalty: Values outside 0.2-0.5 mg/L range

**Status Determination:**
- Safe: QI ≥ 80
- Borderline: 50 ≤ QI < 80
- Unsafe: QI < 50

**TQM Integration:**
- Data-driven decision making
- Standardized quality assessment

---

### 3.3 Dashboard Visualization (FR-3)
**Description:** Real-time dashboard showing quality metrics and trends.

**Priority:** High

**Features:**
- Quality index trend chart (control chart)
- Status distribution
- Parameter trends (pH, TDS, turbidity, chlorine)
- Statistics summary
- Recent samples table

**TQM Integration:**
- Control charts for process monitoring
- Visual representation of quality trends

---

### 3.4 Sample Verification (FR-4)
**Description:** Auditors can verify samples and add verification notes.

**Priority:** Medium

**Features:**
- Mark sample as verified
- Record verifier name
- Add verification timestamp
- Add verification notes

**TQM Integration:**
- Audit trail maintenance
- Process accountability

---

### 3.5 Reports Generation (FR-5)
**Description:** Generate filtered reports and export to CSV.

**Priority:** Medium

**Features:**
- Filter by location, status, date range
- Display filtered results
- Export to CSV format
- Print-friendly format

**TQM Integration:**
- Quality audit documentation
- Historical data analysis

---

### 3.6 Corrective Action Tracking (FR-6)
**Description:** Track corrective actions for unsafe samples.

**Priority:** Medium

**Features:**
- Add corrective actions to samples
- Assign actions to team members
- Set due dates
- Track action status (Pending/In Progress/Completed)

**TQM Integration:**
- Continuous improvement tracking
- Action item management

---

### 3.7 User Authentication (FR-7)
**Description:** User registration and login system.

**Priority:** Medium

**Features:**
- User registration
- User login
- Role-based access (Admin, Auditor, Operator)
- Session management

---

## 4. Non-Functional Requirements

### 4.1 Performance
- API response time: < 500ms for standard queries
- Dashboard load time: < 2 seconds
- Support up to 1000 samples without performance degradation

### 4.2 Security
- Password encryption (bcrypt)
- JWT token-based authentication
- Input validation and sanitization
- CORS configuration

### 4.3 Usability
- Intuitive user interface
- Responsive design (mobile-friendly)
- Clear error messages
- Helpful tooltips and guidance

### 4.4 Reliability
- Database connection error handling
- Graceful error messages
- Data validation to prevent corruption

### 4.5 Maintainability
- Clean code structure
- Comprehensive documentation
- Modular component design

---

## 5. TQM Integration

### 5.1 SIPOC Diagram

**Suppliers:**
- Water quality inspectors
- Laboratory equipment
- Water sources

**Inputs:**
- Water quality parameters (pH, TDS, turbidity, chlorine, temperature)
- Location information
- Sample timestamps

**Process:**
1. Sample collection
2. Data entry
3. Quality index calculation
4. Status determination
5. Data storage
6. Verification (if required)
7. Reporting

**Outputs:**
- Quality index scores
- Status classifications
- Dashboard visualizations
- Quality reports
- Audit trails

**Customers:**
- Water quality management
- Regulatory bodies
- Public health officials
- End consumers

### 5.2 PDCA Cycle Implementation

**Plan:**
- Requirements definition (SRS)
- System design
- Quality standards definition

**Do:**
- Sample collection and entry
- Quality index calculation
- Data storage

**Check:**
- Dashboard monitoring
- Control charts
- Quality audits
- Statistical analysis

**Act:**
- Corrective actions
- Process improvements
- Documentation updates

### 5.3 Process Controls
- Input validation (pH range, non-negative values)
- Required field enforcement
- Data type validation
- Quality index calculation verification

### 5.4 Continuous Improvement
- Trend analysis through control charts
- Corrective action tracking
- Regular quality audits
- Feedback loop implementation

### 5.5 Customer Focus
- User-friendly interface
- Clear quality status indicators
- Comprehensive reporting
- Accessible data visualization

---

## 6. System Models

### 6.1 Data Model

**Sample Entity:**
- _id (ObjectId)
- location (String)
- timestamp (Date)
- ph (Number)
- tds (Number)
- turbidity (Number)
- chlorine (Number)
- temperature (Number, optional)
- qualityIndex (Number)
- status (Enum: Safe/Borderline/Unsafe)
- verified (Boolean)
- verifiedBy (String)
- verifiedAt (Date)
- notes (String)
- correctiveActions (Array)

**Location Entity:**
- _id (ObjectId)
- name (String, unique)
- address (String)
- coordinates (Object)
- type (Enum)
- isActive (Boolean)
- lastSampleDate (Date)
- averageQualityIndex (Number)

**User Entity:**
- _id (ObjectId)
- name (String)
- email (String, unique)
- password (String, hashed)
- role (Enum: Admin/Auditor/Operator)
- isActive (Boolean)

### 6.2 Use Case Diagram
(To be created in UML diagram)

### 6.3 Sequence Diagram
(To be created in UML diagram)

---

## 7. Constraints

### 7.1 Technical Constraints
- Must use MERN stack
- MongoDB database
- RESTful API architecture
- React for frontend

### 7.2 Business Constraints
- 1.5 month development timeline
- Team of 4 members
- TQM principles must be demonstrated

### 7.3 Regulatory Constraints
- Water quality standards based on WHO/EPA guidelines
- Data privacy considerations
- Audit trail requirements

---

## 8. Assumptions and Dependencies

### 8.1 Assumptions
- Users have basic computer literacy
- Internet connectivity available
- MongoDB database accessible
- Modern web browsers available

### 8.2 Dependencies
- Node.js runtime
- MongoDB database
- npm package manager
- Modern web browser

---

## 9. Appendices

### 9.1 Quality Standards Reference

**pH:**
- Ideal: 7.0
- Acceptable: 6.5 - 8.5
- Range: 0 - 14

**TDS:**
- Ideal: < 500 mg/L
- Acceptable: < 1000 mg/L

**Turbidity:**
- Ideal: < 1 NTU
- Acceptable: < 5 NTU

**Chlorine:**
- Ideal: 0.2 - 0.5 mg/L
- Acceptable: 0.2 - 1.0 mg/L

### 9.2 Glossary
- **Quality Index:** Numerical score (0-100) representing overall water quality
- **Control Chart:** Statistical tool for monitoring process stability
- **Audit Trail:** Record of all system activities for traceability

---

**Document Status:** Final  
**Approved By:** PureLogic Team  
**Date:** September 2024

