# Safety & Efficacy Assessment API Documentation & Frontend Binding Guide
**Oral Cell Technology (OCT) Platform - REST API Collection**

This document contains complete **cURL requests**, **request payloads**, **TypeScript interfaces**, and **expected response envelopes** for:
1. **Safety Assessment**:
   * `adventitious_agents`
   * `induced_inflammation`
   * `mycoplasma_testing`
2. **Efficacy Assessment**:
   * `wound_healing`

All endpoints follow the standardized OCT API envelope convention (`meta`, `data`, `pagination`, `error`) and are ready for binding in React 18 / Redux Toolkit (RTK Query), Axios, or Fetch.

---

## 📌 Global Configuration & Common Headers

* **Base Server URL**: `http://localhost:3001` *(or configured environment host)*
* **Content-Type**: `application/json`
* **Authorization**: `Bearer <YOUR_JWT_TOKEN>` *(JWT Bearer Token)*

### Global Response Envelope Structures

#### 1. Standard Success Response (`SUCCESS_RESP`)
```typescript
interface ApiResponse<T> {
  meta: {
    status: true;
    message: string;
  };
  data: T;
}
```

#### 2. Paginated Success Response (`SUCCESS_RESP_WITH_PAGINATION`)
```typescript
interface PaginatedApiResponse<T> {
  meta: {
    status: true;
    message: string;
    pagination: {
      per_page: number;
      page_no: number;
      total_rows: number;
      total_pages: number;
    };
  };
  data: T[];
}
```

#### 3. Error / Validation Failure Response (`FAILURE_RESP`)
```typescript
interface ApiFailureResponse {
  meta: {
    status: false;
    message: string;
  };
  error: {
    name: string;
    message: any;
  };
}
```

---

# SECTION 1: SAFETY ASSESSMENT

---

## 1. Adventitious Agents (`adventitious_agents`)

Screening panel across 7 viral agents (**HIV-1, HBV, HCV, CMV, EBV, BKV, JCV**) with negative, positive, and internal process controls.

* **Module URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents`
* **Alias URL**: `http://localhost:3001/api/v1/oct/backend/adventitious-agents`

### Frontend TypeScript Interface
```typescript
export interface AdventitiousAgentsRecord {
  id: number;
  project_id?: number;
  category: string; // "safety_assessment"
  assay_type: string; // "qPCR / RT-qPCR"
  calculation_method: string; // "Ct cutoff-based screening"
  sample_details?: {
    sample_id?: string;
    sample_type?: string;
    collection_point?: string;
    extraction_method?: string;
    internal_control_type?: string;
    internal_control_name?: string;
    extraction_control_status?: string;
  };
  assay_configuration?: Array<{
    viral_agent: string;
    assay: string;
    positive_control_id: string;
    cutoff: number;
    borderline_interval: number;
    lod?: string | number;
    max_accepted_ct: number;
    internal_control_range?: { min_ct: number; max_ct: number };
    suggested_internal_control?: string;
  }>;
  samples?: Array<{
    sample_id: string;
    sample_type: string;
    collection_point: string;
    extraction_method: string;
    viral_inputs: Array<{
      viral_agent: string;
      sample_ct: number;
      positive_control_ct: number;
      negative_control_ct: number;
      internal_control_ct: number;
    }>;
  }>;
  results?: Array<{
    viral_agent: string;
    assay: string;
    positive_control_id: string;
    sample_ct: number;
    sample_ct_status: string;
    positive_control_ct: number;
    positive_control_status: string;
    negative_control_ct: number;
    negative_control_status: string;
    internal_control_ct: number;
    internal_control_status: string;
    delta_ct_sample_minus_positive: number;
    cutoff: number;
    borderline_interval: number;
    borderline_range?: { lower_inclusive: number; upper_exclusive: number };
    lod?: string | number;
    max_accepted_ct: number;
    internal_control_range?: { min_ct: number; max_ct: number };
    run_validity: string;
    internal_control_qc: string;
    qc_status: string;
    screening_result: string;
    interpretation: string;
    notes?: any[];
  }>;
  summary?: {
    total_targets: number;
    not_detected: number;
    detected: number;
    inconclusive: number;
    invalid: number;
    overall_viral_screening_status: string;
    assay_controls: string;
    pcr_inhibition: string;
    overall_safety_assessment: string;
  };
  graphs?: Record<string, any>;
  message?: string;
  success?: boolean;
  status?: string; // "completed" | "in_progress"
  is_active?: boolean;
  created_by_id?: number;
  updated_by_id?: number;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: number;
    project_name: string;
    project_unique_id: string;
    experimental_model: string;
    test_drug: string;
    reference_drug: string;
    status: string;
    is_active: boolean;
  } | null;
}
```

