# OCT Backend API Documentation & cURL Collection

This document contains cURL requests and expected response structures for:
1. **Project CRUD**
2. **Growth Factor Quantification CRUD**
3. **Mechanistic Analysis - Nociception Assay (qPCR Analysis) CRUD**

---

## 📌 Global Configuration & Authentication

- **Base URL**: `http://localhost:3001/api/v1/oct/backend` (Change port/host as per your environment)
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token in `Authorization` header (`Bearer <YOUR_JWT_TOKEN>`)

---

# 1. Project API

### 1.1. Create Project
* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/project/create`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/project/create' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "project_name": "VEGF Drug Study 2026",
    "project_unique_id": "PRJ-VEGF-001",
    "experimental_model": "In-vitro Cell Culture",
    "test_drug": "Compound-X7",
    "reference_drug": "Avastin",
    "status": "new",
    "description": "Comparative Western Blot quantification of VEGF expression"
}'
```

#### Response (200 OK)
```json
{
    "meta": {
        "status": true,
        "message": "LookupCode Created Successfully"
    },
    "data": {
        "id": 1,
        "project_name": "VEGF Drug Study 2026",
        "project_unique_id": "PRJ-VEGF-001",
        "experimental_model": "In-vitro Cell Culture",
        "test_drug": "Compound-X7",
        "reference_drug": "Avastin",
        "status": "new",
        "is_active": true,
        "created_by_id": 101,
        "createdAt": "2026-10-25T11:45:00.000Z",
        "updatedAt": "2026-10-25T11:45:00.000Z"
    }
}
```

---

### 1.2. Get Project by ID
* **Method**: `GET`
* **URL**: `http://localhost:3001/api/v1/oct/backend/project/1`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/project/1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (200 OK)
```json
{
    "meta": {
        "status": true,
        "message": "LookupCode Retrieved Successfully"
    },
    "data": {
        "id": 1,
        "project_name": "VEGF Drug Study 2026",
        "project_unique_id": "PRJ-VEGF-001",
        "experimental_model": "In-vitro Cell Culture",
        "test_drug": "Compound-X7",
        "reference_drug": "Avastin",
        "status": "new",
        "is_active": true,
        "created_by_id": 101,
        "createdAt": "2026-10-25T11:45:00.000Z",
        "updatedAt": "2026-10-25T11:45:00.000Z"
    }
}
```

---

### 1.3. Update Project
* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/project/1/update`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/project/1/update' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "status": "in_progress",
    "description": "Updated project description with completed lane analysis"
}'
```

#### Response (200 OK)
```json
{
    "meta": {
        "status": true,
        "message": "LookupCode Updated Successfully"
    },
    "data": {
        "id": 1,
        "project_name": "VEGF Drug Study 2026",
        "project_unique_id": "PRJ-VEGF-001",
        "experimental_model": "In-vitro Cell Culture",
        "test_drug": "Compound-X7",
        "reference_drug": "Avastin",
        "status": "in_progress",
        "is_active": true,
        "created_by_id": 101,
        "createdAt": "2026-10-25T11:45:00.000Z",
        "updatedAt": "2026-10-25T11:48:00.000Z"
    }
}
```

---

### 1.4. Upsert Project
* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/project/upsert`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/project/upsert' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "lookup_code": "PRJ-VEGF-001",
    "lookup_type": "project",
    "project_name": "VEGF Drug Study 2026",
    "status": "active"
}'
```

#### Response (200 OK)
```json
{
    "meta": {
        "status": true,
        "message": "LookupCode Upserted Successfully"
    },
    "data": {
        "id": 1,
        "lookup_code": "PRJ-VEGF-001",
        "lookup_type": "project",
        "project_name": "VEGF Drug Study 2026",
        "status": "active",
        "updatedAt": "2026-10-25T11:50:00.000Z"
    }
}
```

---

### 1.5. Delete Project
* **Method**: `DELETE`
* **URL**: `http://localhost:3001/api/v1/oct/backend/project/1/delete`

