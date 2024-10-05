const User = require("./users/users-model");
const request = require("supertest");
const db = require("../data/dbConfig");
const jwt = require("jsonwebtoken");
const server = require("./server.js");

let user_token;
process.env.JWT_SECRET = 'test_secret';

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
  const user = await User.create({
    username: "test",
    password: "test",
  });
  user_token = jwt.sign({
    user_id: user.id,
    username: user.username,
  }, process.env.JWT_SECRET, { expiresIn: "1h" });
})

afterAll(async () => {
  await db.destroy();
})

test('sanity', () => {
  expect(true).toBe(true)
})

describe("[POST] /api/auth/login", () => {
  it("user must provide username and password", async () => {
    const res = await request(server).post("/api/auth/login").send({ password: "test"});
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ message: "username and password required" });
  })

  it("login should login user", async () => {
    const res = await request(server).post("/api/auth/login").send({ username:"test", password:"wrong" });
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ message: "invalid credentials" })
  })
})

describe("[POST] /api/auth/register", () => {
  it("user must provide username and password", async () => {
    const res = await request(server).post("/api/auth/register").send({ username: "foo", password: "bar" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 2,
      username: "foo",
    })
  })

  it("username should not already exsist", async () => {
    const res = await request(server).post("/api/auth/register").send({ username: "test", password: "username_taken" });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ message: "username taken"})
  })
})

describe("[GET] /api/jokes", () => {
  it("should return 401 if no token is provided", async () => {
    const res = await request(server).get("/api/jokes");
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ message: "token required" });
  })

  it("should return jokes if valid token is provided", async () => {
    const res = await request(server).get("/api/jokes").set("Authorization", user_token);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  })
})


