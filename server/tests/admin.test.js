import request from "supertest";
import mongoose from "mongoose";
import { jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";

// Mock models with jest.unstable_mockModule
await jest.unstable_mockModule("../models/Attendance.js", () => ({
  default: {
    find: jest.fn(),
  },
}));

await jest.unstable_mockModule("../models/User.js", () => ({
  default: {
    find: jest.fn(),
  },
}));

// Mock auth middleware
await jest.unstable_mockModule("../middleware/auth.js", () => ({
  auth: (req, res, next) => {
    req.user = { id: "mockUserId", role: "attendance" };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const { app, server } = await import("./app.js");
const { default: Attendance } = await import("../models/Attendance.js");
const { default: User } = await import("../models/User.js");

describe("Attendance Controller", () => {
  const mockToken = "Bearer faketoken";
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
    if (server) server.close();
  });

  test("GET /api/admin/employees", async () => {
    const mockEmployees = [
      { _id: "2", name: "Bob", role: "employee", employeeId: "EMP002" },
    ];

    User.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockEmployees),
    });

    const res = await request(app)
      .get("/api/admin/employees")
      .set("Authorization", mockToken);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty("name", "Bob");
    expect(res.body[0]).not.toHaveProperty("password");
  });

  describe("GET /api/admin/checkin-distribution", () => {
    const mockToken = "Bearer mockAdminToken"; 

    test("should return correct check-in distribution", async () => {
      const checkIns = [
        { timestamp: new Date("2025-07-01T02:00:00Z"), type: "check-in" }, 
        { timestamp: new Date("2025-07-01T05:00:00Z"), type: "check-in" }, 
        { timestamp: new Date("2025-07-01T08:00:00Z"), type: "check-in" }, 
      ];

      Attendance.find.mockResolvedValue(checkIns);

      const res = await request(app)
        .get("/api/admin/checkin-distribution")
        .set("Authorization", mockToken);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("7 AM - 9 AM", 1);
      expect(res.body).toHaveProperty("9 AM - 11 AM", 1);
      expect(res.body).toHaveProperty("11 AM - 1 PM", 0);
      expect(res.body).toHaveProperty("Late (1 PM+)", 1);
    });
  });

  test("GET /api/admin/all-logs", async () => {
    const logs = [
      {
        _id: "1",
        type: "check-in",
        note: "Came late",
        timestamp: new Date("2025-07-20T08:00:00Z"),
        user: { employeeId: "EMP123" },
      },
    ];

    Attendance.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(logs),
      }),
    });

    const res = await request(app)
      .get("/api/admin/all-logs")
      .set("Authorization", mockToken);

    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty("reason", "Came late");
    expect(res.body[0]).toHaveProperty("empId", "EMP123");
  });

  test("GET /api/admin/working-hours", async () => {
    const mockUsers = [{ _id: "1", name: "Alice", role: "employee" }];

    const mockLogs = [
      {
        user: "1",
        type: "check-in",
        timestamp: new Date("2025-07-01T09:00:00Z"),
      },
      {
        user: "1",
        type: "check-out",
        timestamp: new Date("2025-07-01T17:00:00Z"),
      },
      {
        user: "1",
        type: "check-in",
        timestamp: new Date("2025-07-02T09:30:00Z"),
      },
      {
        user: "1",
        type: "check-out",
        timestamp: new Date("2025-07-02T16:30:00Z"),
      },
    ];

    User.find.mockResolvedValue(mockUsers);

    Attendance.find.mockReturnValue({
      sort: () => Promise.resolve(mockLogs),
    });

    const res = await request(app)
      .get("/api/admin/working-hours")
      .set("Authorization", mockToken);

    expect(res.status).toBe(200);

    const result = res.body;
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("Alice");

    const monthData = result[0].data.find((d) => d.x === "Jul");
    expect(monthData).toBeDefined();
    expect(monthData.y).toBeCloseTo(15.0, 1); // 8 + 7 hours
  });
});
