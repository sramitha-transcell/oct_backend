# Nociception Assay (qPCR Analysis) - API cURL Documentation

This document provides complete cURL commands and response formats for the **Nociception Assay (qPCR Analysis)** CRUD endpoints under `mechanistic_analysis`.

---

## 📌 Global Configuration & Authentication

- **Base URL**: `http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay`  
  *(Alternative alias mounted at: `http://localhost:3001/api/v1/oct/backend/nociception-assay`)*
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token in `Authorization` header (`Bearer <YOUR_JWT_TOKEN>`)

---

## 1. Create Nociception Assay

Create a new qPCR Nociception Assay document with raw calculation parameters, samples, markers, results, and base64 graphs.

* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/create`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/create' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "project_id": 1,
    "assay_name": "Nociception Assay - Pain Pathway Analysis",
    "category": "mechanistic_analysis",
    "calculation_method": "2^(-ΔΔCt)",
    "calibrator": "Control",
    "status": "completed",
    "markers": [
        "IL-1β",
        "IL-6",
        "TNF-α",
        "PGE2",
        "NGF",
        "COX-2"
    ],
    "samples": [
        {
            "sample_name": "Control",
            "markers": {
                "IL-1β": {
                    "target_ct": [26.16, 26.36],
                    "beta_actin_ct": [18.03, 18.18]
                },
                "IL-6": {
                    "target_ct": [26.86, 27.06],
                    "beta_actin_ct": [18.16, 18.31]
                },
                "TNF-α": {
                    "target_ct": [26.70, 26.90],
                    "beta_actin_ct": [18.19, 18.34]
                },
                "PGE2": {
                    "target_ct": [27.36, 27.56],
                    "beta_actin_ct": [18.09, 18.24]
                },
                "NGF": {
                    "target_ct": [26.05, 26.25],
                    "beta_actin_ct": [18.02, 18.17]
                },
                "COX-2": {
                    "target_ct": [27.59, 27.79],
                    "beta_actin_ct": [18.11, 18.26]
                }
            }
        },
        {
            "sample_name": "Disease Control",
            "markers": {
                "IL-1β": {
                    "target_ct": [23.45, 23.65],
                    "beta_actin_ct": [18.05, 18.20]
                },
                "IL-6": {
                    "target_ct": [22.80, 23.00],
                    "beta_actin_ct": [18.10, 18.25]
                },
                "TNF-α": {
                    "target_ct": [23.10, 23.30],
                    "beta_actin_ct": [18.15, 18.30]
                },
                "PGE2": {
                    "target_ct": [23.90, 24.10],
                    "beta_actin_ct": [18.08, 18.23]
                },
                "NGF": {
                    "target_ct": [23.20, 23.40],
                    "beta_actin_ct": [18.00, 18.15]
                },
                "COX-2": {
                    "target_ct": [24.10, 24.30],
                    "beta_actin_ct": [18.12, 18.27]
                }
            }
        },
        {
            "sample_name": "Test Drug Treated",
            "markers": {
                "IL-1β": {
                    "target_ct": [25.50, 25.70],
                    "beta_actin_ct": [18.04, 18.19]
                },
                "IL-6": {
                    "target_ct": [25.90, 26.10],
                    "beta_actin_ct": [18.12, 18.27]
                },
                "TNF-α": {
                    "target_ct": [25.60, 25.80],
                    "beta_actin_ct": [18.18, 18.33]
                },
                "PGE2": {
                    "target_ct": [26.40, 26.60],
                    "beta_actin_ct": [18.10, 18.25]
                },
                "NGF": {
                    "target_ct": [25.10, 25.30],
                    "beta_actin_ct": [18.05, 18.20]
                },
                "COX-2": {
                    "target_ct": [26.70, 26.90],
                    "beta_actin_ct": [18.15, 18.30]
                }
            }
        }
    ],
    "results": {
        "IL-1β": [
            {
                "sample_name": "Control",
                "target_ct_average": 26.26,
                "target_ct_sd": 0.1414,
                "beta_actin_ct_average": 18.105,
                "beta_actin_ct_sd": 0.1061,
                "delta_ct": 8.155,
                "delta_ct_sd": 0.1768,
                "delta_delta_ct": 0.0,
                "fold_change": 1.0
            },
            {
                "sample_name": "Disease Control",
                "target_ct_average": 23.55,
                "target_ct_sd": 0.1414,
                "beta_actin_ct_average": 18.125,
                "beta_actin_ct_sd": 0.1061,
                "delta_ct": 5.425,
                "delta_ct_sd": 0.1768,
                "delta_delta_ct": -2.73,
                "fold_change": 6.63
            },
            {
                "sample_name": "Test Drug Treated",
                "target_ct_average": 25.60,
                "target_ct_sd": 0.1414,
                "beta_actin_ct_average": 18.115,
                "beta_actin_ct_sd": 0.1061,
                "delta_ct": 7.485,
                "delta_ct_sd": 0.1768,
                "delta_delta_ct": -0.67,
                "fold_change": 1.59
            }
        ]
    },
    "graphs": {
        "IL-1β": {
            "mime_type": "image/png",
            "encoding": "base64",
            "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
        }
    }
}'
```

