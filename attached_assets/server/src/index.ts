import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import authRoutes from "./routes/auth.routes";
import { authMiddleware } from "./middleware/auth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/auth", authRoutes);

app.use(authMiddleware); // secure all routes after this point

app.get("/api/secure-data", (req, res) => {
  res.json({ message: "This is protected data.", user: (req as any).user });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));