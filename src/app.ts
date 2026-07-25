import "express-async-errors";
import express from "express";
import cors from "cors";
import { routes } from "./routes/index.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);
app.use(errorHandler);

export { app };