#### cURL Request
```bash
curl --location --request DELETE 'http://localhost:3001/api/v1/oct/backend/project/1/delete' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (200 OK)
```json
{
    "meta": {
        "status": true,
        "message": "LookupCode Deleted Successfully"
    },
    "data": {
        "acknowledged": true,
        "deletedCount": 1
    }
}
```

---

### 1.6. List Projects (with Pagination & Filters)
* **Method**: `GET`
* **URL**: `http://localhost:3001/api/v1/oct/backend/project?is_active=true&page_no=1&per_page=10`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/project?is_active=true&page_no=1&per_page=10' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (200 OK)
```json
{
    "meta": {
        "status": true,
        "message": "LookupCode retrieved Successfully",
        "pagination": {
            "per_page": 10,
            "page_no": 1,
            "total_rows": 1,
            "total_pages": 1
        }
    },
    "data": [
        {
            "id": 1,
            "project_name": "VEGF Drug Study 2026",
            "project_unique_id": "PRJ-VEGF-001",
            "experimental_model": "In-vitro Cell Culture",
            "test_drug": "Compound-X7",
            "reference_drug": "Avastin",
            "status": "new",
            "is_active": true,
            "created_by_id": 101,
            "createdAt": "2026-10-25T11:45:00.000Z",
            "updatedAt": "2026-10-25T11:45:00.000Z"
        }
    ]
}
```

---

### 1.7. Assign Module and Submodule to Project
Assign one or more modules and submodules to a project.

* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/project/assign?project_id=1`  
  *(Alternative URL: `http://localhost:3001/api/v1/oct/backend/project/:id/assign`)*
* **Query Parameters**:
  * `project_id`: ID or unique project code (e.g. `1` or `PRJ-OCT-543`)

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/project/assign?project_id=1' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "module": "Mechanistic analysis",
    "submodule": "Nociception analysis"
}'
```

#### Alternative cURL Request (Multiple Submodules)
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/project/assign?project_id=1' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "module": "Efficacy assessment",
    "submodule": [
        "Wound healing",
        "Barrier integrity"
    ]
}'
```

#### Response (`200 OK`)
```json
{
    "meta": {
        "status": true,
        "message": "Module and Submodule Assigned Successfully"
    },
    "data": {
        "id": 1,
        "project_name": "Oral Mucositis Wound Healing Study",
        "project_unique_id": "PRJ-OCT-543",
        "experimental_model": "OMM-hMPS",
        "test_drug": "Drug A",
        "reference_drug": "Drug B",
        "module": "Mechanistic analysis",
        "submodule": "Nociception analysis",
        "assigned_modules": [
            {
                "module": "Mechanistic analysis",
                "submodule": "Nociception analysis",
                "assigned_at": "2026-10-29T08:23:59.112Z"
            }
        ],
        "status": "new",
        "is_active": true,
        "createdAt": "2026-10-25T16:53:58.745Z",
        "updatedAt": "2026-10-29T08:23:59.112Z"
    }
}
```

---

# 2. Growth Factor Quantification API

