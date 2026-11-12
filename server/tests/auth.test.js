const request = require("supertest");
const app = require("../app");
const User = require("../models/User");

describe("PricePilot Authentication API Tests", () => {

  // TEST 1: USER REGISTRATION

  test("Should register a new user", async () => {

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "test123456"
      });

    expect(response.statusCode).toBe(201);

    const user = await User.findOne({
      email: "test@example.com"
    });

    expect(user).not.toBeNull();

    // Password should be hashed
    expect(user.password).not.toBe("test123456");

  });


  // TEST 2: PREVENT DUPLICATE REGISTRATION

  test("Should not register an existing email", async () => {

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "duplicate@example.com",
        password: "test123456"
      });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Another User",
        email: "duplicate@example.com",
        password: "test123456"
      });

    expect([400, 409]).toContain(response.statusCode);

  });


  // TEST 3: USER LOGIN

  test("Should login an existing user", async () => {

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login User",
        email: "login@example.com",
        password: "test123456"
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@example.com",
        password: "test123456"
      });

    expect(response.statusCode).toBe(200);

    expect(response.body.token).toBeDefined();

  });


  // TEST 4: INVALID LOGIN

  test("Should reject incorrect password", async () => {

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@example.com",
        password: "wrongpassword"
      });

    expect([400, 401]).toContain(response.statusCode);

  });

});