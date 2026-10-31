# Mycoplasma Testing (Safety Assessment) - API cURL Documentation

This document provides complete cURL commands and request/response specifications for the **Mycoplasma Testing** CRUD endpoints under `safety_assessment`.

---

## 📌 Global Configuration & Authentication

- **Base URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing`  
  *(Alternative alias mounted at: `http://localhost:3001/api/v1/oct/backend/mycoplasma-testing`)*
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token in `Authorization` header (`Bearer <YOUR_JWT_TOKEN>`)

---

## 1. Create Mycoplasma Testing Record

Creates a new Mycoplasma qPCR testing document based on the `docs/wound_healing.json` format.

* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing/create`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing/create' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "project_id": 1,
    "category": "safety_assessment",
    "assay_type": "Mycoplasma_qPCR",
    "calculation_method": "Ct cutoff-based screening",
    "assay_rules": {
        "cutoff": 35,
        "borderline": 1,
        "borderline_lower_limit": 34,
        "max_ct": 40,
        "internal_control_min": 20,
        "internal_control_max": 30,
        "positive_control_requirement": "Ct < 35.0",
        "negative_control_requirement": "Pass",
        "extraction_blank_requirement": "Pass"
    },
    "samples": [
        {
            "sample_id": "MYCO_SAMPLE_001",
            "target_ct": 32.5,
            "internal_control_ct": 25
        }
    ],
    "results": [
        {
            "sample_id": "MYCO_SAMPLE_001",
            "target_ct": 32.5,
            "target_ct_status": "ok",
            "internal_control_ct": 25,
            "internal_control_status": "ok",
            "positive_control_ct": 28,
            "positive_control_status": "ok",
            "negative_control": "Pass",
            "extraction_blank": "Pass",
            "delta_ct_target_minus_positive_control": 4.5,
            "cutoff": 35,
            "borderline_range": {
                "lower_inclusive": 34,
                "upper_exclusive": 35
            },
            "screening_result": "Detected",
            "interpretation": "Target Ct is below the borderline threshold of 34.0 and assay QC criteria passed.",
            "qc_status": "Pass"
        }
    ],
    "graphs": {}
}'
```

---

## 2. Upsert Mycoplasma Testing Record

Upsert document by `id`, or by `{ category, project_id }`.

* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing/upsert`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing/upsert' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "project_id": 1,
    "category": "safety_assessment",
    "assay_type": "Mycoplasma_qPCR",
    "status": "completed"
}'
```

---

## 3. Update Mycoplasma Testing Record by ID

Update an existing document by its numeric `id`.

* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing/:id/update`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing/1/update' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "status": "completed",
    "message": "Updated mycoplasma testing QC evaluation"
}'
```

---

## 4. Get Mycoplasma Testing Record by ID

Retrieve a single Mycoplasma Testing document with joined project details.

* **Method**: `GET`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing/:id`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing/1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

---

## 5. List Mycoplasma Testing Records (with Filtering & Pagination)

List documents with support for pagination, sorting, and filters (`project_id`, `category`, `status`, `assay_type`, `is_active`).

* **Method**: `GET`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing`

#### cURL Request (All parameters)
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing?project_id=1&category=safety_assessment&per_page=10&page_no=1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

---

## 6. Delete Mycoplasma Testing Record by ID

Delete a Mycoplasma Testing document by its numeric `id`.

* **Method**: `DELETE`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing/:id/delete`

#### cURL Request
```bash
curl --location --request DELETE 'http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing/1/delete' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