### 1.1 Create Adventitious Agents Record
* **Method**: `POST`
* **Route**: `/api/v1/oct/backend/safety-assessment/adventitious-agents/create`

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
        }
    ],
    "summary": {
        "total_targets": 2,
        "not_detected": 2,
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

#### Response (200 OK)
```json
{
  "meta": {
    "status": true,
    "message": "AdventitiousAgents Created Successfully"
  },
  "data": {
    "id": 1,
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
    "assay_configuration": [ ... ],
    "samples": [ ... ],
    "results": [ ... ],
    "summary": {
      "total_targets": 2,
      "not_detected": 2,
      "detected": 0,
      "inconclusive": 0,
      "invalid": 0,
      "overall_viral_screening_status": "All targets not detected",
      "assay_controls": "Valid",
      "pcr_inhibition": "Not detected",
      "overall_safety_assessment": "Pass"
    },
    "graphs": {},
    "is_active": true,
    "status": "completed",
    "created_by_id": 101,
    "createdAt": "2026-10-31T05:00:00.000Z",
    "updatedAt": "2026-10-31T05:00:00.000Z"
  }
}
```

---

### 1.2 Upsert Adventitious Agents Record
* **Method**: `POST`
* **Route**: `/api/v1/oct/backend/safety-assessment/adventitious-agents/upsert`

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

#### Response (200 OK)
```json
{
  "meta": {
    "status": true,
    "message": "AdventitiousAgents Upserted Successfully"
  },
  "data": {
    "id": 1,
    "project_id": 1,
    "category": "safety_assessment",
    "summary": {
      "total_targets": 7,
      "not_detected": 7,
      "overall_safety_assessment": "Pass"
    },
    "updatedAt": "2026-10-31T05:01:00.000Z"
  }
}
```

---

### 1.3 Update Adventitious Agents Record by ID
* **Method**: `POST`
* **Route**: `/api/v1/oct/backend/safety-assessment/adventitious-agents/:id/update`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents/1/update' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "status": "completed",
    "message": "Viral panel screening verified by QA"
}'
```

#### Response (200 OK)
```json
{
  "meta": {
    "status": true,
    "message": "AdventitiousAgents Updated Successfully"
  },
  "data": {
    "id": 1,
    "status": "completed",
    "message": "Viral panel screening verified by QA",
    "updatedAt": "2026-10-31T05:02:00.000Z"
  }
}
```

---

### 1.4 Get Adventitious Agents Record by ID
* **Method**: `GET`
* **Route**: `/api/v1/oct/backend/safety-assessment/adventitious-agents/:id`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents/1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (200 OK)
```json
{
  "meta": {
    "status": true,
    "message": "AdventitiousAgents Retrieved Successfully"
  },
  "data": {
    "id": 1,
    "project_id": 1,
    "category": "safety_assessment",
    "assay_type": "qPCR / RT-qPCR",
    "calculation_method": "Ct cutoff-based screening",
    "sample_details": { ... },
    "assay_configuration": [ ... ],
    "samples": [ ... ],
    "results": [ ... ],
    "summary": { ... },
    "graphs": {},
    "is_active": true,
    "status": "completed",
    "createdAt": "2026-10-31T05:00:00.000Z",
    "updatedAt": "2026-10-31T05:02:00.000Z",
    "project": {
      "id": 1,
      "project_name": "OMM Drug Safety Protocol",
      "project_unique_id": "PRJ-SAFE-001",
      "experimental_model": "3D Oral Mucosa (OMM-hMPS)",
      "test_drug": "Candidate-T100",
      "reference_drug": "Reference-R64",
      "status": "active",
      "is_active": true
    }
  }
}
```

---

### 1.5 List Adventitious Agents Records (with Filtering & Pagination)
* **Method**: `GET`
* **Route**: `/api/v1/oct/backend/safety-assessment/adventitious-agents?page_no=1&per_page=10&project_id=1&category=safety_assessment`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents?page_no=1&per_page=10&project_id=1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (200 OK)
```json
{
  "meta": {
    "status": true,
    "message": "AdventitiousAgents retrieved Successfully",
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
      "category": "safety_assessment",
      "assay_type": "qPCR / RT-qPCR",
      "summary": { ... },
      "status": "completed",
      "project": { ... }
    }
  ]
}
```

---

### 1.6 Delete Adventitious Agents Record by ID
* **Method**: `DELETE`
* **Route**: `/api/v1/oct/backend/safety-assessment/adventitious-agents/:id/delete`

#### cURL Request
```bash
curl --location --request DELETE 'http://localhost:3001/api/v1/oct/backend/safety-assessment/adventitious-agents/1/delete' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (200 OK)
```json
{
  "meta": {
    "status": true,
    "message": "AdventitiousAgents Deleted Successfully"
  },
  "data": {
    "acknowledged": true,
    "deletedCount": 1
  }
}
```

