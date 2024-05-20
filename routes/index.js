const { Router } = require("express");
const router = Router();

router.use("/auth", require("./auth"));
router.use("/combatants", require("./combatants"));
router.use("/encounters", require("./encounters"));


module.exports = router;
