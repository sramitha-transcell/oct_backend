import mongoose from 'mongoose';
import { GrowthFactorQuantification } from '../models/growth_factor_quantification';
import { Project } from '../models/project';

const buildGrowthFactorAggregationPipeline = (
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
                message: '$message',
                success: '$success',
                number_of_image_pairs: '$number_of_image_pairs',
                no_of_layers: '$no_of_layers',
                lane_order: '$lane_order',
                image_results: '$image_results',
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

const CreateGrowthFactorQuantification = async (data: any) => {
    return await GrowthFactorQuantification.create(data);
};

const UpdateGrowthFactorQuantification = async (query: any, data: any) => {
    return await GrowthFactorQuantification.findOneAndUpdate(query, data, { new: true });
};

const DeleteGrowthFactorQuantification = async (query: any) => {
    return await GrowthFactorQuantification.deleteOne(query);
};

const GetGrowthFactorQuantification = async (query: any) => {
    const data = await GrowthFactorQuantification.aggregate(
        buildGrowthFactorAggregationPipeline(query, { createdAt: -1 }, 0, 1)
    ).exec();
    return data && data.length > 0 ? data[0] : null;
};

const ListGrowthFactorQuantification = async (query: any, per_page: number, page_no: number, sort: any) => {
    const normalizedQuery = { ...query };
    if (normalizedQuery.id !== undefined && !isNaN(Number(normalizedQuery.id))) {
        normalizedQuery.id = Number(normalizedQuery.id);
    }
    if (normalizedQuery.project_id !== undefined && !isNaN(Number(normalizedQuery.project_id))) {
        normalizedQuery.project_id = Number(normalizedQuery.project_id);
    }

    const total_record = await GrowthFactorQuantification.countDocuments(normalizedQuery);

    if (per_page === -1) {
        const resp = await GrowthFactorQuantification.aggregate(
            buildGrowthFactorAggregationPipeline(query, sort)
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

    const resp = await GrowthFactorQuantification.aggregate(
        buildGrowthFactorAggregationPipeline(query, sort, skip_record, per_page)
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

const GetPaginationForGrowthFactorQuantification = async (query: any, per_page: number, page_no: number) => {
    const total_record = await GrowthFactorQuantification.countDocuments(query);

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

const GetCountForGrowthFactorQuantification = async (query: any) => {
    return await GrowthFactorQuantification.countDocuments(query);
};

const UpsertGrowthFactorQuantification = async (query: any, data: any) => {
    return await GrowthFactorQuantification.findOneAndUpdate(query, data, { upsert: true, new: true });
};

export {
    buildGrowthFactorAggregationPipeline,
    CreateGrowthFactorQuantification,
    UpdateGrowthFactorQuantification,
    DeleteGrowthFactorQuantification,
    GetGrowthFactorQuantification,
    ListGrowthFactorQuantification,
    UpsertGrowthFactorQuantification,
    GetPaginationForGrowthFactorQuantification,
    GetCountForGrowthFactorQuantification,
};
