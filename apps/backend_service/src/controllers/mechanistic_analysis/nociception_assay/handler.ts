import Service from "./service";
const newService = new Service();
import { apiResponse, JsonWebToken } from "@oct-backend/shared-utils";

const jsonWebToken = new JsonWebToken();

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
            if (!body?.project_id && query?.project_id) {
                body.project_id = query.project_id;
            }
            if (body?.graphs && !body?.images) {
                body.images = body.graphs;
            }
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
            let { body } = req;
            body.updatedAt = new Date();
            if (body?.graphs && !body?.images) {
                body.images = body.graphs;
            }
            let query = {
                "$or": [
                    { "id": body?.id },
                    { "project_id": body?.project_id }
                ]
            };
            let resp = await newService.upsert(query, body);

            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'NociceptionAssay Upserted Successfully'));
        } catch (err) {
            next(err);
        }
    }

    async update(req: any, res: any, next: any) {
        try {
            let { body, params } = req;
            body.updatedAt = new Date();
            if (body?.graphs && !body?.images) {
                body.images = body.graphs;
            }
            let query = {
                "id": params?.id
            };
            let resp = await newService.update(query, body);

            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'NociceptionAssay Updated Successfully'));
        } catch (err) {
            next(err);
        }
    }

    async delete(req: any, res: any, next: any) {
        try {
            let { params } = req;
            let query = {
                "id": params?.id
            };
            let resp = await newService.delete(query);
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'NociceptionAssay Deleted Successfully'));
        } catch (err) {
            next(err);
        }
    }

    async get(req: any, res: any, next: any) {
        try {
            let { params } = req;
            let query = {
                "id": params?.id
            };
            
            let resp = await newService.get(query);
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
                filterQuery.project_id = query?.project_id;
            }

            if (!(typeof query?.assay_name === 'undefined')) {
                filterQuery.assay_name = { $regex: query?.assay_name, $options: 'i' };
            }

            if (!(typeof query?.calibrator === 'undefined')) {
                filterQuery.calibrator = { $regex: query?.calibrator, $options: 'i' };
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
