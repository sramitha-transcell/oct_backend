import { NociceptionAssay } from '@oct-backend/shared-utils';
import {
    createDocument,
    updateDocument,
    deleteDocument,
    GetNociceptionAssay,
    ListNociceptionAssay,
    upsertDocument  
} from '@oct-backend/shared-utils';

class NociceptionAssayService {
    async create(data: any) {
        try {
            return await createDocument(NociceptionAssay, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async upsert(query: any, data: any) {
        try {
            return await upsertDocument(NociceptionAssay, query, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async update(query: any, data: any) {
        try {
            return await updateDocument(NociceptionAssay, query, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async delete(query: any) {
        try {
            return await deleteDocument(NociceptionAssay, query);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async get(query: any) {
        try {
            return await GetNociceptionAssay(query);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async list(query: any, per_page: any, page_no: any, sort: any) {
        try {
            // let pagination = await getPagination(NociceptionAssay, query, per_page, page_no);
            // let projection: any = "-__v -_id";
            // let resp = await listDocuments(NociceptionAssay, query, per_page, page_no, sort, projection);
            // return { resp, pagination };

            return await ListNociceptionAssay(query, per_page, page_no, sort);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
}

export default NociceptionAssayService;