---

## 2. Induced Inflammation (`induced_inflammation`)

ELISA & Potency testing quantifying standard curves and 4PL/5PL curves ($IC_{50}$, $\log(IC_{50})$, HillSlope, $R^2$, and Relative Potency %).

* **Module URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation`
* **Alias URL**: `http://localhost:3001/api/v1/oct/backend/induced-inflammation`

### Frontend TypeScript Interface
```typescript
export interface InducedInflammationRecord {
  id: number;
  project_id?: number;
  category: string; // "safety_assessment"
  drug_name?: string;
  batch_no?: string;
  marker?: string; // e.g. "CD25"
  dilution_factor?: number;
  subtract_blank?: boolean;
  method?: string; // "shared"
  test_drug_group?: string; // "QC100"
  reference_drug_group?: string; // "QC64"
  available_sample_groups?: string[];
  warnings?: any[];
  blank?: number;
  n_blank?: number;
  relative_potency?: {
    value: number;
    unit: string; // "%"
    method: string;
  };
  standard_curve?: {
    parameters: {
      Bottom: number;
      Top: number;
      IC50: number;
      logIC50: number;
      HillSlope: number;
      R2: number;
      [key: string]: any;
    };
    table: Array<{ Parameter: string; Value: string }>;
  };
  potency_curve?: {
    parameters: Record<string, {
      Bottom: number;
      Top: number;
      IC50: number;
      logIC50: number;
      HillSlope: number;
      R2: number;
    }>;
    table: Array<Record<string, any>>;
  };
  samples?: Array<{
    Sample: string;
    "Replicate #1"?: string;
    "Replicate #2"?: string;
    "Average (pg/mL)"?: string;
    "Std Dev"?: string;
    [key: string]: any;
  }>;
  graphs?: {
    standard_curve?: { mime_type: string; encoding: string; image_base64: string };
    bar_graph?: { mime_type: string; encoding: string; image_base64: string };
    potency_curve?: { mime_type: string; encoding: string; image_base64: string };
    [key: string]: any;
  };
  exports?: Record<string, any>;
  uploaded_file?: Record<string, any>;
  message?: string;
  success?: boolean;
  status?: string;
  is_active?: boolean;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: number;
    project_name: string;
    project_unique_id: string;
    experimental_model: string;
    test_drug: string;
    reference_drug: string;
    status: string;
    is_active: boolean;
  } | null;
}
```

