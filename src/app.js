import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import errorHandler from "./middlewares/error.middleware.js"

const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))


app.use(express.json({ limit: "20kb" }))
app.use(express.urlencoded({ extended: true, limit: "20kb" }))
app.use(express.static("public"))
app.use(cookieParser())


// routes import
import userRouter from "./routes/user.routes.js"
import jobRouter from "./routes/job.routes.js"
import adminRouter from "./routes/admin.routes.js"

// routes declaration
app.use("/api/v1/user", userRouter)
app.use("/api/v1/job", jobRouter)
app.use("/api/v1/admin", adminRouter)

app.use(errorHandler)
export { app }