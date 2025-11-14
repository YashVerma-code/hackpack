export const packageJsonContent = (language) => {
  const isTS = language === 'ts';

  return {
    name: "backend-server",
    version: "1.0.0",
    description: "Backend with MongoDB",
    main: `src/index.${isTS ? "ts" : "js"}`,
     ...(isTS ? {} : { type: "module" }),
    scripts: {
      start: `node src/index.js`,
      dev: `nodemon src/index.${isTS ? "ts" : "js"}`,
      build: isTS ? "tsc" : "echo 'Build completed'",
      test: "echo 'No tests specified'",
    },
    dependencies: {
      express: "^4.18.2",
      mongoose: "^7.0.0",
      dotenv: "^16.0.0",
      cors: "^2.8.5",
    },
    devDependencies: isTS
      ? {
          "@types/express": "^5.0.0",
          "@types/node": "^20.0.0",
          "@types/cors": "^2.8.19",
          "@types/mongoose": "^5.11.97",
          nodemon: "^3.1.10",
          "ts-node": "^10.9.2",
          typescript: "^5.6.3",
        }
      : {
          nodemon: "^3.1.10",
        },
    author: "",
    license: "MIT",
  };
};


export const dbConnectContent = (language) => {
  if (language === "ts") {
    return `import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};
const MONGO_URL = process.env.MONGO_URI;
export const connectDB = async () => {
  if (connection.isConnected) {
    console.log("Already connected to the database");
    return;
  }
  try {
    if (!MONGO_URL) throw new Error("Missing MONGODB_URL");
    const db=await mongoose.connect( MONGO_URL || '',{});
    const readyState = db.connections?.[0]?.readyState ?? 0;
    connection.isConnected= readyState;
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};
`
  } else {
    return `import mongoose from 'mongoose';
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

export default connectDB;`
  }
};

export const indexContent = (language) => {
  if (language == "ts") {
    return `// Import the express in typescript file
    import express from 'express';
    import dotenv from "dotenv";
    import cors from "cors";
    import { connectDB } from './lib/dbconnect';
    import testRoutes from "./routes/test.route";
    // Initialize the express engine
    const app: express.Application = express();
    
    dotenv.config();
    
    // CORS configuration
    app.use(cors({
      origin: process.env.CLIENT_URL || "http://localhost:4200",
      credentials: true
    }));
    
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true }));
    
    const PORT = process.env.PORT || 5000;
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
    app.use("/api/test", testRoutes);
    
    // Global error handler
    app.use((req, res, next) => {
      res.status(404).json({
        success: false,
        message: "Not Found!"
      });
    });
    
    app.listen(PORT, () => {
      // Connect to MongoDB
      connectDB();
      
      console.log(\`🚀 Server running on port \${PORT}\`);
      console.log(\`📚 API Documentation available at http://localhost:\${PORT}\`);
    })`.trim();
  } else {
    return `
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB  from "./lib/dbconnect.js";

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
  connectDB();
  
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`📚 API Documentation available at http://localhost:\${PORT}\`);
});
`.trim();
  }
}

export const envExampleContent = () => `# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/your-database-name

# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:4200 # Adjust as needed
NODE_ENV=development
`;


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
    console.log("🚀 Successfully connected to the PostgreSQL database!");
  } catch (err) {
    console.error("❌ Failed to connect to the PostgreSQL database:");
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

export const mongodbNextContent = (framework, language) => {
  return (`
import mongoose, { Mongoose } from 'mongoose'
${(framework === "astro") ? `const MONGODB_URL = import.meta.env.MONGODB_URI\nconst DB_NAME=import.meta.env.DB_NAME;\n` : `const MONGODB_URL = process.env.MONGO_URI\nconst DB_NAME=process.env.DB_NAME\n`}

${(language === 'ts') ? `interface MongooseConnection {
  conn: Mongoose | null
  promise: Promise<Mongoose> | null
}`: ``}


let cached${(language === 'ts') ? ': MongooseConnection' : ''}= (global ${(language === 'ts') ? 'as any' : ''}).mongoose