### 2.1 Create Induced Inflammation Record
* **Method**: `POST`
* **Route**: `/api/v1/oct/backend/safety-assessment/induced-inflammation/create`

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
        "value": 109.52,
        "unit": "%",
        "method": "shared"
    },
    "standard_curve": {
        "parameters": {
            "Bottom": 0.1028,
            "Top": 12.128,
            "IC50": 1444.98,
            "logIC50": 3.16,
            "HillSlope": -0.97,
            "R2": 0.9997
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
                "Bottom": 0.133,
                "Top": 0.295,
                "IC50": 11.38,
                "logIC50": 1.056,
                "HillSlope": 0.632,
                "R2": 0.965
            },
            "QC64": {
                "Bottom": 0.133,
                "Top": 0.295,
                "IC50": 12.47,
                "logIC50": 1.096,
                "HillSlope": 0.632,
                "R2": 0.950
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

#### Response (200 OK)
```json
{
  "meta": {
    "status": true,
    "message": "InducedInflammation Created Successfully"
  },
  "data": {
    "id": 1,
    "project_id": 1,
    "category": "safety_assessment",
    "drug_name": "TestDrug",
    "batch_no": "BATCH001",
    "marker": "CD25",
    "dilution_factor": 1,
    "subtract_blank": false,
    "method": "shared",
    "test_drug_group": "QC100",
    "reference_drug_group": "QC64",
    "available_sample_groups": [ "QC100", "QC64" ],
    "warnings": [],
    "blank": 0.043,
    "n_blank": 2,
    "relative_potency": {
      "value": 109.52,
      "unit": "%",
      "method": "shared"
    },
    "standard_curve": { ... },
    "potency_curve": { ... },
    "samples": [ ... ],
    "graphs": {},
    "is_active": true,
    "status": "completed",
    "created_by_id": 101,
    "createdAt": "2026-10-31T05:00:00.000Z",
    "updatedAt": "2026-10-31T05:00:00.000Z"
  }
}
```

---

### 2.2 Upsert Induced Inflammation Record
* **Method**: `POST`
* **Route**: `/api/v1/oct/backend/safety-assessment/induced-inflammation/upsert`

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

### 2.3 Update Induced Inflammation Record by ID
* **Method**: `POST`
* **Route**: `/api/v1/oct/backend/safety-assessment/induced-inflammation/:id/update`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation/1/update' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "status": "completed",
    "message": "Approved by Bioanalytical Lead"
}'
```

---

### 2.4 Get Induced Inflammation Record by ID
* **Method**: `GET`
* **Route**: `/api/v1/oct/backend/safety-assessment/induced-inflammation/:id`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation/1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (200 OK)
```json
{
  "meta": {
    "status": true,
    "message": "InducedInflammation Retrieved Successfully"
  },
  "data": {
    "id": 1,
    "project_id": 1,
    "category": "safety_assessment",
    "drug_name": "TestDrug",
    "batch_no": "BATCH001",
    "marker": "CD25",
    "relative_potency": {
      "value": 109.52,
      "unit": "%",
      "method": "shared"
    },
    "standard_curve": { ... },
    "potency_curve": { ... },
    "samples": [ ... ],
    "graphs": { ... },
    "status": "completed",
    "project": {
      "id": 1,
      "project_name": "OMM Drug Safety Protocol",
      "project_unique_id": "PRJ-SAFE-001",
      "experimental_model": "3D Oral Mucosa (OMM-hMPS)",
      "test_drug": "Candidate-T100",
      "reference_drug": "Reference-R64",
      "status": "active",
      "is_active": true
    }
  }
}
```

---

### 2.5 List Induced Inflammation Records
* **Method**: `GET`
* **Route**: `/api/v1/oct/backend/safety-assessment/induced-inflammation?page_no=1&per_page=10&drug_name=TestDrug&marker=CD25`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation?page_no=1&per_page=10&marker=CD25' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

---

### 2.6 Delete Induced Inflammation Record by ID
* **Method**: `DELETE`
* **Route**: `/api/v1/oct/backend/safety-assessment/induced-inflammation/:id/delete`

#### cURL Request
```bash
curl --location --request DELETE 'http://localhost:3001/api/v1/oct/backend/safety-assessment/induced-inflammation/1/delete' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

---

## 3. Mycoplasma Testing (`mycoplasma_testing`)

Mycoplasma contamination rapid qPCR screening with $C_t$ thresholds ($<35.0$), extraction blanks, and positive/negative controls.

* **Module URL**: `http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing`
* **Alias URL**: `http://localhost:3001/api/v1/oct/backend/mycoplasma-testing`

### Frontend TypeScript Interface
```typescript
export interface MycoplasmaTestingRecord {
  id: number;
  project_id?: number;
  category: string; // "safety_assessment"
  assay_type: string; // "Mycoplasma_qPCR"
  calculation_method: string; // "Ct cutoff-based screening"
  assay_rules?: {
    cutoff?: number; // 35
    borderline?: number; // 1
    borderline_lower_limit?: number; // 34
    max_ct?: number; // 40
    internal_control_min?: number; // 20
    internal_control_max?: number; // 30
    positive_control_requirement?: string;
    negative_control_requirement?: string;
    extraction_blank_requirement?: string;
  };
  samples?: Array<{
    sample_id: string;
    target_ct: number;
    internal_control_ct: number;
  }>;
  results?: Array<{
    sample_id: string;
    target_ct: number;
    target_ct_status: string;
    internal_control_ct: number;
    internal_control_status: string;
    positive_control_ct: number;
    positive_control_status: string;
    negative_control: string;
    extraction_blank: string;
    delta_ct_target_minus_positive_control: number;
    cutoff: number;
    borderline_range?: {
      lower_inclusive: number;
      upper_exclusive: number;
    };
    screening_result: string; // "Detected" | "Not detected"
    interpretation: string;
    qc_status: string; // "Pass" | "Fail"
  }>;
  graphs?: Record<string, any>;
  message?: string;
  success?: boolean;
  status?: string;
  is_active?: boolean;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: number;
    project_name: string;
    project_unique_id: string;
    experimental_model: string;
    test_drug: string;
    reference_drug: string;
    status: string;
    is_active: boolean;
  } | null;
}
```

### 3.1 Create Mycoplasma Testing Record
* **Method**: `POST`
* **Route**: `/api/v1/oct/backend/safety-assessment/mycoplasma-testing/create`

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

#### Response (200 OK)
```json
{
  "meta": {
    "status": true,
    "message": "MycoplasmaTesting Created Successfully"
  },
  "data": {
    "id": 1,
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
    "graphs": {},
    "is_active": true,
    "status": "completed",
    "created_by_id": 101,
    "createdAt": "2026-10-31T05:00:00.000Z",
    "updatedAt": "2026-10-31T05:00:00.000Z"
  }
}
```

---

### 3.2 Upsert Mycoplasma Testing Record
* **Method**: `POST`
* **Route**: `/api/v1/oct/backend/safety-assessment/mycoplasma-testing/upsert`

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

### 3.3 Update Mycoplasma Testing Record by ID
* **Method**: `POST`
* **Route**: `/api/v1/oct/backend/safety-assessment/mycoplasma-testing/:id/update`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing/1/update' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "status": "completed",
    "message": "Re-tested negative after quarantine"
}'
```

---

### 3.4 Get Mycoplasma Testing Record by ID
* **Method**: `GET`
* **Route**: `/api/v1/oct/backend/safety-assessment/mycoplasma-testing/:id`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing/1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (200 OK)
```json
{
  "meta": {
    "status": true,
    "message": "MycoplasmaTesting Retrieved Successfully"
  },
  "data": {
    "id": 1,
    "project_id": 1,
    "category": "safety_assessment",
    "assay_type": "Mycoplasma_qPCR",
    "calculation_method": "Ct cutoff-based screening",
    "assay_rules": { ... },
    "samples": [ ... ],
    "results": [ ... ],
    "graphs": {},
    "status": "completed",
    "project": {
      "id": 1,
      "project_name": "OMM Drug Safety Protocol",
      "project_unique_id": "PRJ-SAFE-001",
      "experimental_model": "3D Oral Mucosa (OMM-hMPS)",
      "test_drug": "Candidate-T100",
      "reference_drug": "Reference-R64",
      "status": "active",
      "is_active": true
    }
  }
}
```

---

### 3.5 List Mycoplasma Testing Records
* **Method**: `GET`
* **Route**: `/api/v1/oct/backend/safety-assessment/mycoplasma-testing?page_no=1&per_page=10&project_id=1`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing?page_no=1&per_page=10&project_id=1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

---

### 3.6 Delete Mycoplasma Testing Record by ID
* **Method**: `DELETE`
* **Route**: `/api/v1/oct/backend/safety-assessment/mycoplasma-testing/:id/delete`

#### cURL Request
```bash
curl --location --request DELETE 'http://localhost:3001/api/v1/oct/backend/safety-assessment/mycoplasma-testing/1/delete' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

