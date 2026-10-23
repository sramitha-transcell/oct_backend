import { Payout } from '../models/payout';
// import { ScellcareLead } from '../models/scellcare_lead';
// import { Pregen } from '../models/pregen';
// import { User } from '../models/user';
// import { SalesExecutive } from '../models/sales_executive';
import mongoose from "mongoose";

async function findPayoutsWithLeadData(filterQuery: any, sort: any) {
    const pipeline: mongoose.PipelineStage[] = [
        { $match: filterQuery },
        { $sort: sort || { createdAt: -1 } },
        // Lookup ScellcareLead by created_by_id
        {
            $lookup: {
                from: "scellcare_leads",
                localField: "created_by_id",
                foreignField: "id",
                as: "scellcare_lead"
            }
        },
        { $unwind: { path: "$scellcare_lead", preserveNullAndEmptyArrays: true } },
        // Lookup Pregen
        {
            $lookup: {
                from: "pregens",
                localField: "created_by_id",
                foreignField: "id",
                as: "pregen"
            }
        },
        { $unwind: { path: "$pregen", preserveNullAndEmptyArrays: true } },
        // Lookup User
        {
            $lookup: {
                from: "users",
                localField: "created_by_id",
                foreignField: "id",
                as: "user"
            }
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        // Lookup SalesExecutive using scellcare_lead.assigned_sales_executive
        {
            $lookup: {
                from: "salesexecutives",
                let: { seId: "$scellcare_lead.assigned_sales_executive" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$id", "$$seId"] } } },
                    { $project: { _id: 0, id: 1, full_name: 1, primary_phone: 1, email_address: 1 } }
                ],
                as: "sales_executive"
            }
        },
        { $unwind: { path: "$sales_executive", preserveNullAndEmptyArrays: true } },
        // Project useful fields and attach lead/client info
        {
            $project: {
                _id: 0,
                id: 1,
                amount: 1,
                created_by_id: 1,
                category: 1,
                payment_status: 1,
                createdAt: 1,
                // scellcare lead fields
                scellcare_lead: {
                    id: "$scellcare_lead.id",
                    client_unique_id: "$scellcare_lead.client_unique_id",
                    mother_name: "$scellcare_lead.mother_name",
                    mobile_number: "$scellcare_lead.mobile_number",
                    email: "$scellcare_lead.email",
                    payment_package: "$scellcare_lead.payment_package",
                    package_amount: "$scellcare_lead.package_amount",
                    package_amount_requested: "$scellcare_lead.package_amount_requested",
                    final_payment_amount: "$scellcare_lead.final_payment_amount",
                    payment_type: "$scellcare_lead.payment_type",
                    payment_status: "$scellcare_lead.payment_status",
                    remaining_amount: "$scellcare_lead.remaining_amount",
                    assigned_sales_executive: "$scellcare_lead.assigned_sales_executive"
                },
                // pregen & user fallbacks
                pregen: { id: "$pregen.id", client_unique_id: "$pregen.client_unique_id", first_name: "$pregen.first_name", last_name: "$pregen.last_name" },
                user: { id: "$user.id", first_name: "$user.first_name", last_name: "$user.last_name" },
                sales_executive: { id: "$sales_executive.id", full_name: "$sales_executive.full_name", primary_phone: "$sales_executive.primary_phone", email_address: "$sales_executive.email_address" }
            }
        }
    ];

    // Run aggregation on Payout collection
    const results = await Payout.aggregate(pipeline).allowDiskUse(true).exec();
    return results;
}

export { findPayoutsWithLeadData };

