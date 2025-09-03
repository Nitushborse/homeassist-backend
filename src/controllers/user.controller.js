import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"

const registerUser = asyncHandler(async (req, res) => {
    // get the user info from body
    // apply the validation check for empty fieds
    // check the user with same user email 
    // sava the user in database
    // give the response to user

    const { name, email, role, password } = req.body

    if (
        [name, email, role, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({email})

    if(existedUser){
        throw new ApiError(409, "user allready exist with same user name")
    }

    const user = await User.create({
        name,
        email,
        role,
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201,createdUser,"user registered successfully")
    )
})

export {
    registerUser,
}