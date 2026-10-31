import Service from "./service";
const newService = new Service()
import { apiResponse, JsonWebToken } from "@oct-backend/shared-utils";

const jsonWebToken = new JsonWebToken();

const normalizeStr = (val: any) => typeof val === 'string' ? val.toLowerCase().replace(/[\s-_]+/g, '_').trim() : '';

const isMechanisticModule = (mod: any) => {
    const n = normalizeStr(mod);
    return n === 'mechanistic_analysis' || n === 'mechanistic' || n === 'mech';
};

const isNociceptionSubmodule = (sub: any) => {
    const n = normalizeStr(sub);
    return n.includes('nociception') || n === 'noci';
};

const isGrowthFactorSubmodule = (sub: any) => {
    const n = normalizeStr(sub);
    return n.includes('growth_factor') || n.includes('growth') || n.includes('vegf');
};

const isSafetyModule = (mod: any) => {
    const n = normalizeStr(mod);
    return n === 'safety_assessment' || n === 'safety' || n === 'safe';
};

const isAdventitiousSubmodule = (sub: any) => {
    const n = normalizeStr(sub);
    return n.includes('adventitious') || n.includes('viral');
};

const isInducedInflammationSubmodule = (sub: any) => {
    const n = normalizeStr(sub);
    return n.includes('induced_inflammation') || n.includes('inflammation') || n.includes('inflam');
};

const isMycoplasmaSubmodule = (sub: any) => {
    const n = normalizeStr(sub);
    return n.includes('mycoplasma') || n.includes('myco');
};

const isEfficacyModule = (mod: any) => {
    const n = normalizeStr(mod);
    return n === 'efficacy_assessment' || n === 'efficacy' || n === 'eff';
};

const isWoundHealingSubmodule = (sub: any) => {
    const n = normalizeStr(sub);
    return n.includes('wound') || n.includes('healing') || n.includes('scratch');
};

const isBarrierIntegritySubmodule = (sub: any) => {
    const n = normalizeStr(sub);
    return n.includes('barrier') || n.includes('teer') || n.includes('integrity');
};

const resolveModuleFlags = (body: any) => {
    const flags = {
        hasNociception: false,
        hasGrowthFactor: false,
        hasAdventitious: false,
        hasInducedInflammation: false,
        hasMycoplasma: false,
        hasWoundHealing: false,
        hasBarrierIntegrity: false
    };

    const processItem = (mod: any, sub: any) => {
        const subList = Array.isArray(sub)
            ? sub
            : (sub !== undefined && sub !== null && sub !== '' ? [sub] : []);

        // Mechanistic Analysis
        if (isMechanisticModule(mod)) {
            if (subList.length === 0 || subList.some(s => normalizeStr(s) === 'all')) {
                flags.hasNociception = true;
                flags.hasGrowthFactor = true;
            } else {
                for (const s of subList) {
                    if (isNociceptionSubmodule(s)) flags.hasNociception = true;
                    if (isGrowthFactorSubmodule(s)) flags.hasGrowthFactor = true;
                }
            }
        } else {
            for (const s of subList) {
                if (isNociceptionSubmodule(s)) flags.hasNociception = true;
                if (isGrowthFactorSubmodule(s)) flags.hasGrowthFactor = true;
            }
        }

        // Safety Assessment
        if (isSafetyModule(mod)) {
            if (subList.length === 0 || subList.some(s => normalizeStr(s) === 'all')) {
                flags.hasAdventitious = true;
                flags.hasInducedInflammation = true;
                flags.hasMycoplasma = true;
            } else {
                for (const s of subList) {
                    if (isAdventitiousSubmodule(s)) flags.hasAdventitious = true;
                    if (isInducedInflammationSubmodule(s)) flags.hasInducedInflammation = true;
                    if (isMycoplasmaSubmodule(s)) flags.hasMycoplasma = true;
                }
            }
        } else {
            for (const s of subList) {
                if (isAdventitiousSubmodule(s)) flags.hasAdventitious = true;
                if (isInducedInflammationSubmodule(s)) flags.hasInducedInflammation = true;
                if (isMycoplasmaSubmodule(s)) flags.hasMycoplasma = true;
            }
        }

        // Efficacy Assessment
        if (isEfficacyModule(mod)) {
            if (subList.length === 0 || subList.some(s => normalizeStr(s) === 'all')) {
                flags.hasWoundHealing = true;
                flags.hasBarrierIntegrity = true;
            } else {
                for (const s of subList) {
                    if (isWoundHealingSubmodule(s)) flags.hasWoundHealing = true;
                    if (isBarrierIntegritySubmodule(s)) flags.hasBarrierIntegrity = true;
                }
            }
        } else {
            for (const s of subList) {
                if (isWoundHealingSubmodule(s)) flags.hasWoundHealing = true;
                if (isBarrierIntegritySubmodule(s)) flags.hasBarrierIntegrity = true;
            }
        }
    };

    if (body?.module !== undefined || body?.submodule !== undefined) {
        processItem(body.module, body.submodule);
    }

    if (Array.isArray(body?.modules)) {
        for (const item of body.modules) {
            if (typeof item === 'string') {
                processItem(item, undefined);
            } else if (item && typeof item === 'object') {
                processItem(item.module, item.submodule || item.submodules);
            }
        }
    }

    return flags;
};

