import {
    MycoplasmaTesting,
    createDocument,
    updateDocument,
    deleteDocument,
    upsertDocument,
    ListMycoplasmaTesting,
    GetMycoplasmaTesting
} from '@oct-backend/shared-utils';

class MycoplasmaTestingService {
    async create(data: any) {
        try {
            return await createDocument(MycoplasmaTesting, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async upsert(query: any, data: any) {
        try {
            return await upsertDocument(MycoplasmaTesting, query, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async update(query: any, data: any) {
        try {
            return await updateDocument(MycoplasmaTesting, query, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async delete(query: any) {
        try {
            return await deleteDocument(MycoplasmaTesting, query);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async get(query: any) {
        try {
            return await GetMycoplasmaTesting(query);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async list(query: any, per_page: any, page_no: any, sort: any) {
        try {
            return await ListMycoplasmaTesting(query, per_page, page_no, sort);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
}

export default MycoplasmaTestingService;

