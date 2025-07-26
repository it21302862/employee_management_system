import request from "supertest";
import mongoose from "mongoose";
import { jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";


await jest.unstable_mockModule("../models/Attendance.js", () => {

  const MockAttendance = jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({}),
  }));


  MockAttendance.find = jest.fn().mockReturnValue({
    exec: jest.fn(), 
  });
  MockAttendance.findOne = jest.fn().mockReturnValue({
    exec: jest.fn(), 
  });
  MockAttendance.create = jest.fn(); 


  MockAttendance.prototype = {
    save: jest.fn().mockResolvedValue({}),
  };

  return {
    default: MockAttendance,
  };
});

// Mock auth middleware
await jest.unstable_mockModule("../middleware/auth.js", () => ({
  auth: (req, res, next) => {
    req.user = { id: "mockUserId", role: "employee" };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));


const { app, server } = await import("./app.js");
const { default: Attendance } = await import("../models/Attendance.js");

describe("Attendance Routes", () => {
  let mongoServer;
  const mockToken = "Bearer mockToken"; 

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    if (server) server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /api/attendance/check-in - already checked in", async () => {
    Attendance.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: "existingId" }), 
    });

    const res = await request(app)
      .post("/api/attendance/check-in")
      .set("Authorization", mockToken) 
      .send({ note: "Morning shift" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ msg: "Already checked in today" });
  });

  test("POST /api/attendance/check-out - already checked out", async () => {
    Attendance.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: "existingId" }),
    });

    const res = await request(app)
      .post("/api/attendance/check-out")
      .set("Authorization", mockToken) 
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ msg: "Already checked out today" });
  });
});