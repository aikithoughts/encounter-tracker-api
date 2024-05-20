const { Router } = require("express");
const router = Router();

router.use("/auth", require("./auth"));
router.use("/items", require("./items"));
router.use("/orders", require("./orders"));
router.use("/combatants", require("./combatants"));
router.use("/encounters", require("./encounters"));


module.exports = router;
