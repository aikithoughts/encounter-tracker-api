const request = require("supertest");
const server = require("../server");
const testUtils = require("../test-utils");

const User = require("../models/user");
const Combatant = require("../models/combatant");
const combatantDAO = require("../dao/combatant");
const isAuthenticated = require("../middleware/isAuthenticated");

describe("/combatants", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);
  afterEach(testUtils.clearDB);

  const combatant0 = { name: "Bilwin", initiative: 10, hitpoints: 55 };
  const combatant1 = { name: "Monde", initiative: 15, hitpoints: 45 };

  describe("Before login", () => {
    describe("POST /", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).post("/combatants").send(combatant0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .post("/combatants")
          .set("Authorization", "Bearer BAD")
          .send(combatant0);
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("GET /", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/combatants").send();
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/combatants")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe("GET /:id", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/combatants/123").send();
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/combatants/456")
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
        { $push: { roles: "admin" } }
      );
      const res1 = await request(server).post("/auth/login").send(user1);
      adminToken = res1.body.token;
    });

    describe.each([combatant0, combatant1])("POST / combatant %#", (combatant) => {
      it("should send 403 to normal user and not store combatant", async () => {
        const res = await request(server)
          .post("/combatants")
          .set("Authorization", "Bearer " + token0)
          .send(combatant);
        expect(res.statusCode).toEqual(403);
        expect(await Combatant.countDocuments()).toEqual(0);
      });
      it("should send 200 to admin user and store combatant", async () => {
        const res = await request(server)
          .post("/combatants")
          .set("Authorization", "Bearer " + adminToken)
          .send(combatant);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(combatant);
        const savedCombatant = await Combatant.findOne({ _id: res.body._id }).lean();
        expect(savedCombatant).toMatchObject(combatant);
      });
      it('should return 500 and internal server error message when DAO throws an error', async () => {
        // Save original implementation
        const originalCreateCombatant = combatantDAO.createCombatant;

        // Mock createCombatant to throw an error only for this test
        jest.spyOn(combatantDAO, 'createCombatant').mockImplementation(() => {
          throw new Error("Simulated error");
        });

        const res = await request(server)
          .post('/combatants')
          .set('Authorization', 'Bearer ' + adminToken) // Assuming adminToken is defined in your test setup
          .send({ name: 'Test Combatant', initiative: 10, hitpoints: 100 });

        // Restore original implementation
        combatantDAO.createCombatant = originalCreateCombatant;

        expect(res.statusCode).toEqual(500);
        expect(res.text).toEqual("Internal server error");
      });
    });

    describe.each([combatant0, combatant1])("PUT / combatant %#", (combatant) => {
      let originalCombatant;
      beforeEach(async () => {
        const res = await request(server)
          .post("/combatants")
          .set("Authorization", "Bearer " + adminToken)
          .send(combatant);
        originalCombatant = res.body;
      });
      it("should send 403 to normal user and not update combatant", async () => {
        const res = await request(server)
          .put("/combatants/" + originalCombatant._id)
          .set("Authorization", "Bearer " + token0)
          .send({ ...combatant, hitpoints: combatant.hitpoints + 1 });
        expect(res.statusCode).toEqual(403);
        const newCombatant = await Combatant.findById(originalCombatant._id).lean();
        newCombatant._id = newCombatant._id.toString();
        expect(newCombatant).toMatchObject(originalCombatant);
      });
      it("should send 400 if hitpoints are missing", async () => {
        const incompleteCombatant = { name: "Bilwin", initiative: 10 };
        const res = await request(server)
          .put("/combatants/" + originalCombatant._id)
          .set("Authorization", "Bearer " + adminToken)
          .send(incompleteCombatant);
        expect(res.statusCode).toEqual(400);
      });
      it("should send 200 to admin user and update combatant", async () => {
        const res = await request(server)
          .put("/combatants/" + originalCombatant._id)
          .set("Authorization", "Bearer " + adminToken)
          .send({ ...combatant, hitpoints: combatant.hitpoints + 1 });
        expect(res.statusCode).toEqual(200);
        const newCombatant = await Combatant.findById(originalCombatant._id).lean();
        newCombatant._id = newCombatant._id.toString();
        expect(newCombatant).toMatchObject({
          ...originalCombatant,
          hitpoints: originalCombatant.hitpoints + 1,
        });
      });
    });

    // DELETE a combatant
    describe.each([combatant0, combatant1])("DELETE / combatant %#", (combatant) => {
      let originalCombatant;
      beforeEach(async () => {
        const res = await request(server)
          .post("/combatants")
          .set("Authorization", "Bearer " + adminToken)
          .send(combatant);
        originalCombatant = res.body;
      });
      it("should send 403 to normal user and not delete combatant", async () => {
        const res = await request(server)
          .delete("/combatants/" + originalCombatant._id)
          .set("Authorization", "Bearer " + token0);
        expect(res.statusCode).toEqual(403);
        const newCombatant = await Combatant.findById(originalCombatant._id).lean();
        expect(newCombatant).not.toBeNull();
        newCombatant._id = newCombatant._id.toString();
        expect(newCombatant).toMatchObject(originalCombatant);
      });

      it("should send 200 to admin user and delete combatant", async () => {
        const res = await request(server)
          .delete("/combatants/" + originalCombatant._id)
          .set("Authorization", "Bearer " + adminToken);
        expect(res.statusCode).toEqual(200);
        const newCombatant = await Combatant.findById(originalCombatant._id).lean();
        expect(newCombatant).toBeNull();
      });
      it("should send 400 if combatant is in use by an encounter", async () => {
        // Create a combatant
        const resCombatant = await request(server)
          .post("/combatants")
          .set("Authorization", "Bearer " + adminToken)
          .send(combatant);
        expect(resCombatant.statusCode).toEqual(200);
        expect(resCombatant.body).toMatchObject(combatant);
        const savedCombatant = await Combatant.findOne({ _id: resCombatant.body._id }).lean();
        expect(savedCombatant).toMatchObject(combatant);

        // Create an encounter
        const resEncounter = await request(server)
          .post("/encounters")
          .set("Authorization", "Bearer " + token0)
          .send({ name: "Test", combatantIds: [savedCombatant._id] });
        expect(resEncounter.statusCode).toEqual(200);

        //Try to delete the combatant
        const resDelete = await request(server)
          .delete("/combatants/" + savedCombatant._id)
          .set("Authorization", "Bearer " + adminToken);
        expect(resDelete.statusCode).toEqual(400);
        expect(resDelete.body.error).toBe("Cannot delete combatant as it is still in use by an encounter.");
        const newCombatant = await Combatant.findById(originalCombatant._id).lean();
        expect(newCombatant).not.toBeNull();
        newCombatant._id = newCombatant._id.toString();
        expect(newCombatant).toMatchObject(originalCombatant);
      });
    });

    describe.each([combatant0, combatant1])("GET /:id combatant %#", (combatant) => {
      let originalCombatant;
      beforeEach(async () => {
        const res = await request(server)
          .post("/combatants")
          .set("Authorization", "Bearer " + adminToken)
          .send(combatant);
        originalCombatant = res.body;
      });
      it("should send 200 to normal user and return combatant", async () => {
        const res = await request(server)
          .get("/combatants/" + originalCombatant._id)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(originalCombatant);
      });
      it("should send 200 to admin user and return combatant", async () => {
        const res = await request(server)
          .get("/combatants/" + originalCombatant._id)
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(originalCombatant);
      });
    });

    describe("GET /", () => {
      let combatants;
      beforeEach(async () => {
        combatants = (await Combatant.insertMany([combatant0, combatant1])).map((c) => c.toJSON());
        combatants.forEach((c) => (c._id = c._id.toString()));
      });
      it("should send 200 to normal user and return all combatants", async () => {
        const res = await request(server)
          .get("/combatants/")
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(combatants);
      });
      it("should send 200 to admin user and return all combatants", async () => {
        const res = await request(server)
          .get("/combatants/")
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(combatants);
      });
    });
  });
});
