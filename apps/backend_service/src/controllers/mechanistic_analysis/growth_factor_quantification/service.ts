import {
    GrowthFactorQuantification,
    createDocument,
    updateDocument,
    deleteDocument,
    upsertDocument,
    ListGrowthFactorQuantification,
    GetGrowthFactorQuantification
} from '@oct-backend/shared-utils';

class GrowthFactorQuantificationService {
    async create(data: any) {
        try {
            return await createDocument(GrowthFactorQuantification, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async upsert(query: any, data: any) {
        try {
            return await upsertDocument(GrowthFactorQuantification, query, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async update(query: any, data: any) {
        try {
            return await updateDocument(GrowthFactorQuantification, query, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async delete(query: any) {
        try {
            return await deleteDocument(GrowthFactorQuantification, query);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async get(query: any) {
        try {
            return await GetGrowthFactorQuantification(query);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async list(query: any, per_page: any, page_no: any, sort: any) {
        try {
            return await ListGrowthFactorQuantification(query, per_page, page_no, sort);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
}

export default GrowthFactorQuantificationService;