#### Response (`200 OK`)
```json
{
    "meta": {
        "status": true,
        "message": "NociceptionAssay Created Successfully"
    },
    "data": {
        "id": 1,
        "project_id": 1,
        "assay_name": "Nociception Assay - Pain Pathway Analysis",
        "category": "mechanistic_analysis",
        "calculation_method": "2^(-ΔΔCt)",
        "calibrator": "Control",
        "status": "completed",
        "is_active": true,
        "markers": [
            "IL-1β",
            "IL-6",
            "TNF-α",
            "PGE2",
            "NGF",
            "COX-2"
        ],
        "samples": [
            {
                "sample_name": "Control",
                "markers": { ... }
            },
            {
                "sample_name": "Disease Control",
                "markers": { ... }
            },
            {
                "sample_name": "Test Drug Treated",
                "markers": { ... }
            }
        ],
        "results": {
            "IL-1β": [
                {
                    "sample_name": "Control",
                    "target_ct_average": 26.26,
                    "target_ct_sd": 0.1414,
                    "beta_actin_ct_average": 18.105,
                    "beta_actin_ct_sd": 0.1061,
                    "delta_ct": 8.155,
                    "delta_ct_sd": 0.1768,
                    "delta_delta_ct": 0.0,
                    "fold_change": 1.0
                },
                {
                    "sample_name": "Disease Control",
                    "target_ct_average": 23.55,
                    "target_ct_sd": 0.1414,
                    "beta_actin_ct_average": 18.125,
                    "beta_actin_ct_sd": 0.1061,
                    "delta_ct": 5.425,
                    "delta_ct_sd": 0.1768,
                    "delta_delta_ct": -2.73,
                    "fold_change": 6.63
                },
                {
                    "sample_name": "Test Drug Treated",
                    "target_ct_average": 25.60,
                    "target_ct_sd": 0.1414,
                    "beta_actin_ct_average": 18.115,
                    "beta_actin_ct_sd": 0.1061,
                    "delta_ct": 7.485,
                    "delta_ct_sd": 0.1768,
                    "delta_delta_ct": -0.67,
                    "fold_change": 1.59
                }
            ]
        },
        "graphs": {
            "IL-1β": {
                "mime_type": "image/png",
                "encoding": "base64",
                "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
            }
        },
        "images": {
            "IL-1β": {
                "mime_type": "image/png",
                "encoding": "base64",
                "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
            }
        },
        "created_by_id": 1,
        "createdAt": "2026-10-28T16:44:34.000Z",
        "updatedAt": "2026-10-28T16:44:34.000Z"
    }
}
```

---

## 2. Get Nociception Assay by ID

Retrieve a specific Nociception Assay by its unique integer `id`.

* **Method**: `GET`
* **URL**: `http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/1`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (`200 OK`)
```json
{
    "meta": {
        "status": true,
        "message": "NociceptionAssay Retrieved Successfully"
    },
    "data": {
        "id": 1,
        "project_id": 1,
        "assay_name": "Nociception Assay - Pain Pathway Analysis",
        "category": "mechanistic_analysis",
        "calculation_method": "2^(-ΔΔCt)",
        "calibrator": "Control",
        "status": "completed",
        "is_active": true,
        "markers": [
            "IL-1β",
            "IL-6",
            "TNF-α",
            "PGE2",
            "NGF",
            "COX-2"
        ],
        "samples": [ ... ],
        "results": { ... },
        "graphs": { ... },
        "createdAt": "2026-10-28T16:44:34.000Z",
        "updatedAt": "2026-10-28T16:44:34.000Z"
    }
}
```

#### Response (`404 Not Found`)
```json
{
    "meta": {
        "status": false,
        "message": "Record Not Found"
    },
    "error": {
        "name": "Record Not Found Error",
        "message": "Record Not Found"
    }
}
```

---