### 2.1. Create Growth Factor Quantification
* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/growth-factor-quantification/create`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/growth-factor-quantification/create' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "project_id": 1,
    "category": "vegf",
    "number_of_image_pairs": 1,
    "no_of_layers": 4,
    "lane_order": "Custom",
    "message": "Analysis completed.",
    "success": true,
    "image_results": [
        {
            "pair_number": 1,
            "category": "vegf",
            "target_image": {
                "filename": "vegf_target_1.png",
                "original_image_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
                "processed_image_base64": "iVBORw0KGgoAAAANSUhEUgAA..."
            },
            "actin_image": {
                "filename": "vegf_actin_1.png",
                "original_image_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
                "processed_image_base64": "iVBORw0KGgoAAAANSUhEUgAA..."
            },
            "results": [
                {
                    "lane_no": 1,
                    "lane": "ladder",
                    "lane_category": "target",
                    "lane_group": "ignore",
                    "sample_label": "ladder",
                    "estimated_center_percentage": "12.5",
                    "status": "excluded",
                    "target_intensity": 850505,
                    "beta_actin_intensity": 987626,
                    "common_beta_actin_reference": 1410572.625,
                    "normalized_expression": 0.60295,
                    "fold_change_vs_reference": 1,
                    "rank": 2,
                    "target_background": 36,
                    "target_saturated_fraction": 0.018014,
                    "actin_saturated_fraction": 0.792141
                },
                {
                    "lane_no": 2,
                    "lane": "ctrl1",
                    "lane_category": "target",
                    "lane_group": "control",
                    "sample_label": "ctrl1",
                    "estimated_center_percentage": "37.5",
                    "status": "active",
                    "target_intensity": 1163802,
                    "beta_actin_intensity": 1737862.5,
                    "common_beta_actin_reference": 1410572.625,
                    "normalized_expression": 0.825056,
                    "fold_change_vs_reference": 1.368366,
                    "rank": 1,
                    "target_background": 42,
                    "target_saturated_fraction": 0.103576,
                    "actin_saturated_fraction": 0.600472
                },
                {
                    "lane_no": 3,
                    "lane": "td1",
                    "lane_category": "target",
                    "lane_group": "test_drug",
                    "sample_label": "td1",
                    "estimated_center_percentage": "62.5",
                    "status": "active",
                    "target_intensity": 781193,
                    "beta_actin_intensity": 1739841,
                    "common_beta_actin_reference": 1410572.625,
                    "normalized_expression": 0.553813,
                    "fold_change_vs_reference": 0.918505,
                    "rank": 3,
                    "target_background": 36,
                    "target_saturated_fraction": 0.009524,
                    "actin_saturated_fraction": 0.60481
                },
                {
                    "lane_no": 4,
                    "lane": "rd1",
                    "lane_category": "target",
                    "lane_group": "reference_drug",
                    "sample_label": "rd1",
                    "estimated_center_percentage": "87.5",
                    "status": "active",
                    "target_intensity": 682944,
                    "beta_actin_intensity": 1176961,
                    "common_beta_actin_reference": 1410572.625,
                    "normalized_expression": 0.484161,
                    "fold_change_vs_reference": 0.802986,
                    "rank": 4,
                    "target_background": 36,
                    "target_saturated_fraction": 0.010262,
                    "actin_saturated_fraction": 0.761478
                }
            ],
            "graphs": {
                "target_intensity_graph_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
                "normalized_expression_graph_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
                "fold_change_graph_base64": "iVBORw0KGgoAAAANSUhEUgAA..."
            }
        }
    ]
}'
```

