# Adventitious Agents (Safety Assessment) - API cURL Documentation

This document provides complete cURL commands and request/response specifications for the **Adventitious Agents** CRUD endpoints under `safety_assessment`.

---

## 📌 Global Configuration & Authentication

- **Base URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents`  
  *(Alternative alias mounted at: `http://localhost:3001/api/v1/oct/backend/adventitious-agents`)*
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token in `Authorization` header (`Bearer <YOUR_JWT_TOKEN>`)

---

## 1. Create Adventitious Agents Record

Creates a new Adventitious Agents screening document based on the `docs/api_response.json` format.

* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents/create`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents/create' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "project_id": 1,
    "category": "safety_assessment",
    "assay_type": "qPCR / RT-qPCR",
    "calculation_method": "Ct cutoff-based screening",
    "sample_details": {
        "sample_id": "VIR-001",
        "sample_type": "Culture supernatant",
        "collection_point": "1",
        "extraction_method": "Column-based",
        "internal_control_type": "Exogenous",
        "internal_control_name": "Exogenous RNA/DNA process control",
        "extraction_control_status": "Pass"
    },
    "assay_configuration": [
        {
            "viral_agent": "HIV-1",
            "assay": "qPCR / RT-qPCR",
            "positive_control_id": "PC-HIV-001",
            "cutoff": 35,
            "borderline_interval": 1,
            "lod": "",
            "max_accepted_ct": 40,
            "internal_control_range": {
                "min_ct": 20,
                "max_ct": 30
            },
            "suggested_internal_control": "Exogenous RNA/DNA process control; human RNase P for cellular DNA"
        },
        {
            "viral_agent": "HBV",
            "assay": "qPCR",
            "positive_control_id": "PC-HBV-001",
            "cutoff": 35,
            "borderline_interval": 1,
            "lod": "",
            "max_accepted_ct": 40,
            "internal_control_range": {
                "min_ct": 20,
                "max_ct": 30
            },
            "suggested_internal_control": "Exogenous DNA process control"
        },
        {
            "viral_agent": "HCV",
            "assay": "RT-qPCR",
            "positive_control_id": "PC-HCV-001",
            "cutoff": 35,
            "borderline_interval": 1,
            "lod": "",
            "max_accepted_ct": 40,
            "internal_control_range": {
                "min_ct": 20,
                "max_ct": 30
            },
            "suggested_internal_control": "Exogenous RNA process control"
        },
        {
            "viral_agent": "CMV",
            "assay": "qPCR",
            "positive_control_id": "PC-CMV-001",
            "cutoff": 35,
            "borderline_interval": 1,
            "lod": "",
            "max_accepted_ct": 40,
            "internal_control_range": {
                "min_ct": 20,
                "max_ct": 30
            },
            "suggested_internal_control": "Human RNase P for cellular samples"
        },
        {
            "viral_agent": "EBV",
            "assay": "qPCR",
            "positive_control_id": "PC-EBV-001",
            "cutoff": 35,
            "borderline_interval": 1,
            "lod": "",
            "max_accepted_ct": 40,
            "internal_control_range": {
                "min_ct": 20,
                "max_ct": 30
            },
            "suggested_internal_control": "Human RNase P for cellular samples"
        },
        {
            "viral_agent": "BKV",
            "assay": "qPCR",
            "positive_control_id": "PC-BKV-001",
            "cutoff": 35,
            "borderline_interval": 1,
            "lod": "",
            "max_accepted_ct": 40,
            "internal_control_range": {
                "min_ct": 20,
                "max_ct": 30
            },
            "suggested_internal_control": "Human RNase P for cellular samples"
        },
        {
            "viral_agent": "JCV",
            "assay": "qPCR",
            "positive_control_id": "PC-JCV-001",
            "cutoff": 35,
            "borderline_interval": 1,
            "lod": "",
            "max_accepted_ct": 40,
            "internal_control_range": {
                "min_ct": 20,
                "max_ct": 30
            },
            "suggested_internal_control": "Human RNase P for cellular samples"
        }
    ],
    "samples": [
        {
            "sample_id": "VIR-001",
            "sample_type": "Culture supernatant",
            "collection_point": "1",
            "extraction_method": "Column-based",
            "viral_inputs": [
                {
                    "viral_agent": "HIV-1",
                    "sample_ct": 39.9,
                    "positive_control_ct": 24.1,
                    "negative_control_ct": 40,
                    "internal_control_ct": 25.4
                },
                {
                    "viral_agent": "HBV",
                    "sample_ct": 39.4,
                    "positive_control_ct": 23.5,
                    "negative_control_ct": 40,
                    "internal_control_ct": 25.1
                },
                {
                    "viral_agent": "HCV",
                    "sample_ct": 40,
                    "positive_control_ct": 25,
                    "negative_control_ct": 40,
                    "internal_control_ct": 25.6
                },
                {
                    "viral_agent": "CMV",
                    "sample_ct": 39.1,
                    "positive_control_ct": 22.8,
                    "negative_control_ct": 40,
                    "internal_control_ct": 25.3
                },
                {
                    "viral_agent": "EBV",
                    "sample_ct": 39.7,
                    "positive_control_ct": 23.2,
                    "negative_control_ct": 40,
                    "internal_control_ct": 25.2
                },
                {
                    "viral_agent": "BKV",
                    "sample_ct": 39.6,
                    "positive_control_ct": 22.5,
                    "negative_control_ct": 40,
                    "internal_control_ct": 25.5
                },
                {
                    "viral_agent": "JCV",
                    "sample_ct": 39.8,
                    "positive_control_ct": 22.9,
                    "negative_control_ct": 40,
                    "internal_control_ct": 25
                }
            ]
        }
    ],
    "results": [
        {
            "viral_agent": "HIV-1",
            "assay": "qPCR / RT-qPCR",
            "positive_control_id": "PC-HIV-001",
            "sample_ct": 39.9,
            "sample_ct_status": "ok",
            "positive_control_ct": 24.1,
            "positive_control_status": "ok",
            "negative_control_ct": 40,
            "negative_control_status": "ok",
            "internal_control_ct": 25.4,
            "internal_control_status": "ok",
            "delta_ct_sample_minus_positive": 15.8,
            "cutoff": 35,
            "borderline_interval": 1,
            "borderline_range": {
                "lower_inclusive": 34,
                "upper_exclusive": 35
            },
            "lod": "",
            "max_accepted_ct": 40,
            "internal_control_range": {
                "min_ct": 20,
                "max_ct": 30
            },
            "run_validity": "Valid",
            "internal_control_qc": "Pass",
            "qc_status": "Pass",
            "screening_result": "Not detected",
            "interpretation": "No reportable target amplification was observed at or below the configured cutoff.",
            "notes": []
        },
        {
            "viral_agent": "HBV",
            "assay": "qPCR",
            "positive_control_id": "PC-HBV-001",
            "sample_ct": 39.4,
            "sample_ct_status": "ok",
            "positive_control_ct": 23.5,
            "positive_control_status": "ok",
            "negative_control_ct": 40,
            "negative_control_status": "ok",
            "internal_control_ct": 25.1,
            "internal_control_status": "ok",
            "delta_ct_sample_minus_positive": 15.9,
            "cutoff": 35,
            "borderline_interval": 1,
            "borderline_range": {
                "lower_inclusive": 34,
                "upper_exclusive": 35
            },
            "lod": "",
            "max_accepted_ct": 40,
            "internal_control_range": {
                "min_ct": 20,
                "max_ct": 30
            },
            "run_validity": "Valid",
            "internal_control_qc": "Pass",
            "qc_status": "Pass",
            "screening_result": "Not detected",
            "interpretation": "No reportable target amplification was observed at or below the configured cutoff.",
            "notes": []
        },
        {
            "viral_agent": "HCV",
            "assay": "RT-qPCR",
            "positive_control_id": "PC-HCV-001",
            "sample_ct": 40,
            "sample_ct_status": "ok",
            "positive_control_ct": 25,
            "positive_control_status": "ok",
            "negative_control_ct": 40,
            "negative_control_status": "ok",
            "internal_control_ct": 25.6,
            "internal_control_status": "ok",
            "delta_ct_sample_minus_positive": 15,
            "cutoff": 35,
            "borderline_interval": 1,
            "borderline_range": {
                "lower_inclusive": 34,
                "upper_exclusive": 35
            },
            "lod": "",
            "max_accepted_ct": 40,
            "internal_control_range": {
                "min_ct": 20,
                "max_ct": 30
            },
            "run_validity": "Valid",
            "internal_control_qc": "Pass",
            "qc_status": "Pass",
            "screening_result": "Not detected",
            "interpretation": "No reportable target amplification was observed at or below the configured cutoff.",
            "notes": []
        },
        {
            "viral_agent": "CMV",
            "assay": "qPCR",
            "positive_control_id": "PC-CMV-001",
            "sample_ct": 39.1,
            "sample_ct_status": "ok",
            "positive_control_ct": 22.8,
            "positive_control_status": "ok",
            "negative_control_ct": 40,
            "negative_control_status": "ok",
            "internal_control_ct": 25.3,
            "internal_control_status": "ok",
            "delta_ct_sample_minus_positive": 16.3,
            "cutoff": 35,
            "borderline_interval": 1,
            "borderline_range": {
                "lower_inclusive": 34,
                "upper_exclusive": 35
            },
            "lod": "",
            "max_accepted_ct": 40,
            "internal_control_range": {
                "min_ct": 20,
                "max_ct": 30
            },
            "run_validity": "Valid",
            "internal_control_qc": "Pass",
            "qc_status": "Pass",
            "screening_result": "Not detected",
            "interpretation": "No reportable target amplification was observed at or below the configured cutoff.",
            "notes": []
        },
        {
            "viral_agent": "EBV",
            "assay": "qPCR",
            "positive_control_id": "PC-EBV-001",
            "sample_ct": 39.7,
            "sample_ct_status": "ok",
            "positive_control_ct": 23.2,
            "positive_control_status": "ok",
            "negative_control_ct": 40,
            "negative_control_status": "ok",
            "internal_control_ct": 25.2,
            "internal_control_status": "ok",
            "delta_ct_sample_minus_positive": 16.5,
            "cutoff": 35,
            "borderline_interval": 1,
            "borderline_range": {
                "lower_inclusive": 34,
                "upper_exclusive": 35
            },
            "lod": "",
            "max_accepted_ct": 40,
            "internal_control_range": {
                "min_ct": 20,
                "max_ct": 30
            },
            "run_validity": "Valid",
            "internal_control_qc": "Pass",
            "qc_status": "Pass",
            "screening_result": "Not detected",
            "interpretation": "No reportable target amplification was observed at or below the configured cutoff.",
            "notes": []
        },
        {
            "viral_agent": "BKV",
            "assay": "qPCR",
            "positive_control_id": "PC-BKV-001",
            "sample_ct": 39.6,
            "sample_ct_status": "ok",
            "positive_control_ct": 22.5,
            "positive_control_status": "ok",
            "negative_control_ct": 40,
            "negative_control_status": "ok",
            "internal_control_ct": 25.5,
            "internal_control_status": "ok",
            "delta_ct_sample_minus_positive": 17.1,
            "cutoff": 35,
            "borderline_interval": 1,
            "borderline_range": {
                "lower_inclusive": 34,
                "upper_exclusive": 35
            },
            "lod": "",
            "max_accepted_ct": 40,
            "internal_control_range": {
                "min_ct": 20,
                "max_ct": 30
            },
            "run_validity": "Valid",
            "internal_control_qc": "Pass",
            "qc_status": "Pass",
            "screening_result": "Not detected",
            "interpretation": "No reportable target amplification was observed at or below the configured cutoff.",
            "notes": []
        },
        {
            "viral_agent": "JCV",
            "assay": "qPCR",
            "positive_control_id": "PC-JCV-001",
            "sample_ct": 39.8,
            "sample_ct_status": "ok",
            "positive_control_ct": 22.9,
            "positive_control_status": "ok",
            "negative_control_ct": 40,
            "negative_control_status": "ok",
            "internal_control_ct": 25,
            "internal_control_status": "ok",
            "delta_ct_sample_minus_positive": 16.9,
            "cutoff": 35,
            "borderline_interval": 1,
            "borderline_range": {
                "lower_inclusive": 34,
                "upper_exclusive": 35
            },
            "lod": "",
            "max_accepted_ct": 40,
            "internal_control_range": {
                "min_ct": 20,
                "max_ct": 30
            },
            "run_validity": "Valid",
            "internal_control_qc": "Pass",
            "qc_status": "Pass",
            "screening_result": "Not detected",
            "interpretation": "No reportable target amplification was observed at or below the configured cutoff.",
            "notes": []
        }
    ],
    "summary": {
        "total_targets": 7,
        "not_detected": 7,
        "detected": 0,
        "inconclusive": 0,
        "invalid": 0,
        "overall_viral_screening_status": "All targets not detected",
        "assay_controls": "Valid",
        "pcr_inhibition": "Not detected",
        "overall_safety_assessment": "Pass"
    },
    "graphs": {}
}'
```

