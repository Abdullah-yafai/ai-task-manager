import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../../../../../Backend/src/utils/ApiError.js";
import { ApiResponse } from "../../../../../Backend/src/utils/ApiResponse.js";


const Generatetokens = async (UserID) => {
    try {
        const user = await User.findById(UserID);
        const accessToken = user.generateAccessToken();

        await user.save({ validateBeforeSave: false })

        return { accessToken }
    } catch (error) {
        throw new ApiError(500, "token Not generated")
    }
}

const Register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new ApiError(409, 'Email Already exist')
console.log(password,'checkPassword register')
    const newUser = new User({ name, email, password })
    await newUser.save();

    return res.status(200).json(new ApiResponse('', 200, `${name} Register Successfully`))

})

const Login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(404, 'Email is required')
    }
    const findUser = await User.findOne({ email })
    if (!findUser) {
        throw new ApiError(404, 'Invalid Email')
    }

    console.log(password,'checkPassword')
    const checkPassword = await findUser.isPasswordCorrect(password);
    if (!checkPassword) {
        throw new ApiError(404, 'Invalid Password')
    }


    const { accessToken } = await Generatetokens(findUser._id)

    const loginUser = await User.findById(findUser._id).select('-password')

    return res.status(200).json(new ApiResponse({ user: loginUser, accessToken }, 200, 'LoggIn SuccessFully'))





})

export { Register, Login }