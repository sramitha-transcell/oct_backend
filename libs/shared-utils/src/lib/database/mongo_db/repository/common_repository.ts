import type { Model } from 'mongoose';

type AnyObject = Record<string, any>;

export const createDocument = async (model: Model<any>, data: AnyObject) => {
    return await model.create(data);
};

export const updateDocument = async (model: Model<any>, query: AnyObject, data: AnyObject) => {
    return await model.findOneAndUpdate(query, { $set: data }, { new: true });
};

export const deleteDocument = async (model: Model<any>, query: AnyObject): Promise<any> => {
    return await model.deleteOne(query);
};

export const getOne = async (model: Model<any>, query: AnyObject, projection?: AnyObject) => {
    return await model.findOne(query).select(projection || {}).lean();
};

export const listDocuments = async (
    model: Model<any>,
    query: AnyObject,
    perPage: number,
    pageNo: number,
    sort: AnyObject,
    projection?: AnyObject
) => {
    if (perPage === -1) {
        return await model
            .find(query)
            .select(projection || {})
            .sort(sort)
            .lean();
    }
    return await model
        .find(query)
        .select(projection || {})
        .sort(sort)
        .skip((pageNo - 1) * perPage)
        .limit(perPage)
        .lean();
};

export const getPagination = async (
    model: Model<any>,
    query: AnyObject,
    perPage: number,
    pageNo: number
) => {
    if (perPage === -1) {
        const totalRecord = await model.countDocuments(query);
        return {
            per_page: perPage,
            page_no: pageNo,
            total_rows: totalRecord,
            total_pages: 1
        };
    }
    const totalRecord = await model.countDocuments(query);
    const totalPages = Math.ceil(totalRecord / perPage);
    return {
        per_page: perPage,
        page_no: pageNo,
        total_rows: totalRecord,
        total_pages: totalPages
    };
};

export const getCount = async (model: Model<any>, query: AnyObject) => {
    return await model.countDocuments(query);
};

export const upsertDocument = async (model: Model<any>, query: AnyObject, data: AnyObject) => {
    return await model.findOneAndUpdate(query, { $set: data }, { upsert: true, new: true });
};

export const updateMany = async (model: Model<any>, query: AnyObject, data: AnyObject) => {
    return await model.updateMany(query, { $set: data });
};