---

## 2. Upsert Adventitious Agents Record

Upsert document by `id`, or by `{ category, project_id }`.

* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents/upsert`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents/upsert' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "project_id": 1,
    "category": "safety_assessment",
    "assay_type": "qPCR / RT-qPCR",
    "summary": {
        "total_targets": 7,
        "not_detected": 7,
        "overall_safety_assessment": "Pass"
    }
}'
```

---

## 3. Update Adventitious Agents Record by ID

Update an existing document by its numeric `id`.

* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents/:id/update`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents/1/update' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "status": "completed",
    "message": "Updated viral screening results"
}'
```

---

## 4. Get Adventitious Agents Record by ID

Retrieve a single Adventitious Agents document with joined project details.

* **Method**: `GET`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents/:id`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents/1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

---

## 5. List Adventitious Agents Records (with Filtering & Pagination)

List documents with support for pagination, sorting, and filters (`project_id`, `category`, `status`, `assay_type`, `is_active`).

* **Method**: `GET`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents`

#### cURL Request (All parameters)
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents?project_id=1&category=safety_assessment&per_page=10&page_no=1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

---

## 6. Delete Adventitious Agents Record by ID

Delete an Adventitious Agents document by its numeric `id`.

* **Method**: `DELETE`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents/:id/delete`

#### cURL Request
```bash
curl --location --request DELETE 'http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents/1/delete' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

