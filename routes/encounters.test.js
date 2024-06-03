const request = require("supertest");
const server = require("../server");
const testUtils = require("../test-utils");
const mongoose = require("mongoose");

const User = require("../models/user");
const Combatant = require("../models/combatant");
const Encounter = require("../models/encounter");

describe("/encounter", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);

  afterEach(testUtils.clearDB);

  const combatant0 = { name: "Bilwin", initiative: 10, hitpoints: 55 };
  const combatant1 = { name: "Monde", initiative: 15, hitpoints: 45 };
  let combatants;

  beforeEach(async () => {
    combatants = (await Combatant.insertMany([combatant0, combatant1])).map((i) => i.toJSON());
  });

  describe("Before login", () => {
    describe("POST /", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).post("/encounters").send(combatant0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .post("/encounters")
          .set("Authorization", "Bearer BAD")
          .send(combatant0);
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("GET /", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/encounters").send(combatant0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/encounters")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("GET /:id", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/encounters/123").send(combatant0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/encounters/456")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
  });

  describe("After login", () => {
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
        { $push: { roles: "admin" } }
      );
      const res1 = await request(server).post("/auth/login").send(user1);
      adminToken = res1.body.token;
    });

    describe("POST /", () => {
      it("should send 200 to normal user and create encounter", async () => {
        const res = await request(server)
          .post("/encounters")
          .set("Authorization", "Bearer " + token0)
          .send({ name: "Test", combatantIds: combatants.map((i) => i._id) })
        expect(res.statusCode).toEqual(200);
        const storedEncounter = await Encounter.findOne().lean();
        expect(storedEncounter).toMatchObject({
          combatants: combatants.map((i) => i._id),
          userId: (await User.findOne({ email: user0.email }).lean())._id,
          name: "Test"
        });
      });
      it("should send 200 to admin user and create encounter with repeat combatants", async () => {
        const res = await request(server)
          .post("/encounters")
          .set("Authorization", "Bearer " + adminToken)
          .send({ name: "Test", combatantIds: [combatants[1], combatants[1], combatants[0]].map((i) => i._id) });
        expect(res.statusCode).toEqual(200);
        const storedEncounter = await Encounter.findOne().lean();
        expect(storedEncounter).toMatchObject({
          combatants: [combatants[1]._id, combatants[1]._id, combatants[0]._id],
          userId: (await User.findOne({ email: user1.email }))._id,
          name: "Test"
        });
      });
      it("should send 400 with a bad combatant _id", async () => {
        const encounterName = "Test";
        const combatantIds = [combatants[1]._id, "123"];
        const res = await request(server)
          .post("/encounters")
          .set("Authorization", "Bearer " + adminToken)
          .send({ name: encounterName, combatantIds: combatantIds });
        expect(res.statusCode).toEqual(400);
        const storedEncounter = await Encounter.findOne().lean();
        expect(storedEncounter).toBeNull();
      });
    });

    describe("PUT /:id", () => {
      let encounter0Id, encounter1Id;
      beforeEach(async () => {
        const res0 = await request(server)
          .post("/encounters")
          .set("Authorization", "Bearer " + token0)
          .send({ name: "encounter0", combatantIds: [combatants[0], combatants[1], combatants[1]].map((i) => i._id) });
        encounter0Id = res0.body._id;
        const res1 = await request(server)
          .post("/encounters")
          .set("Authorization", "Bearer " + adminToken)
          .send({ name: "encounter1", combatantIds: [combatants[1]].map((i) => i._id) });
        encounter1Id = res1.body._id;
      });
      it("should send 200 to normal user and update encounter", async () => {
        const res = await request(server)
          .put("/encounters/" + encounter0Id)
          .set("Authorization", "Bearer " + token0)
          .send({ combatantIds: combatants.map((i) => i._id) });
        expect(res.statusCode).toEqual(200);
        const storedEncounter = await Encounter.findOne().lean();
        expect(storedEncounter).toMatchObject({
          combatants: combatants.map((i) => i._id),
          userId: (await User.findOne({ email: user0.email }).lean())._id,
        });
      });
      it("should send 200 to admin user and update encounter", async () => {
        const res = await request(server)
          .put("/encounters/" + encounter0Id)
          .set("Authorization", "Bearer " + adminToken)
          .send({ combatantIds: combatants.map((i) => i._id) });
        expect(res.statusCode).toEqual(200);
        const storedEncounter = await Encounter.findOne().lean();
        expect(storedEncounter).toMatchObject({
          combatants: combatants.map((i) => i._id),
          userId: (await User.findOne({ email: user0.email }).lean())._id,
        });
      });
      it("should send 403 to normal user with someone else's encounter", async () => {
        const res = await request(server)
          .put("/encounters/" + encounter1Id)
          .set("Authorization", "Bearer " + token0)
          .send({ combatantIds: [combatants[1]].map((i) => i._id) });
        expect(res.statusCode).toEqual(403);
      });
      it("should send 400 with a bad encounter _id", async () => {
        const fakeEncounterId = new mongoose.Types.ObjectId();
        const res = await request(server)
          .put("/encounters/" + fakeEncounterId)
          .set("Authorization", "Bearer " + adminToken)
          .send({ combatantIds: [combatants[1]].map((i) => i._id) });
        expect(res.statusCode).toEqual(400);
      });
    });

    describe("DELETE /encounters/:id", () => {
      let encounter0Id, encounter1Id;
      beforeEach(async () => {
        const res0 = await request(server)
          .post("/encounters")
          .set("Authorization", "Bearer " + token0)
          .send({ name: "encounter0", combatantIds: [combatants[0], combatants[1], combatants[1]].map((i) => i._id) });
        encounter0Id = res0.body._id;
        const res1 = await request(server)
          .post("/encounters")
          .set("Authorization", "Bearer " + adminToken)
          .send({ name: "encounter1", combatantIds: [combatants[1]].map((i) => i._id) });
        encounter1Id = res1.body._id;
      });

      it("should send 200 when normal user attempts to delete an encounter they own", async () => {
        const res = await request(server)
          .delete("/encounters/" + encounter0Id)
          .set("Authorization", "Bearer " + token0);
        expect(res.statusCode).toEqual(200);
        const storedEncounter = await Encounter.findById(encounter0Id).lean();
        expect(storedEncounter).toBeNull();
      });

      it("should send 403 to normal user and not delete encounter", async () => {
        const res = await request(server)
          .delete("/encounters/" + encounter1Id)
          .set("Authorization", "Bearer " + token0);
        expect(res.statusCode).toEqual(403);
        const storedEncounter = await Encounter.findById(encounter0Id).lean();
        expect(storedEncounter).not.toBeNull();
      });

      it("should send 200 to admin user and delete encounter", async () => {
        const res = await request(server)
          .delete("/encounters/" + encounter1Id)
          .set("Authorization", "Bearer " + adminToken);
        expect(res.statusCode).toEqual(200);
        const storedEncounter = await Encounter.findById(encounter1Id).lean();
        expect(storedEncounter).toBeNull();
      });
    });

    describe('GET /encounters/:id/user', () => {
      let encounter0Id, encounter1Id;
      beforeEach(async () => {
        const res0 = await request(server)
          .post("/encounters")
          .set("Authorization", "Bearer " + token0)
          .send({ name: "encounter0", combatantIds: [combatants[0], combatants[1], combatants[1]].map((i) => i._id) });
        encounter0Id = res0.body._id;
        const res1 = await request(server)
          .post("/encounters")
          .set("Authorization", "Bearer " + adminToken)
          .send({ name: "encounter1", combatantIds: [combatants[1]].map((i) => i._id) });
        encounter1Id = res1.body._id;
      });
      it('should return the user for the encounter', async () => {

        const res = await request(server)
          .get(`/encounters/${encounter0Id}/user`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('_id'); // Assuming the user object has an _id property
      });

      it('should return 404 if the encounter does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId(); // This will generate a new unique ObjectId

        const response = await request(server)
          .get(`/encounters/${nonExistentId}/user`);

        expect(response.status).toBe(404);
      });
    });

    describe("GET /:id", () => {
      let encounter0Id, encounter1Id;
      beforeEach(async () => {
        const res0 = await request(server)
          .post("/encounters")
          .set("Authorization", "Bearer " + token0)
          .send({ name: "encounter0", combatantIds: [combatants[0], combatants[1], combatants[1]].map((i) => i._id) });
        encounter0Id = res0.body._id;
        const res1 = await request(server)
          .post("/encounters")
          .set("Authorization", "Bearer " + adminToken)
          .send({ name: "encounter1", combatantIds: [combatants[1]].map((i) => i._id) });
        encounter1Id = res1.body._id;
      });
      it("should send 200 to normal user with their encounter", async () => {
        const res = await request(server)
          .get("/encounters/" + encounter0Id)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          combatants: [combatant0, combatant1, combatant1],
          userId: (await User.findOne({ email: user0.email }))._id.toString(),
          name: "encounter0"
        });
      });
      it("should send 404 to normal user with someone else's encounter", async () => {
        const res = await request(server)
          .get("/encounters/" + encounter1Id)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(404);
      });
      it("should send 200 to admin user with their encounter", async () => {
        const res = await request(server)
          .get("/encounters/" + encounter1Id)
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          combatants: [combatant1],
          userId: (await User.findOne({ email: user1.email }))._id.toString(),
          name: "encounter1"
        });
      });
      it("should send 200 to admin user with someone else's encounter", async () => {
        const res = await request(server)
          .get("/encounters/" + encounter0Id)
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          combatants: [combatant0, combatant1, combatant1],
          userId: (await User.findOne({ email: user0.email }))._id.toString(),
          name: "encounter0"
        });
      });
    });

    describe("GET /", () => {
      let encounter0Id, encounter1Id;
      beforeEach(async () => {
        const res0 = await request(server)
          .post("/encounters")
          .set("Authorization", "Bearer " + token0)
          .send({ name: "encounter0", combatantIds: [combatants[0], combatants[1], combatants[1]].map((i) => i._id) });
        encounter0Id = res0.body._id;
        const res1 = await request(server)
          .post("/encounters")
          .set("Authorization", "Bearer " + adminToken)
          .send({ name: "encounter1", combatantIds: [combatants[1]].map((i) => i._id) });
        encounter1Id = res1.body._id;
      });
      it("should send 200 to normal user with their one encounter", async () => {
        const res = await request(server)
          .get("/encounters")
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          {
            combatants: [combatants[0]._id.toString(), combatants[1]._id.toString(), combatants[1]._id.toString()],
            userId: (await User.findOne({ email: user0.email }))._id.toString(),
            name: "encounter0"
          },
        ]);
      });
      it("should send 200 to admin user with all encounters", async () => {
        const res = await request(server)
          .get("/encounters")
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          {
            combatants: [combatants[0]._id.toString(), combatants[1]._id.toString(), combatants[1]._id.toString()],
            userId: (await User.findOne({ email: user0.email }))._id.toString(),
          },
          {
            combatants: [combatants[1]._id.toString()],
            userId: (await User.findOne({ email: user1.email }))._id.toString(),
          },
        ]);
      });
    });
    describe("GET /search", () => {
      let encounter0Id, encounter1Id;
      beforeEach(async () => {
        const res0 = await request(server)
          .post("/encounters")
          .set("Authorization", "Bearer " + token0)
          .send({ name: "encounter0", combatantIds: [combatants[0], combatants[1], combatants[1]].map((i) => i._id) });
        encounter0Id = res0.body._id;
        const res1 = await request(server)
          .post("/encounters")
          .set("Authorization", "Bearer " + adminToken)
          .send({ name: "encounter1", combatantIds: [combatants[1]].map((i) => i._id) });
        encounter1Id = res1.body._id;
      });
      it("should send 200 to normal user with their one encounter", async () => {
        const res = await request(server)
          .get("/encounters/search")
          .set("Authorization", "Bearer " + token0)
          .query({ name: "encounter0" });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          {
            combatants: [combatants[0]._id.toString(), combatants[1]._id.toString(), combatants[1]._id.toString()],
            userId: (await User.findOne({ email: user0.email }))._id.toString(),
            name: "encounter0"
          },
        ]);
      });
      it("should send 404 to normal user with someone else's encounter", async () => {
        const res = await request(server)
          .get("/encounters/search")
          .set("Authorization", "Bearer " + token0)
          .query({ name: "encounter1" });
        expect(res.statusCode).toEqual(404);
      });
    });
  });
});