if (!cached) {
  cached = (global ${(language === 'ts') ? 'as any' : ''}).mongoose = {
    conn: null,
    promise: null,
  }
}

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn

  console.log('connected to MongoDB')
  if (!MONGODB_URL) throw new Error('Missing MONGODB_URL')

  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URL, {
      dbName: DB_NAME,
      bufferCommands: false,
    })

  cached.conn = await cached.promise
  return cached.conn
}`)
};

export const prismaClientContent = `
// lib/prisma/client.ts
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
`;

export const postgreSqlRoute = `// app/api/test-db/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma/client'
export async function testDbConnection(): Promise<boolean> {
  try {
    await prisma.$connect()
    console.log("✅ Connected to PostgreSQL database successfully.")
    return true
  } catch (error) {
    console.error("❌ Failed to connect to PostgreSQL database:", error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  const isConnected = await testDbConnection()

  if (isConnected) {
    return NextResponse.json({ status: 'success', message: 'Database connected ✅' })
  } else {
    return NextResponse.json({ status: 'error', message: 'Database connection failed ❌' }, { status: 500 })
  }
}
`

// Svelte-specific content templates
export const svelteMongoDbContent = `
import mongoose from 'mongoose';
import { MONGO_URI } from '$env/static/private';

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    console.log('Already connected to MongoDB');
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export default mongoose;
`;

export const svelteUserModelContent = `
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
`;

export const svelteApiRouteContent = `
import { connectToDatabase } from '$lib/database/mongoose.js';
import { User } from '$lib/models/User.js';
import { json } from '@sveltejs/kit';

export async function GET() {
  try {
    await connectToDatabase();
    
    const users = await User.find({}).select('-password');
    
    return json({
      success: true,
      data: users,
      message: 'Users fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    await connectToDatabase();
    
    const { name, email, password } = await request.json();
    
    // Basic validation
    if (!name || !email || !password) {
      return json({
        success: false,
        message: 'Name, email, and password are required'
      }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return json({
        success: false,
        message: 'User already exists'
      }, { status: 400 });
    }
    
    // Create new user (you should hash the password in production)
    const newUser = new User({
      name,
      email,
      password // Remember to hash this in production!
    });
    
    await newUser.save();
    
    return json({
      success: true,
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      message: 'User created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
`;

export const sveltePrismaContent = `
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
`;

export const sveltePostgresApiContent = `
import { prisma } from '$lib/prisma/index.js';
import { json } from '@sveltejs/kit';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return json({
      success: true,
      data: users,
      message: 'Users fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const { name, email, password } = await request.json();
    
    // Basic validation
    if (!name || !email || !password) {
      return json({
        success: false,
        message: 'Name, email, and password are required'
      }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return json({
        success: false,
        message: 'User already exists'
      }, { status: 400 });
    }
    
    // Create new user (you should hash the password in production)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password // Remember to hash this in production!
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    return json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
`;

export const sveltePackageJsonMongo = {
  "name": "sveltekit-mongo-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "vite build",
    "dev": "vite dev",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@sveltejs/adapter-auto": "^3.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "svelte": "^4.2.7",
    "vite": "^5.0.3"
  },
  "dependencies": {
    "mongoose": "^8.0.0"
  }
};

export const sveltePackageJsonPostgres = {
  "name": "sveltekit-postgres-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "vite build",
    "dev": "vite dev",
    "preview": "vite preview",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  },
  "devDependencies": {
    "@sveltejs/adapter-auto": "^3.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "prisma": "^5.0.0",
    "svelte": "^4.2.7",
    "vite": "^5.0.3"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0"
  }
};

// Nuxt-specific mongodb sertup
export const dbConnectContentNuxt = (isTypescript) => {

  return `import mongoose from 'mongoose'
const config = useRuntimeConfig()

const MONGODB_URI =process.env.MONGODB_URI || 'mongodb://localhost:27017/testing' 

// Prevent multiple connections during hot reloads in dev
let isConnected = false

export const connectToDB = async ()${isTypescript === "ts" ? `: Promise<void>` : ''} => {
  if (isConnected) return

  try {
    const db = await mongoose.connect(MONGODB_URI)
    isConnected = db.connections[0].readyState === 1
    console.log('✅ MongoDB Connected')
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error)
  }
}
`

}

export const userModel = `import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;`

export const apiContent = `import { connectToDB } from "../db/mongoose"
import User from "../models/User"

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  switch (method) {
    case 'GET':
      // Fetch all users or query params
      await connectToDB();
      const users = await User.find().lean()
      return { users, message: "Api testing" }

    case 'POST':
      const body = await readBody(event);

      // Basic validation: require a non-empty body
      if (
        body === null ||
        body === undefined ||
        (typeof body === 'object' && Object.keys(body).length === 0)
      ) {
        // Return a 400 Bad Request
        sendError(event, createError({ statusCode: 400, statusMessage: 'Request body required' }));
        return;
      }

      // Echo back the received body with a success message
      await connectToDB();
      const newUser = await User.create(body);

      return {
        success: true,
        message: 'POST received',
        data: body,
      };

    default:
      throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }
})
`