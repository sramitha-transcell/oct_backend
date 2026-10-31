# Barrier Integrity (TEER) API Documentation

This document provides cURL requests, payloads, query parameters, and response structures for the **Barrier Integrity** (Transepithelial Electrical Resistance / TEER) module under **Efficacy Assessment**.

- **Base URL**: `http://localhost:3000/api/barrier-integrity` (or `/api/barrier_integrity` or `/api/efficacy-assessment/barrier-integrity`)
- **Category**: `efficacy_assessment`
- **Assay Type**: `Transepithelial Electrical Resistance (TEER)`

---

## 1. Create Barrier Integrity Record

### Request
```bash
curl -X POST http://localhost:3000/api/barrier-integrity/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "project_id": 1,
    "category": "efficacy_assessment",
    "assay_type": "Transepithelial Electrical Resistance (TEER)",
    "formulas": {
      "mean": "sum(TEER_i) / n",
      "sd": "sqrt(sum((TEER_i - mean)^2) / (n - 1))",
      "percent_integrity": "TEER_sample / TEER_healthy * 100",
      "percent_barrier_restoration": "(TEER_treatment - TEER_disease) / (TEER_healthy - TEER_disease) * 100"
    },
    "healthy_mean_teer": 6,
    "disease_mean_teer": null,
    "results": [
      {
        "component_name": "Control",
        "group": "Healthy",
        "teer": [5, 7, 6],
        "n": 3,
        "mean": 6,
        "sd": 1,
        "percent_integrity": 100,
        "percent_barrier_restoration": null
      }
    ],
    "warnings": [],
    "graphs": {
      "teer_summary": {
        "mime_type": "image/png",
        "encoding": "base64",
        "image_base64": "<BASE64_IMAGE_STRING>"
      }
    },
    "status": "completed"
  }'
```

### Response (`200 OK`)
```json
{
  "code": 200,
  "status": true,
  "message": "BarrierIntegrity Created Successfully",
  "data": {
    "id": 1,
    "project_id": 1,
    "category": "efficacy_assessment",
    "assay_type": "Transepithelial Electrical Resistance (TEER)",
    "formulas": {
      "mean": "sum(TEER_i) / n",
      "sd": "sqrt(sum((TEER_i - mean)^2) / (n - 1))",
      "percent_integrity": "TEER_sample / TEER_healthy * 100",
      "percent_barrier_restoration": "(TEER_treatment - TEER_disease) / (TEER_healthy - TEER_disease) * 100"
    },
    "healthy_mean_teer": 6,
    "disease_mean_teer": null,
    "results": [
      {
        "component_name": "Control",
        "group": "Healthy",
        "teer": [5, 7, 6],
        "n": 3,
        "mean": 6,
        "sd": 1,
        "percent_integrity": 100,
        "percent_barrier_restoration": null
      }
    ],
    "warnings": [],
    "graphs": {
      "teer_summary": {
        "mime_type": "image/png",
        "encoding": "base64",
        "image_base64": "<BASE64_IMAGE_STRING>"
      }
    },
    "status": "completed",
    "is_active": true,
    "created_by_id": 1,
    "createdAt": "2026-11-01T00:40:00.000Z",
    "updatedAt": "2026-11-01T00:40:00.000Z"
  }
}
```

---

## 2. Upsert Barrier Integrity Record

Matches by `id`, or by `{ category, project_id }`, or by `project_id`. If existing, updates; otherwise inserts.

### Request
```bash
curl -X POST http://localhost:3000/api/barrier-integrity/upsert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "project_id": 1,
    "category": "efficacy_assessment",
    "healthy_mean_teer": 6,
    "disease_mean_teer": null,
    "results": [
      {
        "component_name": "Control",
        "group": "Healthy",
        "teer": [5, 7, 6],
        "n": 3,
        "mean": 6,
        "sd": 1,
        "percent_integrity": 100,
        "percent_barrier_restoration": null
      }
    ],
    "status": "completed"
  }'
```

### Response (`200 OK`)
```json
{
  "code": 200,
  "status": true,
  "message": "BarrierIntegrity Upserted Successfully",
  "data": { ... }
}
```

---

## 3. Update Barrier Integrity Record by ID

### Request
```bash
curl -X POST http://localhost:3000/api/barrier-integrity/1/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "status": "in_progress",
    "healthy_mean_teer": 6.5
  }'
```

### Response (`200 OK`)
```json
{
  "code": 200,
  "status": true,
  "message": "BarrierIntegrity Updated Successfully",
  "data": { ... }
}
```

---

## 4. Get Barrier Integrity by ID

Includes populated `project_details`.

### Request
```bash
curl -X GET http://localhost:3000/api/barrier-integrity/1 \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Response (`200 OK`)
```json
{
  "code": 200,
  "status": true,
  "message": "BarrierIntegrity Retrieved Successfully",
  "data": {
    "id": 1,
    "project_id": 1,
    "category": "efficacy_assessment",
    "assay_type": "Transepithelial Electrical Resistance (TEER)",
    "formulas": {
      "mean": "sum(TEER_i) / n",
      "sd": "sqrt(sum((TEER_i - mean)^2) / (n - 1))",
      "percent_integrity": "TEER_sample / TEER_healthy * 100",
      "percent_barrier_restoration": "(TEER_treatment - TEER_disease) / (TEER_healthy - TEER_disease) * 100"
    },
    "healthy_mean_teer": 6,
    "disease_mean_teer": null,
    "results": [ ... ],
    "warnings": [],
    "graphs": { ... },
    "status": "completed",
    "is_active": true,
    "project_details": {
      "id": 1,
      "project_name": "OCT Oral Mucosa Study",
      "project_unique_id": "PRJ-001"
    }
  }
}
```

---

## 5. List Barrier Integrity Records (with Filter & Pagination)

### Request
```bash
curl -X GET "http://localhost:3000/api/barrier-integrity?project_id=1&per_page=10&page_no=1" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Response (`200 OK`)
```json
{
  "code": 200,
  "status": true,
  "message": "BarrierIntegrity retrieved Successfully",
  "pagination": {
    "per_page": 10,
    "page_no": 1,
    "total_rows": 1,
    "total_pages": 1
  },
  "data": [
    {
      "id": 1,
      "project_id": 1,
      "category": "efficacy_assessment",
      "results": [ ... ],
      "project_details": { ... }
    }
  ]
}
```

---

## 6. Delete Barrier Integrity Record

### Request
```bash
curl -X DELETE http://localhost:3000/api/barrier-integrity/1/delete \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Response (`200 OK`)
```json
{
  "code": 200,
  "status": true,
  "message": "BarrierIntegrity Deleted Successfully",
  "data": { ... }
}
```

