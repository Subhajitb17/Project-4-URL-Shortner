const express = require('express');
const router = express.Router();



router.get("/test-me", function (req, res) {
    console.log("testme")
    res.send("My first ever api!")
})

module.exports = router;