#### Response (200 OK)
```json
{
    "meta": {
        "status": true,
        "message": "GrowthFactorQuantification Created Successfully"
    },
    "data": {
        "id": 1,
        "project_id": 1,
        "category": "vegf",
        "message": "Analysis completed.",
        "success": true,
        "number_of_image_pairs": 1,
        "no_of_layers": 4,
        "lane_order": "Custom",
        "status": "completed",
        "is_active": true,
        "created_by_id": 101,
        "image_results": [
            {
                "pair_number": 1,
                "category": "vegf",
                "target_image": {
                    "filename": "vegf_target_1.png",
                    "original_image_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
                    "processed_image_base64": "iVBORw0KGgoAAAANSUhEUgAA..."
                },
                "actin_image": {
                    "filename": "vegf_actin_1.png",
                    "original_image_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
                    "processed_image_base64": "iVBORw0KGgoAAAANSUhEUgAA..."
                },
                "results": [
                    {
                        "lane_no": 1,
                        "lane": "ladder",
                        "lane_category": "target",
                        "lane_group": "ignore",
                        "sample_label": "ladder",
                        "estimated_center_percentage": "12.5",
                        "status": "excluded",
                        "target_intensity": 850505,
                        "beta_actin_intensity": 987626,
                        "common_beta_actin_reference": 1410572.625,
                        "normalized_expression": 0.60295,
                        "fold_change_vs_reference": 1,
                        "rank": 2,
                        "target_background": 36,
                        "target_saturated_fraction": 0.018014,
                        "actin_saturated_fraction": 0.792141
                    },
                    {
                        "lane_no": 2,
                        "lane": "ctrl1",
                        "lane_category": "target",
                        "lane_group": "control",
                        "sample_label": "ctrl1",
                        "estimated_center_percentage": "37.5",
                        "status": "active",
                        "target_intensity": 1163802,
                        "beta_actin_intensity": 1737862.5,
                        "common_beta_actin_reference": 1410572.625,
                        "normalized_expression": 0.825056,
                        "fold_change_vs_reference": 1.368366,
                        "rank": 1,
                        "target_background": 42,
                        "target_saturated_fraction": 0.103576,
                        "actin_saturated_fraction": 0.600472
                    },
                    {
                        "lane_no": 3,
                        "lane": "td1",
                        "lane_category": "target",
                        "lane_group": "test_drug",
                        "sample_label": "td1",
                        "estimated_center_percentage": "62.5",
                        "status": "active",
                        "target_intensity": 781193,
                        "beta_actin_intensity": 1739841,
                        "common_beta_actin_reference": 1410572.625,
                        "normalized_expression": 0.553813,
                        "fold_change_vs_reference": 0.918505,
                        "rank": 3,
                        "target_background": 36,
                        "target_saturated_fraction": 0.009524,
                        "actin_saturated_fraction": 0.60481
                    },
                    {
                        "lane_no": 4,
                        "lane": "rd1",
                        "lane_category": "target",
                        "lane_group": "reference_drug",
                        "sample_label": "rd1",
                        "estimated_center_percentage": "87.5",
                        "status": "active",
                        "target_intensity": 682944,
                        "beta_actin_intensity": 1176961,
                        "common_beta_actin_reference": 1410572.625,
                        "normalized_expression": 0.484161,
                        "fold_change_vs_reference": 0.802986,
                        "rank": 4,
                        "target_background": 36,
                        "target_saturated_fraction": 0.010262,
                        "actin_saturated_fraction": 0.761478
                    }
                ],
                "graphs": {
                    "target_intensity_graph_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
                    "normalized_expression_graph_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
                    "fold_change_graph_base64": "iVBORw0KGgoAAAANSUhEUgAA..."
                }
            }
        ],
        "createdAt": "2026-10-25T11:55:00.000Z",
        "updatedAt": "2026-10-25T11:55:00.000Z"
    }
}
```

---

### 2.2. Get Growth Factor Quantification by ID
* **Method**: `GET`
* **URL**: `http://localhost:3001/api/v1/oct/backend/growth-factor-quantification/1`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/growth-factor-quantification/1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (200 OK)
```json
{
    "meta": {
        "status": true,
        "message": "GrowthFactorQuantification Retrieved Successfully"
    },
    "data": {
        "id": 1,
        "project_id": 1,
        "category": "vegf",
        "message": "Analysis completed.",
        "success": true,
        "number_of_image_pairs": 1,
        "no_of_layers": 4,
        "lane_order": "Custom",
        "status": "completed",
        "is_active": true,
        "image_results": [
            {
                "pair_number": 1,
                "category": "vegf",
                "results": [ ... ]
            }
        ],
        "createdAt": "2026-10-25T11:55:00.000Z",
        "updatedAt": "2026-10-25T11:55:00.000Z"
    }
}
```

---

### 2.3. Update Growth Factor Quantification
* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/growth-factor-quantification/1/update`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/growth-factor-quantification/1/update' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "category": "vegf",
    "status": "reviewed",
    "message": "Analysis verified by lab director."
}'
```

#### Response (200 OK)
```json
{
    "meta": {
        "status": true,
        "message": "GrowthFactorQuantification Updated Successfully"
    },
    "data": {
        "id": 1,
        "project_id": 1,
        "category": "vegf",
        "status": "reviewed",
        "message": "Analysis verified by lab director.",
        "updatedAt": "2026-10-25T12:00:00.000Z"
    }
}
```

---

### 2.4. Upsert Growth Factor Quantification
* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/growth-factor-quantification/upsert`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/growth-factor-quantification/upsert' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "category": "vegf",
    "project_id": 1,
    "number_of_image_pairs": 1,
    "no_of_layers": 4,
    "lane_order": "Custom",
    "status": "completed"
}'
```

#### Response (200 OK)
```json
{
    "meta": {
        "status": true,
        "message": "GrowthFactorQuantification Upserted Successfully"
    },
    "data": {
        "id": 1,
        "project_id": 1,
        "category": "vegf",
        "status": "completed",
        "updatedAt": "2026-10-25T12:05:00.000Z"
    }
}
```