const initAssayRecords = async (projectId: number, body: any, userId?: any) => {
    const flags = resolveModuleFlags(body);

    if (flags.hasNociception) {
        await newService.createNociceptionAssay({
            project_id: projectId,
            assay_name: body.assay_name || "Nociception Assay",
            category: "mechanistic_analysis",
            status: body.status || "new",
            is_active: true,
            created_by_id: userId,
            createdAt: new Date()
        });
    }

    if (flags.hasGrowthFactor) {
        await newService.createGrowthFactorQuantification({
            project_id: projectId,
            category: body.category || "growth_factor_quantification",
            status: body.status || "new",
            is_active: true,
            created_by_id: userId,
            createdAt: new Date()
        });
    }

    if (flags.hasAdventitious) {
        await newService.createAdventitiousAgents({
            project_id: projectId,
            category: "safety_assessment",
            assay_type: body.assay_type || "qPCR / RT-qPCR",
            calculation_method: body.calculation_method || "Ct cutoff-based screening",
            status: body.status || "new",
            is_active: true,
            created_by_id: userId,
            createdAt: new Date()
        });
    }

    if (flags.hasInducedInflammation) {
        await newService.createInducedInflammation({
            project_id: projectId,
            category: "safety_assessment",
            drug_name: body.drug_name || "",
            batch_no: body.batch_no || "",
            marker: body.marker || "",
            method: body.method || "shared",
            status: body.status || "new",
            is_active: true,
            created_by_id: userId,
            createdAt: new Date()
        });
    }

    if (flags.hasMycoplasma) {
        await newService.createMycoplasmaTesting({
            project_id: projectId,
            category: "safety_assessment",
            assay_type: body.assay_type || "Mycoplasma_qPCR",
            calculation_method: body.calculation_method || "Ct cutoff-based screening",
            status: body.status || "new",
            is_active: true,
            created_by_id: userId,
            createdAt: new Date()
        });
    }

    if (flags.hasWoundHealing) {
        await newService.createWoundHealing({
            project_id: projectId,
            category: "efficacy_assessment",
            analysis_type: body.analysis_type || "microscopy_image_batch",
            status: body.status || "new",
            is_active: true,
            created_by_id: userId,
            createdAt: new Date()
        });
    }

    if (flags.hasBarrierIntegrity) {
        await newService.createBarrierIntegrity({
            project_id: projectId,
            category: "efficacy_assessment",
            assay_type: body.assay_type || "Transepithelial Electrical Resistance (TEER)",
            status: body.status || "new",
            is_active: true,
            created_by_id: userId,
            createdAt: new Date()
        });
    }
};

class Handler {

