const request = require("supertest");

const server = require("../server");
const testUtils = require("../test-utils");

const User = require("../models/user");
const Item = require("../models/item");
const Order = require("../models/order");

describe("/order", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);

  afterEach(testUtils.clearDB);

  const item0 = { title: "Item One", price: 10 };
  const item1 = { title: "Second Item", price: 12 };
  let items;

  beforeEach(async () => {
    items = (await Item.insertMany([item0, item1])).map((i) => i.toJSON());
  });

  describe("Before login", () => {
    describe("POST /", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).post("/orders").send(item0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .post("/orders")
          .set("Authorization", "Bearer BAD")
          .send(item0);
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("GET /", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/orders").send(item0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/orders")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("GET /:id", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/orders/123").send(item0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/orders/456")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
  });
  describe("after login", () => {
    const user0 = {
      email: "user0@mail.com",
      password: "123password",
    };
    const user1 = {
      email: "user1@mail.com",
      password: "456password",
    };
    let token0;
    let adminToken;
    beforeEach(async () => {
      await request(server).post("/auth/signup").send(user0);
      const res0 = await request(server).post("/auth/login").send(user0);
      token0 = res0.body.token;
      await request(server).post("/auth/signup").send(user1);
      await User.updateOne(
        { email: user1.email },
        { $push: { roles: "admin" } },
      );
      const res1 = await request(server).post("/auth/login").send(user1);
      adminToken = res1.body.token;
    });
    describe("POST /", () => {
      it("should send 200 to normal user and create order", async () => {
        const res = await request(server)
          .post("/orders")
          .set("Authorization", "Bearer " + token0)
          .send(items.map((i) => i._id));
        expect(res.statusCode).toEqual(200);
        const storedOrder = await Order.findOne().lean();
        expect(storedOrder).toMatchObject({
          items: items.map((i) => i._id),
          userId: (await User.findOne({ email: user0.email }).lean())._id,
          total: 22,
        });
      });
      it("should send 200 to admin user and create order with repeat items", async () => {
        const res = await request(server)
          .post("/orders")
          .set("Authorization", "Bearer " + adminToken)
          .send([items[1], items[1], items[0]].map((i) => i._id));
        expect(res.statusCode).toEqual(200);
        const storedOrder = await Order.findOne().lean();
        expect(storedOrder).toMatchObject({
          items: [items[1]._id, items[1]._id, items[0]._id],
          userId: (await User.findOne({ email: user1.email }))._id,
          total: 34,
        });
      });
      it("should send 400 with a bad item _id", async () => {
        const res = await request(server)
          .post("/orders")
          .set("Authorization", "Bearer " + adminToken)
          .send([items[1], "5f1b8d9ca0ef055e6e5a1f6b"].map((i) => i._id));
        expect(res.statusCode).toEqual(400);
        const storedOrder = await Order.findOne().lean();
        expect(storedOrder).toBeNull();
      });
    });
    describe("GET /:id", () => {
      let order0Id, order1Id;
      beforeEach(async () => {
        const res0 = await request(server)
          .post("/orders")
          .set("Authorization", "Bearer " + token0)
          .send([items[0], items[1], items[1]].map((i) => i._id));
        order0Id = res0.body._id;
        const res1 = await request(server)
          .post("/orders")
          .set("Authorization", "Bearer " + adminToken)
          .send([items[1]].map((i) => i._id));
        order1Id = res1.body._id;
      });
      it("should send 200 to normal user with their order", async () => {
        const res = await request(server)
          .get("/orders/" + order0Id)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          items: [item0, item1, item1],
          userId: (await User.findOne({ email: user0.email }))._id.toString(),
          total: 34,
        });
      });
      it("should send 404 to normal user with someone else's order", async () => {
        const res = await request(server)
          .get("/orders/" + order1Id)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(404);
      });
      it("should send 200 to admin user with their order", async () => {
        const res = await request(server)
          .get("/orders/" + order1Id)
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          items: [item1],
          userId: (await User.findOne({ email: user1.email }))._id.toString(),
          total: 12,
        });
      });
      it("should send 200 to admin user with someone else's order", async () => {
        const res = await request(server)
          .get("/orders/" + order0Id)
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          items: [item0, item1, item1],
          userId: (await User.findOne({ email: user0.email }))._id.toString(),
          total: 34,
        });
      });
    });
    describe("GET /", () => {
      let order0Id, order1Id;
      beforeEach(async () => {
        const res0 = await request(server)
          .post("/orders")
          .set("Authorization", "Bearer " + token0)
          .send(items.map((i) => i._id));
        order0Id = res0.body._id;
        const res1 = await request(server)
          .post("/orders")
          .set("Authorization", "Bearer " + adminToken)
          .send([items[1]].map((i) => i._id));
        order1Id = res1.body._id;
      });
      it("should send 200 to normal user with their one order", async () => {
        const res = await request(server)
          .get("/orders")
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          {
            items: [items[0]._id.toString(), items[1]._id.toString()],
            userId: (await User.findOne({ email: user0.email }))._id.toString(),
            total: 22,
          },
        ]);
      });
      it("should send 200 to admin user all orders", async () => {
        const res = await request(server)
          .get("/orders")
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          {
            items: [items[0]._id.toString(), items[1]._id.toString()],
            userId: (await User.findOne({ email: user0.email }))._id.toString(),
            total: 22,
          },
          {
            items: [items[1]._id.toString()],
            userId: (await User.findOne({ email: user1.email }))._id.toString(),
            total: 12,
          },
        ]);
      });
    });
  });
});