---

# SECTION 2: EFFICACY ASSESSMENT

---

## 4. Wound Healing Assay (`wound_healing`)

Microscopy scratch batch image analysis calculating **0-hour vs. 24-hour wound area**, **% closure rate**, and **cellular migration velocity** across Control, RD, and TD groups.

* **Module URL**: `http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing`
* **Alias URL**: `http://localhost:3001/api/v1/oct/backend/wound-healing`

### Frontend TypeScript Interface
```typescript
export interface WoundHealingRecord {
  id: number;
  project_id?: number;
  category: string; // "efficacy_assessment"
  analysis_type?: string; // "microscopy_image_batch"
  patient_id?: string; // e.g. "sample_001"
  app_inputs?: Record<string, any>;
  image_count?: number;
  images?: Array<{
    image_id: string; // e.g. "Control_0h", "TD_24h"
    sample_group: string; // "Control" | "RD" | "TD"
    time_hours: number; // 0 | 24
    filename: string;
    mime_type: string; // "image/png"
    encoding: string; // "base64"
    image_base64: string;
    width?: number;
    height?: number;
    detected_format?: string;
  }>;
  results?: {
    wound_area_0h?: number;
    wound_area_24h?: number;
    closure_percentage?: number;
    migration_rate_um_hr?: number;
    td_vs_rd_ratio?: number;
    [key: string]: any;
  };
  graphs?: any[];
  output_images?: any[];
  data?: {
    analysis_type?: string;
    patient_id?: string;
    app_inputs?: Record<string, any>;
    image_count?: number;
    images?: Array<any>;
    results?: Record<string, any>;
    graphs?: any[];
    output_images?: any[];
  };
  meta?: {
    status?: boolean;
    message?: string;
  };
  message?: string;
  success?: boolean;
  status?: string;
  is_active?: boolean;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: number;
    project_name: string;
    project_unique_id: string;
    experimental_model: string;
    test_drug: string;
    reference_drug: string;
    status: string;
    is_active: boolean;
  } | null;
}
```

