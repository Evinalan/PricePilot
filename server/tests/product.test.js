const request = require("supertest");
const app = require("../app");

describe("PricePilot Product API Tests", () => {

  test("Should get all products", async () => {

    const response = await request(app)
      .get("/api/products");

    expect(response.statusCode).toBe(200);

    expect(response.body).toBeDefined();

  });

});