import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "something want wrong while generating access and refresh tokens")
    }
}


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

    const existedUser = await User.findOne({ email })

    if (existedUser) {
        throw new ApiError(409, "user allready exist with same user name")
    }

    const user = await User.create({
        name,
        email,
        role,
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "user registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    // get the data from body
    // validate the user
    // check the user creadentials
    // create a tokens
    // send the response

    const { email, password } = req.body

    if (
        [email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "user not found")
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "user logged in successfully"
            )
        )
})


const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "user logged out successfully")
        )
})

const completeUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { phone, location, skills, bio } = req.body

    let formattedSkills = skills;
    if (skills && typeof skills === "string") {
        formattedSkills = skills.split(",").map(skill => skill.trim());
    }

    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path
    }

    let avatar;
    if (avatarLocalPath) {
        avatar = await uploadOnCloudinary(avatarLocalPath);
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                ...(avatar && { avatar: avatar.url }),
                ...(phone && { phone }),
                ...(location && { location }),
                ...(formattedSkills && { skills: formattedSkills }),
                ...(bio && { bio })
            }
        },
        { new: true, runValidators: true }
    ).select("-password -refreshToken")


    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Profile updated successfully")
    );
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(
            new ApiResponse(200, req.user, "user fetched successfully")
        )
})

const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params

    const user = await User.findById(id).select("-password -refreshToken");

    if (!user) {
        return res.status(404).json(
            new ApiResponse(404, {}, "User not found")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User fetched successfully")
    );
})


export {
    registerUser,
    loginUser,
    logOutUser,
    completeUserProfile,
    getCurrentUser,
    getUserById
}