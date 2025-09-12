export const packageJsonContent = {
  name: `\${projectName}-backend`,
  version: "1.0.0",
  description: "Backend with MongoDB ",
  main: "src/index.js",
  type: "module",
  scripts: {
    start: "node src/index.js",
    dev: "nodemon src/index.js",
    // test: "node test-db.js",
    build: "echo 'Build completed'",
    test: "echo 'No tests specified'",
  },
  dependencies: {
    express: "^4.18.2",
    mongoose: "^7.0.0",
    dotenv: "^16.0.0",
    cors: "^2.8.5",
    bcryptjs: "^2.4.3",
    jsonwebtoken: "^9.0.0",
    "express-validator": "^6.15.0",
    "node-fetch": "^3.3.2",
    chalk: "^4.1.2"
  },
  devDependencies: {
    nodemon: "^2.0.0",
  },
  author: "",
  license: "MIT",
};

export const dbConnectContent = () => `import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
`;

export const envExampleContent = () => `# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/your-database-name

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:4200 # Adjust as needed
NODE_ENV=development
`;

export const indexContent = `
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./lib/dbconnect.js";
// import reviewRoutes from "./routes/review.js";
// import authRoutes from "./routes/auth.js";
// import protectedRoutes from "./routes/protected.js";

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:4200",
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "JWT Auth API is running!",
    endpoints: {
      // auth: "/api/auth",
      // protected: "/api/protected",
          review:"/api/reviews",
    }
  });
});

// app.use("/api/auth", authRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!"
  });
});

// Handle 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.listen(PORT, () => {
  // Connect to MongoDB
  connectDB(MONGO_URI);
  
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`📚 API Documentation available at http://localhost:\${PORT}\`);
});
`.trim();

// Postgresql + Prisma setup
export const postgresJsonContent = {
  name: `\${projectName}-backend`,
  version: "1.0.0",
  description: "Backend with PostgreSQL & Prisma",
  type: "module",
  scripts: {
    dev: "nodemon index.js",
    start: "node index.js",
    prisma: "prisma",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
  },
  dependencies: {
    express: "^4.18.2",
    "@prisma/client": "^5.14.0",
    dotenv: "^16.0.0",
    cors: "^2.8.5",
    chalk: "^4.1.2"
  },
  devDependencies: {
    prisma: "^5.14.0",
    nodemon: "^3.0.2",
  },
  author: "",
  license: "MIT"
};

export const PostgreSQLdbConnect = () => `
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Test the connection once when server starts
(async () => {
  try {
    await prisma.$connect();
    console.log("\\n🎉 Prisma connected to PostgreSQL successfully!");
  } catch (err) {
    console.error("❌ Error connecting to PostgreSQL via Prisma:", err.message);
    process.exit(1);
  }
})();

export default prisma;
`.trim();

export const PostgresindexContent = `
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log(chalk.white("🚀 Successfully connected to the PostgreSQL database!"));
  } catch (err) {
    console.error(chalk.red("❌ Failed to connect to the PostgreSQL database:"));
    console.error(err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:4200",
  credentials: true
}));

app.use(express.json());

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));


const prisma = new PrismaClient();

app.get("/", (req, res) => {
  res.send("🚀 Prisma + PostgreSQL + Express running!");
});

// Handle 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!"
  });
});


app.listen(process.env.PORT || 5000, () => {
  console.log("\n🚀 Server running on port " + (process.env.PORT || 5000));
  testDatabaseConnection();
});
`.trim();

export const schemaContent = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}
`;