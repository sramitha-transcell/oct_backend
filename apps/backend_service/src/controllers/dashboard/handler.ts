import Service from "./service";
const newService = new Service();
import { apiResponse } from "@oct-backend/shared-utils";

class Handler {

    async getDashboard(req: any, res: any, next: any) {
        try {
            const { query } = req;
            const data = await newService.getDashboard(query);
            return res.status(200).json(apiResponse.SUCCESS_RESP(data, "Dashboard statistics retrieved successfully"));
        } catch (err) {
            next(err);
        }
    }
}

export default Handler;

