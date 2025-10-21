import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/User.model.js"
import { ApiError } from "../utils/ApiError.js"
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized")
        }

        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodeToken._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid User")
        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid Request")
    }


})