### 4.1 Create Wound Healing Record
* **Method**: `POST`
* **Route**: `/api/v1/oct/backend/efficacy-assessment/wound-healing/create`

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
                "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
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
                "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
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
                "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
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
                "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
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
                "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
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
                "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                "width": 407,
                "height": 370,
                "detected_format": "PNG"
            }
        ],
        "results": {
            "control_closure_pct": 34.5,
            "rd_closure_pct": 68.2,
            "td_closure_pct": 85.9,
            "relative_efficacy_td_vs_rd": 1.26
        },
        "graphs": [],
        "output_images": []
    }
}'
```

#### Response (200 OK)
```json
{
  "meta": {
    "status": true,
    "message": "WoundHealing Created Successfully"
  },
  "data": {
    "id": 1,
    "project_id": 1,
    "category": "efficacy_assessment",
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
        "image_base64": "iVBORw0KGgoAAAANSUhEUg...",
        "width": 415,
        "height": 363,
        "detected_format": "PNG"
      },
      ...
    ],
    "results": {
      "control_closure_pct": 34.5,
      "rd_closure_pct": 68.2,
      "td_closure_pct": 85.9,
      "relative_efficacy_td_vs_rd": 1.26
    },
    "graphs": [],
    "output_images": [],
    "data": { ... },
    "meta": {
      "status": true,
      "message": "Six input images validated; supplied application inputs and results preserved."
    },
    "is_active": true,
    "status": "completed",
    "created_by_id": 101,
    "createdAt": "2026-10-31T05:00:00.000Z",
    "updatedAt": "2026-10-31T05:00:00.000Z"
  }
}
```

---

### 4.2 Upsert Wound Healing Record
* **Method**: `POST`
* **Route**: `/api/v1/oct/backend/efficacy-assessment/wound-healing/upsert`

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

#### Response (200 OK)
```json
{
  "meta": {
    "status": true,
    "message": "WoundHealing Upserted Successfully"
  },
  "data": {
    "id": 1,
    "project_id": 1,
    "category": "efficacy_assessment",
    "patient_id": "sample_001",
    "analysis_type": "microscopy_image_batch",
    "updatedAt": "2026-10-31T05:01:00.000Z"
  }
}
```

---

### 4.3 Update Wound Healing Record by ID
* **Method**: `POST`
* **Route**: `/api/v1/oct/backend/efficacy-assessment/wound-healing/:id/update`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing/1/update' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
--data '{
    "status": "completed",
    "message": "Migration velocity calculation verified"
}'
```