---

### 2.5. Delete Growth Factor Quantification
* **Method**: `DELETE`
* **URL**: `http://localhost:3001/api/v1/oct/backend/growth-factor-quantification/1/delete`

#### cURL Request
```bash
curl --location --request DELETE 'http://localhost:3001/api/v1/oct/backend/growth-factor-quantification/1/delete' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (200 OK)
```json
{
    "meta": {
        "status": true,
        "message": "GrowthFactorQuantification Deleted Successfully"
    },
    "data": {
        "acknowledged": true,
        "deletedCount": 1
    }
}
```

---

### 2.6. List Growth Factor Quantifications (Filtered & Paginated)
* **Method**: `GET`
* **URL**: `http://localhost:3001/api/v1/oct/backend/growth-factor-quantification?category=vegf&project_id=1&page_no=1&per_page=10`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/growth-factor-quantification?category=vegf&project_id=1&page_no=1&per_page=10' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (200 OK)
```json
{
    "meta": {
        "status": true,
        "message": "GrowthFactorQuantification retrieved Successfully",
        "pagination": {
            "per_page": 10,
            "page_no": 1,
            "total_rows": 1,
            "total_pages": 1
        }
    },
    "data": [
        {
            "id": 1,
            "project_id": 1,
            "category": "vegf",
            "message": "Analysis completed.",
            "success": true,
            "number_of_image_pairs": 1,
            "no_of_layers": 4,
            "lane_order": "Custom",
            "status": "completed",
            "is_active": true,
            "createdAt": "2026-10-25T11:55:00.000Z",
            "updatedAt": "2026-10-25T11:55:00.000Z"
        }
    ]
}
```

---

# 3. Mechanistic Analysis - Nociception Assay (qPCR Analysis) API

### 3.1. Create Nociception Assay
* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/create`  
  *(Alias: `http://localhost:3001/api/v1/oct/backend/nociception-assay/create`)*

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

#### Response (200 OK)
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
        "samples": [ ... ],
        "results": { ... },
        "graphs": { ... },
        "images": { ... },
        "created_by_id": 1,
        "createdAt": "2026-10-28T16:44:34.000Z",
        "updatedAt": "2026-10-28T16:44:34.000Z"
    }
}
```

---

### 3.2. Get Nociception Assay by ID
* **Method**: `GET`
* **URL**: `http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/1`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (200 OK)
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

---

### 3.3. Update Nociception Assay
* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/1/update`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/1/update' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "assay_name": "Updated Nociception Assay Study",
    "status": "verified"
}'
```

#### Response (200 OK)
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

### 3.4. Upsert Nociception Assay
* **Method**: `POST`
* **URL**: `http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/upsert`

#### cURL Request
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

#### Response (200 OK)
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

### 3.5. List Nociception Assays (with Filters & Pagination)
* **Method**: `GET`
* **URL**: `http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay?page_no=1&per_page=10&project_id=1&is_active=true`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay?page_no=1&per_page=10&project_id=1&is_active=true' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (200 OK)
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

### 3.6. Delete Nociception Assay
* **Method**: `DELETE`
* **URL**: `http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/1/delete`

#### cURL Request
```bash
curl --location --request DELETE 'http://localhost:3001/api/v1/oct/backend/mechanistic-analysis/nociception-assay/1/delete' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (200 OK)
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

## ⚠️ Common Error Responses

### 1. Validation Error (HTTP 500)
Returned when payload fails Zod schema validation:
```json
{
    "meta": {
        "status": false,
        "message": "Validation Failed"
    },
    "error": [
        {
            "code": "too_small",
            "minimum": 1,
            "type": "string",
            "inclusive": true,
            "exact": false,
            "message": "Category is required",
            "path": ["category"]
        }
    ]
}
```

### 2. Record Not Found (HTTP 404)
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

### 3. Unauthorized (HTTP 401)
Returned when `Authorization` header is missing or JWT token is invalid:
```json
{
    "meta": {
        "status": false,
        "message": "Unauthorized"
    },
    "error": {
        "name": "Authentication Error",
        "message": "Token expired or invalid"
    }
}
```
