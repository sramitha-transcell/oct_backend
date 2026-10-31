import mongoose from 'mongoose';
import { AdventitiousAgents } from '../models/adventitious_agents';
import { Project } from '../models/project';

const buildAdventitiousAgentsAggregationPipeline = (
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
                calculation_method: '$calculation_method',
                sample_details: '$sample_details',
                assay_configuration: '$assay_configuration',
                samples: '$samples',
                results: '$results',
                summary: '$summary',
                graphs: '$graphs',
                meta: '$meta',
                message: '$message',
                success: '$success',
                status: '$status',
                is_active: '$is_active',
                created_by_id: '$created_by_id',
                updated_by_id: '$updated_by_id',
                createdAt: '$createdAt',
                updatedAt: '$updatedAt',
                project: {
                    $cond: {
                        if: { $ifNull: ['$project_details', false] },
                        then: {
                            id: '$project_details.id',
                            project_name: '$project_details.project_name',
                            project_unique_id: '$project_details.project_unique_id',
                            experimental_model: '$project_details.experimental_model',
                            test_drug: '$project_details.test_drug',
                            reference_drug: '$project_details.reference_drug',
                            status: '$project_details.status',
                            is_active: '$project_details.is_active',
                        },
                        else: null,
                    },
                },
            },
        },
    ];

    if (sort && Object.keys(sort).length) {
        pipeline.push({ $sort: sort });
    }

    if (typeof skip === 'number') {
        pipeline.push({ $skip: skip });
    }

    if (typeof limit === 'number') {
        pipeline.push({ $limit: limit });
    }

    return pipeline;
};

const CreateAdventitiousAgents = async (data: any) => {
    return await AdventitiousAgents.create(data);
};

const UpdateAdventitiousAgents = async (query: any, data: any) => {
    return await AdventitiousAgents.findOneAndUpdate(query, data, { new: true });
};

const DeleteAdventitiousAgents = async (query: any) => {
    return await AdventitiousAgents.deleteOne(query);
};

const GetAdventitiousAgents = async (query: any) => {
    const data = await AdventitiousAgents.aggregate(
        buildAdventitiousAgentsAggregationPipeline(query, { createdAt: -1 }, 0, 1)
    ).exec();
    return data && data.length > 0 ? data[0] : null;
};

const ListAdventitiousAgents = async (query: any, per_page: number, page_no: number, sort: any) => {
    const normalizedQuery = { ...query };
    if (normalizedQuery.id !== undefined && !isNaN(Number(normalizedQuery.id))) {
        normalizedQuery.id = Number(normalizedQuery.id);
    }
    if (normalizedQuery.project_id !== undefined && !isNaN(Number(normalizedQuery.project_id))) {
        normalizedQuery.project_id = Number(normalizedQuery.project_id);
    }

    const total_record = await AdventitiousAgents.countDocuments(normalizedQuery);

    if (per_page === -1) {
        const resp = await AdventitiousAgents.aggregate(
            buildAdventitiousAgentsAggregationPipeline(query, sort)
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

    const resp = await AdventitiousAgents.aggregate(
        buildAdventitiousAgentsAggregationPipeline(query, sort, skip_record, per_page)
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

const GetPaginationForAdventitiousAgents = async (query: any, per_page: number, page_no: number) => {
    const total_record = await AdventitiousAgents.countDocuments(query);

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

const GetCountForAdventitiousAgents = async (query: any) => {
    return await AdventitiousAgents.countDocuments(query);
};

const UpsertAdventitiousAgents = async (query: any, data: any) => {
    return await AdventitiousAgents.findOneAndUpdate(query, data, { upsert: true, new: true });
};

export {
    buildAdventitiousAgentsAggregationPipeline,
    CreateAdventitiousAgents,
    UpdateAdventitiousAgents,
    DeleteAdventitiousAgents,
    GetAdventitiousAgents,
    ListAdventitiousAgents,
    UpsertAdventitiousAgents,
    GetPaginationForAdventitiousAgents,
    GetCountForAdventitiousAgents,
};

