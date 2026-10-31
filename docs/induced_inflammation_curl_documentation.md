# Induced Inflammation (Safety Assessment) - API cURL Documentation

This document provides complete cURL commands and request/response specifications for the **Induced Inflammation** CRUD endpoints under `safety_assessment`.

---

## 📌 Global Configuration & Authentication

- **Base URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation`  
  *(Alternative alias mounted at: `http://localhost:3001/api/v1/oct/backend/induced-inflammation`)*
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token in `Authorization` header (`Bearer <YOUR_JWT_TOKEN>`)

---

## 1. Create Induced Inflammation Record

Creates a new Induced Inflammation document based on the `docs/api_response.json` format.

* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation/create`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation/create' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "project_id": 1,
    "category": "safety_assessment",
    "drug_name": "TestDrug",
    "batch_no": "BATCH001",
    "marker": "CD25",
    "dilution_factor": 1.0,
    "subtract_blank": false,
    "method": "shared",
    "test_drug_group": "QC100",
    "reference_drug_group": "QC64",
    "available_sample_groups": [
        "QC100",
        "QC64"
    ],
    "warnings": [],
    "blank": 0.043,
    "n_blank": 2,
    "relative_potency": {
        "value": 109.51634148883818,
        "unit": "%",
        "method": "shared"
    },
    "standard_curve": {
        "parameters": {
            "Bottom": 0.1028665352877843,
            "Top": 12.128567188432788,
            "IC50": 1444.9827380839972,
            "logIC50": 3.159862658995926,
            "HillSlope": -0.9714617424209667,
            "R2": 0.9997435919670533
        },
        "table": [
            { "Parameter": "Bottom", "Value": "0.10" },
            { "Parameter": "Top", "Value": "12.13" },
            { "Parameter": "IC50", "Value": "1444.98" },
            { "Parameter": "logIC50", "Value": "3.16" },
            { "Parameter": "HillSlope", "Value": "-0.97" },
            { "Parameter": "R²", "Value": "1.00" }
        ]
    },
    "potency_curve": {
        "parameters": {
            "QC100": {
                "Bottom": 0.13361504567311078,
                "Top": 0.29536652453384904,
                "IC50": 11.382960310469132,
                "logIC50": 1.056255221576723,
                "HillSlope": 0.6321195420112886,
                "R2": 0.9650007841969687
            },
            "QC64": {
                "Bottom": 0.13361504567311078,
                "Top": 0.29536652453384904,
                "IC50": 12.466201685152289,
                "logIC50": 1.0957341488707697,
                "HillSlope": 0.6321195420112886,
                "R2": 0.9496564356720067
            }
        },
        "table": [
            { "Parameter": "Bottom", "RD (QC64)": "0.13", "TD (QC100)": "0.13" },
            { "Parameter": "Top", "RD (QC64)": "0.30", "TD (QC100)": "0.30" },
            { "Parameter": "IC50", "RD (QC64)": "12.47", "TD (QC100)": "11.38" },
            { "Parameter": "logIC50", "RD (QC64)": "1.10", "TD (QC100)": "1.06" },
            { "Parameter": "HillSlope", "RD (QC64)": "0.63", "TD (QC100)": "0.63" },
            { "Parameter": "R²", "RD (QC64)": "0.95", "TD (QC100)": "0.97" }
        ]
    },
    "samples": [
        {
            "Sample": "QC100, 200",
            "Replicate #1": "10.00",
            "Replicate #2": "10.54",
            "Average (pg/mL)": "10.27",
            "Std Dev": "0.38"
        },
        {
            "Sample": "QC64, 128",
            "Replicate #1": "11.30",
            "Replicate #2": "10.11",
            "Average (pg/mL)": "10.71",
            "Std Dev": "0.84"
        }
    ],
    "graphs": {}
}'
```

---

## 2. Upsert Induced Inflammation Record

Upsert document by `id`, or by `{ category, project_id }`.

* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation/upsert`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation/upsert' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "project_id": 1,
    "category": "safety_assessment",
    "drug_name": "TestDrug",
    "batch_no": "BATCH001",
    "marker": "CD25"
}'
```

---

## 3. Update Induced Inflammation Record by ID

Update an existing document by its numeric `id`.

* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation/:id/update`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation/1/update' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "status": "completed",
    "message": "Updated potency curve data"
}'
```

---

## 4. Get Induced Inflammation Record by ID

Retrieve a single Induced Inflammation document with joined project details.

* **Method**: `GET`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation/:id`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation/1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

---

## 5. List Induced Inflammation Records (with Filtering & Pagination)

List documents with support for pagination, sorting, and filters (`project_id`, `category`, `status`, `drug_name`, `batch_no`, `marker`, `is_active`).

* **Method**: `GET`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation`

#### cURL Request (All parameters)
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation?project_id=1&category=safety_assessment&per_page=10&page_no=1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

---

## 6. Delete Induced Inflammation Record by ID

Delete an Induced Inflammation document by its numeric `id`.

* **Method**: `DELETE`
* **URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation/:id/delete`

#### cURL Request
```bash
curl --location --request DELETE 'http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation/1/delete' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

