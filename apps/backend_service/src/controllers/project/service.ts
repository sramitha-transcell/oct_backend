import {
    Project,
    NociceptionAssay,
    GrowthFactorQuantification,
    AdventitiousAgents,
    InducedInflammation,
    MycoplasmaTesting,
    WoundHealing,
    BarrierIntegrity,
    createDocument,
    updateDocument,
    deleteDocument,
    getOne,
    listDocuments,
    getPagination,
    upsertDocument  
} from '@oct-backend/shared-utils';

class ProjectService {
    async create(data: any) {
        try {
            return await createDocument(Project, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err
        }
    }
    async upsert(query: any, data: any) {
        try {
            return await upsertDocument(Project, query, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err
        }
    }
    async update(query: any, data: any) {
        try {
            return await updateDocument(Project, query, data);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err
        }
    }
    async delete(query: any) {
        try {
            return await deleteDocument(Project, query);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err
        }
    }
    async get(query: any) {
        try {
            return await getOne(Project, query);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err
        }
    }
    async list(query: any, per_page: any, page_no: any, sort: any) {
        try {
            let pagination = await getPagination(Project, query, per_page, page_no)
            let projection: any = "-__v -_id"
            let resp = await listDocuments(Project, query, per_page, page_no, sort, projection);
            return { resp, pagination }
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async assign(query: any, data: any) {
        try {
            await updateDocument(Project, query, data);
            return await getOne(Project, query);
        } catch (err) {
            console.log("Error ====>>>", err);
            throw err;
        }
    }
    async createNociceptionAssay(data: any) {
        try {
            const existing = await getOne(NociceptionAssay, { project_id: data.project_id });
            if (!existing) {
                return await createDocument(NociceptionAssay, data);
            }
            await updateDocument(NociceptionAssay, { project_id: data.project_id }, { is_active: true, updatedAt: new Date() });
            return existing;
        } catch (err) {
            console.log("Error createNociceptionAssay ====>>>", err);
            throw err;
        }
    }
    async createGrowthFactorQuantification(data: any) {
        try {
            const existing = await getOne(GrowthFactorQuantification, { project_id: data.project_id });
            if (!existing) {
                return await createDocument(GrowthFactorQuantification, data);
            }
            await updateDocument(GrowthFactorQuantification, { project_id: data.project_id }, { is_active: true, updatedAt: new Date() });
            return existing;
        } catch (err) {
            console.log("Error createGrowthFactorQuantification ====>>>", err);
            throw err;
        }
    }
    async createAdventitiousAgents(data: any) {
        try {
            const existing = await getOne(AdventitiousAgents, { project_id: data.project_id });
            if (!existing) {
                return await createDocument(AdventitiousAgents, data);
            }
            await updateDocument(AdventitiousAgents, { project_id: data.project_id }, { is_active: true, updatedAt: new Date() });
            return existing;
        } catch (err) {
            console.log("Error createAdventitiousAgents ====>>>", err);
            throw err;
        }
    }
    async createInducedInflammation(data: any) {
        try {
            const existing = await getOne(InducedInflammation, { project_id: data.project_id });
            if (!existing) {
                return await createDocument(InducedInflammation, data);
            }
            await updateDocument(InducedInflammation, { project_id: data.project_id }, { is_active: true, updatedAt: new Date() });
            return existing;
        } catch (err) {
            console.log("Error createInducedInflammation ====>>>", err);
            throw err;
        }
    }
    async createMycoplasmaTesting(data: any) {
        try {
            const existing = await getOne(MycoplasmaTesting, { project_id: data.project_id });
            if (!existing) {
                return await createDocument(MycoplasmaTesting, data);
            }
            await updateDocument(MycoplasmaTesting, { project_id: data.project_id }, { is_active: true, updatedAt: new Date() });
            return existing;
        } catch (err) {
            console.log("Error createMycoplasmaTesting ====>>>", err);
            throw err;
        }
    }
    async createWoundHealing(data: any) {
        try {
            const existing = await getOne(WoundHealing, { project_id: data.project_id });
            if (!existing) {
                return await createDocument(WoundHealing, data);
            }
            await updateDocument(WoundHealing, { project_id: data.project_id }, { is_active: true, updatedAt: new Date() });
            return existing;
        } catch (err) {
            console.log("Error createWoundHealing ====>>>", err);
            throw err;
        }
    }
    async createBarrierIntegrity(data: any) {
        try {
            const existing = await getOne(BarrierIntegrity, { project_id: data.project_id });
            if (!existing) {
                return await createDocument(BarrierIntegrity, data);
            }
            await updateDocument(BarrierIntegrity, { project_id: data.project_id }, { is_active: true, updatedAt: new Date() });
            return existing;
        } catch (err) {
            console.log("Error createBarrierIntegrity ====>>>", err);
            throw err;
        }
    }
}

export default ProjectService;