#### Response (200 OK)
```json
{
  "meta": {
    "status": true,
    "message": "WoundHealing Updated Successfully"
  },
  "data": {
    "id": 1,
    "status": "completed",
    "message": "Migration velocity calculation verified",
    "updatedAt": "2026-10-31T05:02:00.000Z"
  }
}
```

---

### 4.4 Get Wound Healing Record by ID
* **Method**: `GET`
* **Route**: `/api/v1/oct/backend/efficacy-assessment/wound-healing/:id`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing/1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (200 OK)
```json
{
  "meta": {
    "status": true,
    "message": "WoundHealing Retrieved Successfully"
  },
  "data": {
    "id": 1,
    "project_id": 1,
    "category": "efficacy_assessment",
    "analysis_type": "microscopy_image_batch",
    "patient_id": "sample_001",
    "image_count": 6,
    "images": [ ... ],
    "results": {
      "control_closure_pct": 34.5,
      "rd_closure_pct": 68.2,
      "td_closure_pct": 85.9,
      "relative_efficacy_td_vs_rd": 1.26
    },
    "graphs": [],
    "output_images": [],
    "status": "completed",
    "createdAt": "2026-10-31T05:00:00.000Z",
    "updatedAt": "2026-10-31T05:02:00.000Z",
    "project": {
      "id": 1,
      "project_name": "OMM Wound Healing Study 2026",
      "project_unique_id": "PRJ-EFF-001",
      "experimental_model": "3D Oral Mucosa (OMM-hMPS)",
      "test_drug": "Candidate-T100",
      "reference_drug": "Reference-R64",
      "status": "active",
      "is_active": true
    }
  }
}
```