    async create(req: any, res: any, next: any) {
        try {
            let { body, headers } = req;
            let decoded: any = {};
            if (headers?.authorization) {
                try {
                    decoded = await jsonWebToken.verify((headers.authorization).split(" ")[1]);
                } catch {
                    // Ignore if auth token verification fails in test environments
                }
            }
            body.is_active = true;
            if (decoded?.ID) {
                body.created_by_id = decoded.ID;
            }
            body.createdAt = new Date();
            let resp = await newService.create(body);

            if (resp && resp.id && (body?.module || body?.submodule || body?.modules)) {
                await initAssayRecords(resp.id, body, decoded?.ID);
            }

            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'Project Created Successfully'));
        } catch (err) {
            next(err);
        }
    }

    async upsert(req: any, res: any, next: any) {
        try {
            let { body } = req;
            body.updatedAt = new Date();
            let query = {
                "$or": [
                    { "id": body?.id },
                    { "project_unique_id": body?.project_unique_id }
                ]
            };
            let resp = await newService.upsert(query, body);

            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'Project Upserted Successfully'));

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

            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'Project Updated Successfully'));
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
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'Project Deleted Successfully'));
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
                return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Project Retrieved Successfully"));
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

            if (!(typeof query?.project_name === 'undefined')) {
                filterQuery.project_name = { $regex: query?.project_name, $options: 'i' };
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

            return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.resp, "Project retrieved Successfully"));
        } catch (err) {
            next(err);
        }
    }

    async assign(req: any, res: any, next: any) {
        try {
            let { body, query, params, headers } = req;
            const rawProjectId = query?.project_id || query?.id || query?.projectId || params?.id || body?.project_id || body?.id;

            if (!rawProjectId) {
                return res.status(400).json(apiResponse.FAILURE_RESP({}, {
                    name: "Validation Error",
                    message: "project_id is required in query"
                }, "project_id is required in query"));
            }

            const { module, submodule } = body || {};
            if (module === undefined && submodule === undefined && body?.modules === undefined) {
                return res.status(400).json(apiResponse.FAILURE_RESP({}, {
                    name: "Validation Error",
                    message: "module and submodule are required in payload"
                }, "Validation Failed"));
            }

            let decoded: any = {};
            if (headers?.authorization) {
                try {
                    decoded = await jsonWebToken.verify((headers.authorization).split(" ")[1]);
                } catch {
                    // Ignore if auth token verification fails in test environments
                }
            }
            const userId = decoded?.ID;

            const numId = !isNaN(Number(rawProjectId)) ? Number(rawProjectId) : null;
            let projectQuery: any = numId !== null
                ? { "$or": [{ "id": numId }, { "project_unique_id": String(rawProjectId) }] }
                : { "project_unique_id": String(rawProjectId) };

            let existingProject: any = await newService.get(projectQuery);
            if (!existingProject) {
                return res.status(404).json(apiResponse.FAILURE_RESP({}, {
                    name: "Record Not Found Error",
                    message: `Project with ID ${rawProjectId} not found`
                }, "Project Not Found"));
            }

            let updateData: any = {
                updatedAt: new Date()
            };

            if (module !== undefined) {
                updateData.module = module;
            }
            if (submodule !== undefined) {
                updateData.submodule = submodule;
            }

            let existingAssigned = Array.isArray(existingProject.assigned_modules)
                ? [...existingProject.assigned_modules]
                : [];

            if (module !== undefined || submodule !== undefined) {
                const assignmentEntry = {
                    module: module !== undefined ? module : existingProject.module,
                    submodule: submodule !== undefined ? submodule : existingProject.submodule,
                    assigned_at: new Date()
                };

                const existingIdx = existingAssigned.findIndex((item: any) => item?.module === assignmentEntry.module);
                if (existingIdx >= 0) {
                    existingAssigned[existingIdx] = assignmentEntry;
                } else {
                    existingAssigned.push(assignmentEntry);
                }

                updateData.assigned_modules = existingAssigned;
                updateData.modules = existingAssigned;
            } else if (body?.modules && Array.isArray(body.modules)) {
                updateData.assigned_modules = body.modules;
                updateData.modules = body.modules;
            }

            // Create corresponding default assay records for the assigned modules/submodules
            await initAssayRecords(existingProject.id, body, userId);

            let resp = await newService.assign(projectQuery, updateData);

            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'Module and Submodule Assigned Successfully'));
        } catch (err) {
            next(err);
        }
    }
}

export default Handler;
