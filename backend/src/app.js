import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";

import notFound from "./auth/middleware/notFound.middleware.js";
import errorHandler from "./auth/middleware/error.middleware.js";

const app = express();



app.use(helmet());

app.use(
  cors({
    origin: "*",
  })
);



app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);




if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}



app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "Inventory & Order API is running",
    });
  }
);



app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);




app.use(notFound);




app.use(errorHandler);

export default app;