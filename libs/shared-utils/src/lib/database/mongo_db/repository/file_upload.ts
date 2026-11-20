import mongoose from 'mongoose';
import { FileUpload, detectFileType } from '../models/file_upload';
import { Project } from '../models/project';

const buildFileUploadAggregationPipeline = (
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
    if (Array.isArray(normalizedQuery.$or)) {
        normalizedQuery.$or = normalizedQuery.$or.map((condition: any) => {
            const cond = { ...condition };
            if (cond.id !== undefined && !isNaN(Number(cond.id))) cond.id = Number(cond.id);
            if (cond.project_id !== undefined && !isNaN(Number(cond.project_id))) cond.project_id = Number(cond.project_id);
            return cond;
        });
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
                sub_category: '$sub_category',
                filename: '$filename',
                file_type: '$file_type',
                mime_type: '$mime_type',
                object_key: '$object_key',
                file_url: '$file_url',
                expires_in: '$expires_in',
                size: '$size',
                created_at: '$created_at',
                expires_at: '$expires_at',
                status: '$status',
                is_active: '$is_active',
                metadata: '$metadata',
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

const CreateFileUpload = async (data: any) => {
    if (!data.id) {
        const latestDocument: any = await FileUpload.findOne({}, {}, { sort: { id: -1 } });
        data.id = latestDocument && latestDocument.id ? latestDocument.id + 1 : 1;
    }
    if (!data.created_at) {
        data.created_at = new Date();
    } else if (typeof data.created_at === 'string' || typeof data.created_at === 'number') {
        data.created_at = new Date(data.created_at);
    }

    if (!data.file_type) {
        data.file_type = detectFileType(data.filename, data.mime_type);
    }

    const expiresInSeconds = data.expires_in !== undefined && !isNaN(Number(data.expires_in))
        ? Number(data.expires_in)
        : 2592000;
    data.expires_in = expiresInSeconds;

    if (!data.expires_at) {
        data.expires_at = new Date(data.created_at.getTime() + expiresInSeconds * 1000);
    } else if (typeof data.expires_at === 'string' || typeof data.expires_at === 'number') {
        data.expires_at = new Date(data.expires_at);
    }

    if (data.project_id !== undefined && !isNaN(Number(data.project_id))) {
        data.project_id = Number(data.project_id);
    }

    if (!data.category) {
        data.category = 'general';
    }

    return await FileUpload.create(data);
};

const BulkCreateFileUpload = async (dataArray: any[]) => {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        return [];
    }

    const latestDocument: any = await FileUpload.findOne({}, {}, { sort: { id: -1 } });
    let startId = latestDocument && latestDocument.id ? latestDocument.id + 1 : 1;

    const docsToInsert = dataArray.map((item) => {
        const doc = { ...item };
        if (doc.id == null || isNaN(Number(doc.id))) {
            doc.id = startId++;
        }
        if (!doc.created_at) {
            doc.created_at = new Date();
        } else if (typeof doc.created_at === 'string' || typeof doc.created_at === 'number') {
            doc.created_at = new Date(doc.created_at);
        }

        if (!doc.file_type) {
            doc.file_type = detectFileType(doc.filename, doc.mime_type);
        }

        const expiresInSeconds = doc.expires_in !== undefined && !isNaN(Number(doc.expires_in))
            ? Number(doc.expires_in)
            : 2592000;
        doc.expires_in = expiresInSeconds;

        if (!doc.expires_at) {
            doc.expires_at = new Date(doc.created_at.getTime() + expiresInSeconds * 1000);
        } else if (typeof doc.expires_at === 'string' || typeof doc.expires_at === 'number') {
            doc.expires_at = new Date(doc.expires_at);
        }

        if (doc.project_id !== undefined && !isNaN(Number(doc.project_id))) {
            doc.project_id = Number(doc.project_id);
        }

        if (!doc.category) {
            doc.category = 'general';
        }

        doc.is_active = doc.is_active !== undefined ? doc.is_active : true;
        doc.status = doc.status || 'active';

        return doc;
    });

    return await FileUpload.insertMany(docsToInsert);
};

const UpdateFileUpload = async (query: any, data: any) => {
    const updateData = { ...data };
    if (updateData.expires_in !== undefined && updateData.created_at && !updateData.expires_at) {
        const createdAtDate = new Date(updateData.created_at);
        updateData.expires_at = new Date(createdAtDate.getTime() + Number(updateData.expires_in) * 1000);
    }
    return await FileUpload.findOneAndUpdate(query, updateData, { new: true });
};

const DeleteFileUpload = async (query: any) => {
    return await FileUpload.deleteOne(query);
};

const GetFileUpload = async (query: any) => {
    const data = await FileUpload.aggregate(
        buildFileUploadAggregationPipeline(query, { createdAt: -1 }, 0, 1)
    ).exec();
    return data && data.length > 0 ? data[0] : null;
};

const ListFileUpload = async (query: any, per_page: number, page_no: number, sort: any) => {
    const normalizedQuery = { ...query };
    if (normalizedQuery.id !== undefined && !isNaN(Number(normalizedQuery.id))) {
        normalizedQuery.id = Number(normalizedQuery.id);
    }
    if (normalizedQuery.project_id !== undefined && !isNaN(Number(normalizedQuery.project_id))) {
        normalizedQuery.project_id = Number(normalizedQuery.project_id);
    }
    if (Array.isArray(normalizedQuery.$or)) {
        normalizedQuery.$or = normalizedQuery.$or.map((condition: any) => {
            const cond = { ...condition };
            if (cond.id !== undefined && !isNaN(Number(cond.id))) cond.id = Number(cond.id);
            if (cond.project_id !== undefined && !isNaN(Number(cond.project_id))) cond.project_id = Number(cond.project_id);
            return cond;
        });
    }

    const total_record = await FileUpload.countDocuments(normalizedQuery);

    if (per_page === -1) {
        const resp = await FileUpload.aggregate(
            buildFileUploadAggregationPipeline(normalizedQuery, sort)
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

    const resp = await FileUpload.aggregate(
        buildFileUploadAggregationPipeline(normalizedQuery, sort, skip_record, per_page)
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

const GetPaginationForFileUpload = async (query: any, per_page: number, page_no: number) => {
    const total_record = await FileUpload.countDocuments(query);

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

const GetCountForFileUpload = async (query: any) => {
    return await FileUpload.countDocuments(query);
};

const UpsertFileUpload = async (query: any, data: any) => {
    const normalizedQuery = { ...query };
    if (normalizedQuery.id !== undefined && !isNaN(Number(normalizedQuery.id))) {
        normalizedQuery.id = Number(normalizedQuery.id);
    }
    if (normalizedQuery.project_id !== undefined && !isNaN(Number(normalizedQuery.project_id))) {
        normalizedQuery.project_id = Number(normalizedQuery.project_id);
    }

    const existing = await FileUpload.findOne(normalizedQuery);
    if (!existing && (data.id == null || data.id === undefined)) {
        const latestDocument: any = await FileUpload.findOne({}, {}, { sort: { id: -1 } });
        data.id = latestDocument && latestDocument.id ? latestDocument.id + 1 : 1;
    }

    if (!data.created_at) {
        data.created_at = existing?.created_at || new Date();
    }
    if (!data.file_type) {
        data.file_type = detectFileType(data.filename, data.mime_type);
    }
    const expiresInSeconds = data.expires_in !== undefined ? Number(data.expires_in) : (existing?.expires_in || 2592000);
    if (!data.expires_at) {
        data.expires_at = new Date(new Date(data.created_at).getTime() + expiresInSeconds * 1000);
    }

    return await FileUpload.findOneAndUpdate(normalizedQuery, { $set: data }, { upsert: true, new: true });
};

export {
    buildFileUploadAggregationPipeline,
    CreateFileUpload,
    BulkCreateFileUpload,
    UpdateFileUpload,
    DeleteFileUpload,
    GetFileUpload,
    ListFileUpload,
    UpsertFileUpload,
    GetPaginationForFileUpload,
    GetCountForFileUpload,
};

export default {
    buildFileUploadAggregationPipeline,
    CreateFileUpload,
    BulkCreateFileUpload,
    UpdateFileUpload,
    DeleteFileUpload,
    GetFileUpload,
    ListFileUpload,
    UpsertFileUpload,
    GetPaginationForFileUpload,
    GetCountForFileUpload,
};
