import request from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { app } from "./app.js"; 
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

// Ensure MONGO_URI is defined
if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in .env.test file");
}

let server; 

beforeAll(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to DB");

 
    server = app.listen(0); 
    console.log("Express server started for tests");
  } catch (err) {
    console.error("Failed to connect to MongoDB or start server:", err);
    throw err;
  }
});

afterAll(async () => {
  try {
    if (mongoose.connection.db) {
      await mongoose.connection.db.collection("users").deleteMany({}); // Clear collection
    }
    await mongoose.disconnect();
    if (server) {
      await server.close(); // Close Express server
      console.log("Disconnected from DB and closed server");
    } else {
      console.warn("Server was not initialized, skipping server.close()");
    }
  } catch (err) {
    console.error("Error during cleanup:", err);
    throw err;
  }
});

describe("Auth Routes", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "test1234",
      role: "employee",
      employeeId: "EMP001",
      position: "Developer",
      age: 25,
      phone: "0771234567",
      address: "123 Main St",
      city: "Colombo",
      zipCode: "10100",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe("testuser@example.com");
    expect(res.body.token).toBeDefined();
  });

  it("should not allow duplicate registration", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "testuser@example.com", // duplicate
      password: "test1234",
      role: "employee",
      employeeId: "EMP002",
      position: "Tester",
      age: 28,
      phone: "0778888888",
      address: "456 Main St",
      city: "Kandy",
      zipCode: "20000",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe("Email already registered");
  });

  it("should login with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "test1234",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("testuser@example.com");
    expect(res.body.token).toBeDefined();
  });

  it("should reject login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "wrongpass",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe("Invalid credentials");
  });
});