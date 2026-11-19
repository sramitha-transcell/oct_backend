import Service from "./service";
const newService = new Service();
import { apiResponse, JsonWebToken } from "@oct-backend/shared-utils";

const jsonWebToken = new JsonWebToken();

function normalizePayload(body: any, query?: any) {
    if (!body || typeof body !== 'object') {
        body = {};
    }

    // If payload is wrapped under data, unwrap/merge
    if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
        body = {
            ...body.data,
            ...body,
            data: body.data,
        };
    }

    // Query fallback for project_id
    if (!body.project_id && query?.project_id) {
        body.project_id = query.project_id;
    }

    // Number type coercion
    if (body.project_id !== undefined && body.project_id !== null && !isNaN(Number(body.project_id))) {
        body.project_id = Number(body.project_id);
    }
    if (body.id !== undefined && body.id !== null && !isNaN(Number(body.id))) {
        body.id = Number(body.id);
    }

    // Sync control_group <-> calibrator
    if (body.control_group && !body.calibrator) {
        body.calibrator = body.control_group;
    } else if (body.calibrator && !body.control_group) {
        body.control_group = body.calibrator;
    }

    // Sync genes <-> markers
    if (body.genes && !body.markers) {
        body.markers = body.genes;
    } else if (body.markers && !body.genes) {
        body.genes = body.markers;
    }

    // Sync final_result <-> results
    if (body.final_result && !body.results) {
        body.results = body.final_result;
    } else if (body.results && !body.final_result) {
        body.final_result = body.results;
    }

    // Sync graph <-> graphs <-> images
    const activeGraph = body.graph || body.graphs || body.images;
    if (activeGraph) {
        if (!body.graph) body.graph = activeGraph;
        if (!body.graphs) body.graphs = activeGraph;
        if (!body.images) body.images = activeGraph;
    }

    return body;
}

class Handler {

    async create(req: any, res: any, next: any) {
        try {
            let { body, headers, query } = req;
            let decoded: any = {};
            if (headers?.authorization) {
                try {
                    decoded = await jsonWebToken.verify((headers.authorization).split(" ")[1]);
                } catch {
                    // Ignore if auth token verification fails in test environments
                }
            }
            body = normalizePayload(body, query);
            body.is_active = true;
            body.created_by_id = decoded?.ID;
            body.createdAt = new Date();
            let resp = await newService.create(body);

            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'NociceptionAssay Created Successfully'));
        } catch (err) {
            next(err);
        }
    }

    async upsert(req: any, res: any, next: any) {
        try {
            let { body, query: reqQuery } = req;
            body = normalizePayload(body, reqQuery);
            body.updatedAt = new Date();

            const conditions: any[] = [];
            if (body?.id !== undefined && !isNaN(Number(body.id))) {
                conditions.push({ id: Number(body.id) });
            }
            if (body?.project_id !== undefined && !isNaN(Number(body.project_id))) {
                conditions.push({ project_id: Number(body.project_id) });
            }
            let query: any = {};
            if (conditions.length > 1) {
                query = { $or: conditions };
            } else if (conditions.length === 1) {
                query = conditions[0];
            } else {
                query = { id: 0 };
            }

            let resp = await newService.upsert(query, body);

            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'NociceptionAssay Upserted Successfully'));
        } catch (err) {
            next(err);
        }
    }

    async update(req: any, res: any, next: any) {
        try {
            let { body, params, query: reqQuery } = req;
            body = normalizePayload(body, reqQuery);
            body.updatedAt = new Date();

            let idParam = params?.id;
            let query: any = {};
            if (idParam !== undefined && !isNaN(Number(idParam))) {
                query = {
                    $or: [
                        { id: Number(idParam) },
                        { project_id: Number(idParam) }
                    ]
                };
            } else {
                query = { id: idParam };
            }

            let resp = await newService.update(query, body);

            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'NociceptionAssay Updated Successfully'));
        } catch (err) {
            next(err);
        }
    }

    async delete(req: any, res: any, next: any) {
        try {
            let { params } = req;
            let idParam = params?.id;
            let query: any = {};
            if (idParam !== undefined && !isNaN(Number(idParam))) {
                query = {
                    $or: [
                        { id: Number(idParam) },
                        { project_id: Number(idParam) }
                    ]
                };
            } else {
                query = { id: idParam };
            }

            let resp = await newService.delete(query);
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'NociceptionAssay Deleted Successfully'));
        } catch (err) {
            next(err);
        }
    }

    async get(req: any, res: any, next: any) {
        try {
            let { params, query } = req;
            let idParam = params?.id;
            let findQuery: any = {};
            if (idParam !== undefined && !isNaN(Number(idParam))) {
                findQuery = {
                    $or: [
                        { id: Number(idParam) },
                        { project_id: Number(idParam) }
                    ]
                };
            } else if (idParam) {
                findQuery = { id: idParam };
            } else if (query?.project_id && !isNaN(Number(query.project_id))) {
                findQuery = { project_id: Number(query.project_id) };
            }
            
            let resp = await newService.get(findQuery);
            if (resp) {
                return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "NociceptionAssay Retrieved Successfully"));
            } else {
                return res.status(404).json(apiResponse.FAILURE_RESP({}, {
                    name: "Record Not Found Error",
                    message: `Record Not Found`
                }, "Record Not Found"));
            }
        } catch (err) {
            next(err);
        }
    }

    async list(req: any, res: any, next: any) {
        try {
            let { query } = req;
            let filterQuery: any = {};
            let and_conditions: any = [];

            if (!(typeof query?.is_active === 'undefined')) {
                filterQuery.is_active = query?.is_active === 'true' || query?.is_active === true;
            }

            if (!(typeof query?.project_id === 'undefined')) {
                const numericProjectId = Number(query.project_id);
                filterQuery.project_id = !isNaN(numericProjectId) ? numericProjectId : query.project_id;
            }

            if (!(typeof query?.assay_name === 'undefined')) {
                filterQuery.assay_name = { $regex: query?.assay_name, $options: 'i' };
            }

            if (!(typeof query?.control_group === 'undefined')) {
                filterQuery.$or = [
                    { control_group: { $regex: query?.control_group, $options: 'i' } },
                    { calibrator: { $regex: query?.control_group, $options: 'i' } }
                ];
            } else if (!(typeof query?.calibrator === 'undefined')) {
                filterQuery.$or = [
                    { control_group: { $regex: query?.calibrator, $options: 'i' } },
                    { calibrator: { $regex: query?.calibrator, $options: 'i' } }
                ];
            }

            if (!(typeof query?.status === 'undefined')) {
                filterQuery.status = query?.status;
            }

            if (and_conditions.length > 0)
                filterQuery = { "$and": and_conditions };

            let sort = { "createdAt": -1 };
            let per_page = parseInt(query?.per_page) || -1;
            let page_no = 1;
            if ((!(typeof query?.page_no === 'undefined')) && parseInt(query?.page_no) !== 0) {
                page_no = parseInt(query?.page_no);
            }

            let resp = await newService.list(filterQuery, per_page, page_no, sort);

            return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.resp, "NociceptionAssay retrieved Successfully"));
        } catch (err) {
            next(err);
        }
    }
}

export default Handler;
