import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"

const registerUser = asyncHandler(async (req,res) => {
    // get the user info from body
    // apply the validation check for empty fieds
    // sava the user in database
    // give the response to user

    const {name, email, role, password} = req.body

    if (
        [name, email, role, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(401, "All fields are required")
    }

})

export {
    registerUser,
}