import {
    InducedInflammation,
    createDocument,
    updateDocument,
    deleteDocument,
    upsertDocument,
    ListInducedInflammation,
    GetInducedInflammation
} from '@oct-backend/shared-utils';

class InducedInflammationService {
    async create(data: any) {
        try {
            return await createDocument(InducedInflammation, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async upsert(query: any, data: any) {
        try {
            return await upsertDocument(InducedInflammation, query, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async update(query: any, data: any) {
        try {
            return await updateDocument(InducedInflammation, query, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async delete(query: any) {
        try {
            return await deleteDocument(InducedInflammation, query);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async get(query: any) {
        try {
            return await GetInducedInflammation(query);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async list(query: any, per_page: any, page_no: any, sort: any) {
        try {
            return await ListInducedInflammation(query, per_page, page_no, sort);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
}

export default InducedInflammationService;

