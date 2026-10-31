import Service from "./service";
const newService = new Service();
import { apiResponse, JsonWebToken } from "@oct-backend/shared-utils";

const jsonWebToken = new JsonWebToken();

class Handler {

    async create(req: any, res: any, next: any) {
        try {
            let { body, headers, query } = req;
            if (headers?.authorization) {
                let token = headers.authorization.split(" ")[1];
                if (token) {
                    try {
                        let decoded = await jsonWebToken.verify(token);
                        body.created_by_id = decoded?.ID;
                    } catch {
                        // Ignore auth verify errors in test environments
                    }
                }
            }
            if (!body?.project_id && query?.project_id) {
                body.project_id = query.project_id;
            }
            if (!body?.category) {
                body.category = "safety_assessment";
            }
            body.is_active = true;
            body.createdAt = new Date();
            let resp = await newService.create(body);

            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'InducedInflammation Created Successfully'));
        } catch (err) {
            next(err);
        }
    }

    async upsert(req: any, res: any, next: any) {
        try {
            let { body } = req;
            body.updatedAt = new Date();
            let query: any = {};
            if (body?.id) {
                query.id = body.id;
            } else if (body?.category && body?.project_id) {
                query = {
                    "$and": [
                        { "category": body?.category },
                        { "project_id": body?.project_id }
                    ]
                };
            } else if (body?.project_id) {
                query = {
                    "$and": [
                        { "category": body?.category || "safety_assessment" },
                        { "project_id": body?.project_id }
                    ]
                };
            } else {
                query = { "category": body?.category || "safety_assessment" };
            }
            let resp = await newService.upsert(query, body);

            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'InducedInflammation Upserted Successfully'));
        } catch (err) {
            next(err);
        }
    }

    async update(req: any, res: any, next: any) {
        try {
            let { body, params } = req;
            body.updatedAt = new Date();
            let query = {
                "id": params?.id
            };
            let resp = await newService.update(query, body);

            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'InducedInflammation Updated Successfully'));
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
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'InducedInflammation Deleted Successfully'));
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
                return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "InducedInflammation Retrieved Successfully"));
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

            if (!(typeof query?.category === 'undefined')) {
                filterQuery.category = query?.category;
            }

            if (!(typeof query?.project_id === 'undefined')) {
                filterQuery.project_id = isNaN(Number(query?.project_id)) ? query?.project_id : Number(query?.project_id);
            }

            if (!(typeof query?.status === 'undefined')) {
                filterQuery.status = query?.status;
            }

            if (!(typeof query?.drug_name === 'undefined')) {
                filterQuery.drug_name = { $regex: query?.drug_name, $options: 'i' };
            }

            if (!(typeof query?.batch_no === 'undefined')) {
                filterQuery.batch_no = query?.batch_no;
            }

            if (!(typeof query?.marker === 'undefined')) {
                filterQuery.marker = query?.marker;
            }

            let sort = { "createdAt": -1 };
            let per_page = parseInt(query?.per_page) || -1;
            let page_no = 1;
            if ((!(typeof query?.page_no === 'undefined')) && parseInt(query?.page_no) !== 0) {
                page_no = parseInt(query?.page_no);
            }

            if (and_conditions.length > 0)
                filterQuery = { "$and": and_conditions };

            let resp = await newService.list(filterQuery, per_page, page_no, sort);

            return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.resp, "InducedInflammation retrieved Successfully"));
        } catch (err) {
            next(err);
        }
    }
}

export default Handler;