---

### 4.5 List Wound Healing Records (with Filtering & Pagination)
* **Method**: `GET`
* **Route**: `/api/v1/oct/backend/efficacy-assessment/wound-healing?page_no=1&per_page=10&project_id=1&patient_id=sample_001`

#### cURL Request
```bash
curl --location 'http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing?page_no=1&per_page=10&project_id=1' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (200 OK)
```json
{
  "meta": {
    "status": true,
    "message": "WoundHealing retrieved Successfully",
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
      "category": "efficacy_assessment",
      "patient_id": "sample_001",
      "image_count": 6,
      "results": { ... },
      "status": "completed",
      "project": { ... }
    }
  ]
}
```

---

### 4.6 Delete Wound Healing Record by ID
* **Method**: `DELETE`
* **Route**: `/api/v1/oct/backend/efficacy-assessment/wound-healing/:id/delete`

#### cURL Request
```bash
curl --location --request DELETE 'http://localhost:3001/api/v1/oct/backend/efficacy-assessment/wound-healing/1/delete' \
--header 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

#### Response (200 OK)
```json
{
  "meta": {
    "status": true,
    "message": "WoundHealing Deleted Successfully"
  },
  "data": {
    "acknowledged": true,
    "deletedCount": 1
  }
}
```

---

## 5. Frontend RTK Query / Axios Quick Integration Snippet

### Redux Toolkit (RTK Query) Base Service Setup
```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const octApi = createApi({
  reducerPath: 'octApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001/api/v1/oct/backend',
    prepareHeaders: (headers, { getState }: any) => {
      const token = getState().auth?.token || localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'AdventitiousAgents',
    'InducedInflammation',
    'MycoplasmaTesting',
    'WoundHealing'
  ],
  endpoints: (builder) => ({
    // 1. Adventitious Agents
    getAdventitiousAgentsList: builder.query({
      query: (params) => ({ url: '/safety-assessment/adventitious-agents', params }),
      providesTags: ['AdventitiousAgents'],
    }),
    createAdventitiousAgents: builder.mutation({
      query: (body) => ({
        url: '/safety-assessment/adventitious-agents/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdventitiousAgents'],
    }),

    // 2. Induced Inflammation
    getInducedInflammationList: builder.query({
      query: (params) => ({ url: '/safety-assessment/induced-inflammation', params }),
      providesTags: ['InducedInflammation'],
    }),
    createInducedInflammation: builder.mutation({
      query: (body) => ({
        url: '/safety-assessment/induced-inflammation/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['InducedInflammation'],
    }),

    // 3. Mycoplasma Testing
    getMycoplasmaTestingList: builder.query({
      query: (params) => ({ url: '/safety-assessment/mycoplasma-testing', params }),
      providesTags: ['MycoplasmaTesting'],
    }),
    createMycoplasmaTesting: builder.mutation({
      query: (body) => ({
        url: '/safety-assessment/mycoplasma-testing/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MycoplasmaTesting'],
    }),

    // 4. Wound Healing
    getWoundHealingList: builder.query({
      query: (params) => ({ url: '/efficacy-assessment/wound-healing', params }),
      providesTags: ['WoundHealing'],
    }),
    createWoundHealing: builder.mutation({
      query: (body) => ({
        url: '/efficacy-assessment/wound-healing/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['WoundHealing'],
    }),
  }),
});

export const {
  useGetAdventitiousAgentsListQuery,
  useCreateAdventitiousAgentsMutation,
  useGetInducedInflammationListQuery,
  useCreateInducedInflammationMutation,
  useGetMycoplasmaTestingListQuery,
  useCreateMycoplasmaTestingMutation,
  useGetWoundHealingListQuery,
  useCreateWoundHealingMutation,
} = octApi;
```