## 3. Update Nociception Assay

Update specific fields of an existing Nociception Assay document.

* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/1/update`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/1/update' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "assay_name": "Updated Nociception Assay Study",
    "status": "verified",
    "description": "qPCR fold change analysis verified with standard delta delta ct"
}'
```

#### Response (`200 OK`)
```json
{
    "meta": {
        "status": true,
        "message": "NociceptionAssay Updated Successfully"
    },
    "data": {
        "acknowledged": true,
        "modifiedCount": 1,
        "upsertedId": null,
        "upsertedCount": 0,
        "matchedCount": 1
    }
}
```

---

## 4. Upsert Nociception Assay

Create or update a record matching either `id` or `project_id`.

* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/upsert`

#### cURL Request (Upsert by `project_id`)
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/upsert' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "project_id": 1,
    "assay_name": "Nociception Assay (Upserted)",
    "status": "in_progress",
    "calibrator": "Control"
}'
```

#### Response (`200 OK`)
```json
{
    "meta": {
        "status": true,
        "message": "NociceptionAssay Upserted Successfully"
    },
    "data": {
        "acknowledged": true,
        "modifiedCount": 1,
        "upsertedId": null,
        "upsertedCount": 0,
        "matchedCount": 1
    }
}
```

---

## 5. List Nociception Assays (with Pagination & Filters)

List records with pagination and optional filter parameters.

* **Method**: `GET`
* **URL**: `http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay`

### Supported Query Parameters:
| Parameter | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `page_no` | Number | Target page number (default: `1`) | `1` |
| `per_page` | Number | Records per page (`-1` for all) | `10` |
| `project_id` | Number / String | Filter by associated project ID | `1` |
| `is_active` | Boolean | Filter by active flag (`true` / `false`) | `true` |
| `assay_name` | String | Case-insensitive regex filter on assay name | `Nociception` |
| `calibrator` | String | Case-insensitive regex filter on calibrator | `Control` |
| `status` | String | Filter by assay status | `completed` |

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay?page_no=1&per_page=10&project_id=1&is_active=true' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (`200 OK`)
```json
{
    "meta": {
        "status": true,
        "message": "NociceptionAssay retrieved Successfully"
    },
    "pagination": {
        "total_records": 1,
        "total_pages": 1,
        "current_page": 1,
        "per_page": 10
    },
    "data": [
        {
            "id": 1,
            "project_id": 1,
            "assay_name": "Nociception Assay - Pain Pathway Analysis",
            "category": "mechanistic_analysis",
            "calculation_method": "2^(-ΔΔCt)",
            "calibrator": "Control",
            "status": "completed",
            "is_active": true,
            "markers": [
                "IL-1β",
                "IL-6",
                "TNF-α",
                "PGE2",
                "NGF",
                "COX-2"
            ],
            "samples": [ ... ],
            "results": { ... },
            "graphs": { ... },
            "createdAt": "2026-10-28T16:44:34.000Z",
            "updatedAt": "2026-10-28T16:44:34.000Z"
        }
    ]
}
```

---

## 6. Delete Nociception Assay

Soft or permanent delete of a Nociception Assay by `id`.

* **Method**: `DELETE`
* **URL**: `http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/1/delete`

#### cURL Request
```bash
curl --location --request DELETE 'http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/1/delete' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (`200 OK`)
```json
{
    "meta": {
        "status": true,
        "message": "NociceptionAssay Deleted Successfully"
    },
    "data": {
        "acknowledged": true,
        "deletedCount": 1
    }
}
```

---

## 7. Common Error Responses

### 7.1. Validation Error (`HTTP 500`)
Returned when payload fails schema validation:
```json
{
    "meta": {
        "status": false,
        "message": "Validation Failed"
    },
    "error": [
        {
            "code": "invalid_type",
            "expected": "array",
            "received": "string",
            "path": ["markers"],
            "message": "Expected array, received string"
        }
    ]
}
```

### 7.2. Record Not Found (`HTTP 404`)
Returned when record ID does not exist:
```json
{
    "meta": {
        "status": false,
        "message": "Record Not Found"
    },
    "error": {
        "name": "Record Not Found Error",
        "message": "Record Not Found"
    }
}
```

### 7.3. Unauthorized (`HTTP 401`)
Returned when `Authorization` header is missing or JWT token is invalid:
```json
{
    "meta": {
        "status": false,
        "message": "No authorization provided"
    },
    "error": {
        "name": "Invalid Authorization",
        "message": "Invalid Authorization"
    }
}
```
