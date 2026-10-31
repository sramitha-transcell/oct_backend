# Wound Healing Assay (Efficacy Assessment) - API cURL Documentation

This document provides complete cURL commands and request/response specifications for the **Wound Healing Assay** CRUD endpoints under `efficacy_assessment`.

---

## 📌 Global Configuration & Authentication

- **Base URL**: `http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing`  
  *(Alternative alias mounted at: `http://localhost:3001/api/v1/oct/backend/wound-healing`)*
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token in `Authorization` header (`Bearer <YOUR_JWT_TOKEN>`)

---

## 1. Create Wound Healing Record

Creates a new Wound Healing Assay document based on the `docs/wound_healing.json` format.

* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing/create`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing/create' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "project_id": 1,
    "category": "efficacy_assessment",
    "meta": {
        "status": true,
        "message": "Six input images validated; supplied application inputs and results preserved."
    },
    "data": {
        "analysis_type": "microscopy_image_batch",
        "patient_id": "sample_001",
        "app_inputs": {},
        "image_count": 6,
        "images": [
            {
                "image_id": "Control_0h",
                "sample_group": "Control",
                "time_hours": 0,
                "filename": "control image at 0 hr.png",
                "mime_type": "image/png",
                "encoding": "base64",
                "image_base64": "iVBORw0KGgoAAAANSUhEUg",
                "width": 415,
                "height": 363,
                "detected_format": "PNG"
            },
            {
                "image_id": "Control_24h",
                "sample_group": "Control",
                "time_hours": 24,
                "filename": "control image at 24 h.png",
                "mime_type": "image/png",
                "encoding": "base64",
                "image_base64": "iVBORwuytuyt",
                "width": 415,
                "height": 361,
                "detected_format": "PNG"
            },
            {
                "image_id": "RD_0h",
                "sample_group": "RD",
                "time_hours": 0,
                "filename": "RD at 0 hr.png",
                "mime_type": "image/png",
                "encoding": "base64",
                "image_base64": "iVBORw0KGgoAA",
                "width": 427,
                "height": 380,
                "detected_format": "PNG"
            },
            {
                "image_id": "RD_24h",
                "sample_group": "RD",
                "time_hours": 24,
                "filename": "RD at 24 hr.png",
                "mime_type": "image/png",
                "encoding": "base64",
                "image_base64": "iVBORw0KGgoAA",
                "width": 415,
                "height": 373,
                "detected_format": "PNG"
            },
            {
                "image_id": "TD_0h",
                "sample_group": "TD",
                "time_hours": 0,
                "filename": "TD at 0 hr.png",
                "mime_type": "image/png",
                "encoding": "base64",
                "image_base64": "iVBORw0KGgoAA",
                "width": 410,
                "height": 360,
                "detected_format": "PNG"
            },
            {
                "image_id": "TD_24h",
                "sample_group": "TD",
                "time_hours": 24,
                "filename": "Td at 24 hr.png",
                "mime_type": "image/png",
                "encoding": "base64",
                "image_base64": "iVBORw0KGgoAA",
                "width": 407,
                "height": 370,
                "detected_format": "PNG"
            }
        ],
        "results": {},
        "graphs": [],
        "output_images": []
    }
}'
```

---

## 2. Upsert Wound Healing Record

Upsert document by `id`, or by `{ category, project_id }`.

* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing/upsert`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing/upsert' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "project_id": 1,
    "category": "efficacy_assessment",
    "patient_id": "sample_001",
    "analysis_type": "microscopy_image_batch"
}'
```

---

## 3. Update Wound Healing Record by ID

Update an existing document by its numeric `id`.

* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing/:id/update`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing/1/update' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "status": "completed",
    "message": "Updated wound healing analysis"
}'
```

---

## 4. Get Wound Healing Record by ID

Retrieve a single Wound Healing document with joined project details.

* **Method**: `GET`
* **URL**: `http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing/:id`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing/1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

---

## 5. List Wound Healing Records (with Filtering & Pagination)

List documents with support for pagination, sorting, and filters (`project_id`, `category`, `status`, `patient_id`, `analysis_type`, `is_active`).

* **Method**: `GET`
* **URL**: `http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing`

#### cURL Request (All parameters)
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing?project_id=1&category=efficacy_assessment&per_page=10&page_no=1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

---

## 6. Delete Wound Healing Record by ID

Delete a Wound Healing document by its numeric `id`.

* **Method**: `DELETE`
* **URL**: `http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing/:id/delete`

#### cURL Request
```bash
curl --location --request DELETE 'http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing/1/delete' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

