import mongoose from 'mongoose';
import { BarrierIntegrity } from '../models/barrier_integrity';
import { Project } from '../models/project';

const buildBarrierIntegrityAggregationPipeline = (
    query: any,
    sort: any,
    skip?: number,
    limit?: number
) => {
    const projectCollection = Project.collection.collectionName;

    const normalizedQuery = { ...query };
    if (normalizedQuery.id !== undefined && !isNaN(Number(normalizedQuery.id))) {
        normalizedQuery.id = Number(normalizedQuery.id);
    }
    if (normalizedQuery.project_id !== undefined && !isNaN(Number(normalizedQuery.project_id))) {
        normalizedQuery.project_id = Number(normalizedQuery.project_id);
    }

    const pipeline: mongoose.PipelineStage[] = [
        { $match: normalizedQuery },
        {
            $lookup: {
                from: projectCollection,
                localField: 'project_id',
                foreignField: 'id',
                as: 'project_details',
            },
        },
        {
            $unwind: {
                path: '$project_details',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 0,
                id: '$id',
                project_id: '$project_id',
                category: '$category',
                assay_type: '$assay_type',
                formulas: '$formulas',
                healthy_mean_teer: '$healthy_mean_teer',
                disease_mean_teer: '$disease_mean_teer',
                results: '$results',
                warnings: '$warnings',
                graphs: '$graphs',
                data: '$data',
                meta: '$meta',
                message: '$message',
                success: '$success',
                status: '$status',
                is_active: '$is_active',
                created_by_id: '$created_by_id',
                updated_by_id: '$updated_by_id',
                createdAt: '$createdAt',
                updatedAt: '$updatedAt',
                project_details: '$project_details',
            },
        },
    ];

    if (sort && Object.keys(sort).length > 0) {
        pipeline.push({ $sort: sort });
    }

    if (typeof skip === 'number' && skip > 0) {
        pipeline.push({ $skip: skip });
    }

    if (typeof limit === 'number' && limit > 0) {
        pipeline.push({ $limit: limit });
    }

    return pipeline;
};

const CreateBarrierIntegrity = async (data: any) => {
    return await BarrierIntegrity.create(data);
};

const UpdateBarrierIntegrity = async (query: any, data: any) => {
    return await BarrierIntegrity.findOneAndUpdate(query, data, { new: true });
};

const DeleteBarrierIntegrity = async (query: any) => {
    return await BarrierIntegrity.findOneAndDelete(query);
};

const GetBarrierIntegrity = async (query: any) => {
    const pipeline = buildBarrierIntegrityAggregationPipeline(query, { createdAt: -1 }, 0, 1);
    const results = await BarrierIntegrity.aggregate(pipeline).exec();
    return results && results.length > 0 ? results[0] : null;
};

const ListBarrierIntegrity = async (
    query: any,
    per_page: number,
    page_no: number,
    sort: any = { createdAt: -1 }
) => {
    const total_record = await BarrierIntegrity.countDocuments(query);

    if (per_page === -1) {
        const resp = await BarrierIntegrity.aggregate(
            buildBarrierIntegrityAggregationPipeline(query, sort)
        ).exec();

        const pagination = {
            per_page: total_record,
            page_no: 1,
            total_rows: total_record,
            total_pages: 1,
        };

        return { resp, pagination };
    }

    const skip_record = (page_no - 1) * per_page;

    const resp = await BarrierIntegrity.aggregate(
        buildBarrierIntegrityAggregationPipeline(query, sort, skip_record, per_page)
    ).exec();

    const total_pages = Math.ceil(total_record / per_page);

    const pagination = {
        per_page,
        page_no,
        total_rows: total_record,
        total_pages,
    };

    return { resp, pagination };
};

const GetPaginationForBarrierIntegrity = async (query: any, per_page: number, page_no: number) => {
    const total_record = await BarrierIntegrity.countDocuments(query);

    if (per_page === -1) {
        return {
            per_page: total_record,
            page_no: 1,
            total_rows: total_record,
            total_pages: 1,
        };
    }

    const total_pages = Math.ceil(total_record / per_page);

    return {
        per_page,
        page_no,
        total_rows: total_record,
        total_pages,
    };
};

const GetCountForBarrierIntegrity = async (query: any) => {
    return await BarrierIntegrity.countDocuments(query);
};

const UpsertBarrierIntegrity = async (query: any, data: any) => {
    return await BarrierIntegrity.findOneAndUpdate(query, data, { upsert: true, new: true });
};

export {
    buildBarrierIntegrityAggregationPipeline,
    CreateBarrierIntegrity,
    UpdateBarrierIntegrity,
    DeleteBarrierIntegrity,
    GetBarrierIntegrity,
    ListBarrierIntegrity,
    UpsertBarrierIntegrity,
    GetPaginationForBarrierIntegrity,
    GetCountForBarrierIntegrity,
};

