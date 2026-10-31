import mongoose from 'mongoose';
import { NociceptionAssay } from '../models/nociception_assay';
import { Project } from '../models/project';

const buildNociceptionAssayAggregationPipeline = (
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
                assay_name: '$assay_name',
                category: '$category',
                calculation_method: '$calculation_method',
                calibrator: '$calibrator',
                samples: '$samples',
                markers: '$markers',
                results: '$results',
                graphs: '$graphs',
                images: '$images',
                meta: '$meta',
                message: '$message',
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

const CreateNociceptionAssay = async (data: any) => {
    return await NociceptionAssay.create(data);
};

const UpdateNociceptionAssay = async (query: any, data: any) => {
    return await NociceptionAssay.findOneAndUpdate(query, data, { new: true });
};

const DeleteNociceptionAssay = async (query: any) => {
    return await NociceptionAssay.deleteOne(query);
};

const GetNociceptionAssay = async (query: any) => {
    const data = await NociceptionAssay.aggregate(
        buildNociceptionAssayAggregationPipeline(query, { createdAt: -1 }, 0, 1)
    ).exec();
    return data && data.length > 0 ? data[0] : null;
};

const ListNociceptionAssay = async (query: any, per_page: number, page_no: number, sort: any) => {
    const normalizedQuery = { ...query };
    if (normalizedQuery.id !== undefined && !isNaN(Number(normalizedQuery.id))) {
        normalizedQuery.id = Number(normalizedQuery.id);
    }
    if (normalizedQuery.project_id !== undefined && !isNaN(Number(normalizedQuery.project_id))) {
        normalizedQuery.project_id = Number(normalizedQuery.project_id);
    }

    const total_record = await NociceptionAssay.countDocuments(normalizedQuery);

    if (per_page === -1) {
        const resp = await NociceptionAssay.aggregate(
            buildNociceptionAssayAggregationPipeline(query, sort)
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

    const resp = await NociceptionAssay.aggregate(
        buildNociceptionAssayAggregationPipeline(query, sort, skip_record, per_page)
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

const GetPaginationForNociceptionAssay = async (query: any, per_page: number, page_no: number) => {
    const total_record = await NociceptionAssay.countDocuments(query);

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

const GetCountForNociceptionAssay = async (query: any) => {
    return await NociceptionAssay.countDocuments(query);
};

const UpsertNociceptionAssay = async (query: any, data: any) => {
    const existing = await NociceptionAssay.findOne(query);
    if (!existing && (data.id == null || data.id === undefined)) {
        const latestDocument: any = await NociceptionAssay.findOne({}, {}, { sort: { id: -1 } });
        data.id = latestDocument ? latestDocument.id + 1 : 1;
    }
    return await NociceptionAssay.findOneAndUpdate(query, { $set: data }, { upsert: true, new: true });
};

export {
    buildNociceptionAssayAggregationPipeline,
    CreateNociceptionAssay,
    UpdateNociceptionAssay,
    DeleteNociceptionAssay,
    GetNociceptionAssay,
    ListNociceptionAssay,
    UpsertNociceptionAssay,
    GetPaginationForNociceptionAssay,
    GetCountForNociceptionAssay,
};
export default {
    buildNociceptionAssayAggregationPipeline,
    CreateNociceptionAssay,
    UpdateNociceptionAssay,
    DeleteNociceptionAssay,
    GetNociceptionAssay,
    ListNociceptionAssay,
    UpsertNociceptionAssay,
    GetPaginationForNociceptionAssay,
    GetCountForNociceptionAssay,
};
