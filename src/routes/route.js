const express = require('express');
const router = express.Router();
const urlControllers = require("../controllers/urlController")



router.get("/test-me", function (req, res) {
    console.log("testme")
    res.send("My first ever api!")
})

router.post("/url/shorten",urlControllers.createShortUrl)
module.exports = router;













