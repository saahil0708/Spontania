import express from 'express';
import cookieParser from 'cookie-parser';
import adminRoutes from "./Routes/Admin.Routes.js";
import eventRoutes from "./Routes/Event.Routes.js";
import teamRoutes from "./Routes/Team.Routes.js";
import scoreRoutes from "./Routes/Score.Routes.js";
import cors from 'cors';

const app = express();

app.use(cors(
    {
        origin: "http://localhost:3000",
        credentials: true
    }
));

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/scores", scoreRoutes);

export default app;