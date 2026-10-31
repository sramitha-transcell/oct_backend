import {
    AdventitiousAgents,
    createDocument,
    updateDocument,
    deleteDocument,
    upsertDocument,
    ListAdventitiousAgents,
    GetAdventitiousAgents
} from '@oct-backend/shared-utils';

class AdventitiousAgentsService {
    async create(data: any) {
        try {
            return await createDocument(AdventitiousAgents, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async upsert(query: any, data: any) {
        try {
            return await upsertDocument(AdventitiousAgents, query, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async update(query: any, data: any) {
        try {
            return await updateDocument(AdventitiousAgents, query, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async delete(query: any) {
        try {
            return await deleteDocument(AdventitiousAgents, query);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async get(query: any) {
        try {
            return await GetAdventitiousAgents(query);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async list(query: any, per_page: any, page_no: any, sort: any) {
        try {
            return await ListAdventitiousAgents(query, per_page, page_no, sort);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
}

export default AdventitiousAgentsService;

