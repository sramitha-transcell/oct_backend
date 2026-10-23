import mongoose from 'mongoose';
import { Role } from '../models/role';
import { RolePermission } from '../models/role_assign_module';
import { User } from '../models/user';

const buildAggregationPipeline = (
    query: any,
    sort: any,
    skip?: number,
    limit?: number
) => {
    console.log("Building aggregation pipeline with:", { query, sort, skip, limit });
    const rolePermissionCollection = RolePermission.collection.collectionName;
    const userCollection = User.collection.collectionName;

    const pipeline: mongoose.PipelineStage[] = [
        { $match: query },
        {
            $lookup: {
                from: rolePermissionCollection,
                localField: 'id',
                foreignField: 'role_id',
                as: 'role_assign_module',
            },
        },
        {
            $lookup: {
                from: userCollection,
                let: { roleId: '$id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$$roleId', '$role.id'] },
                        },
                    },
                    { $count: 'count' },
                ],
                as: 'user_count_array',
            },
        },
        {
            $project: {
                _id: 0,
                id: '$id',
                name: '$name',
                code: '$code',
                description: '$description',
                is_active: '$is_active',
                created_by_id: '$created_by_id',
                updated_by_id: '$updated_by_id',
                createdAt: '$createdAt',
                updatedAt: '$updatedAt',
                role_assign_module: {
                    $map: {
                        input: '$role_assign_module',
                        as: 'module',
                        in: {
                            _id: '$$module._id',
                            module_id: '$$module.module_id',
                            module_name: '$$module.module_name',
                            role_name: '$$module.role_name',
                            role_id: '$$module.role_id',
                            is_view: '$$module.is_view',
                            is_edit: '$$module.is_edit',
                            is_delete: '$$module.is_delete',
                        },
                    },
                },
                user_count: {
                    $ifNull: [{ $arrayElemAt: ['$user_count_array.count', 0] }, 0],
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

const CreateRole = async (data: any) => {
    return await Role.create(data);
};

const UpdateRole = async (query: any, data: any) => {
    return await Role.findOneAndUpdate(query, data);
};

const DeleteRole = async (query: any) => {
    return await Role.deleteOne(query);
};

const GetRole = async (query: any) => {
    return await Role.findOne(query).lean();
};

const ListRole = async (query: any, per_page: number, page_no: number, sort: any) => {
    console.log("ListRole - Query:", query, per_page, page_no, sort);
    const total_record = await Role.countDocuments(query);

    if (per_page === -1) {
        const data = await Role.aggregate(
            buildAggregationPipeline(query, sort)
        ).exec();

        const pagination = {
            per_page: total_record,
            page_no: 1,
            total_rows: total_record,
            total_pages: 1,
        };

        return { data, pagination };
    }

    const skip_record = (page_no - 1) * per_page;

    const data = await Role.aggregate(
        buildAggregationPipeline(query, sort, skip_record, per_page)
    ).exec();

    const total_pages = Math.ceil(total_record / per_page);

    const pagination = {
        per_page,
        page_no,
        total_rows: total_record,
        total_pages,
    };


    // console.log("Pagination:", pagination);
    // console.log(" repo Data:", data);
    return { data, pagination };
};

const GetPaginationForRole = async (query: any, per_page: number, page_no: number) => {
    const total_record = await Role.countDocuments(query);

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

const GetCountForRole = async (query: any) => {
    return await Role.countDocuments(query);
};

const UpsertRole = async (query: any, data: any) => {
    return await Role.findOneAndUpdate(query, data, { upsert: true });
};

export {
    CreateRole,
    UpdateRole,
    DeleteRole,
    GetRole,
    ListRole,
    UpsertRole,
    GetPaginationForRole,
    GetCountForRole,
};