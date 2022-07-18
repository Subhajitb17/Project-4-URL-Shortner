const urlmodel = require("../models/urlModel");
const shortid = require("shortid");
const validurl = require("valid-url");
const urlModel = require("../models/urlModel");

const isValid = function (value) {
  if (typeof value == "undefined" || value == null) return false;
  if (typeof value == "string" && value.trim().length == 0) return false;
  if (typeof value == "number") return false;
  return true;
};

const createShortUrl = async function (req, res) {
  try {
    const longUrl = req.body.longUrl;
    const baseUrl = "http://localhost:3000/";
    if (!isValid(longUrl)) {
      return res.status(400).send({ status: false, msg: "Please enter url" });
    }
    if (!validurl.isUri(longUrl)) {
      return res.status(400).send({ status: false, message: "url invalid!" });
    }

    const alreadyExistUrl = await urlModel.findOne({ longUrl: longUrl });
    if (alreadyExistUrl) {
      return res
        .status(400)
        .send({ status: false, msg: `${longUrl} is already exist` });
    }

    const urlCode = shortid.generate();
    const alreadyExistUrlCode = await urlModel.findOne({ urlCode: urlCode });
    if (alreadyExistUrlCode) {
      return res
        .send(400)
        .send({ status: false, msg: `${urlCode} is already exist` });
    }

    let shortUrl = baseUrl + urlCode;
    const completeUrlpresent = await urlModel.findOne({ shortUrl: shortUrl });
    if (completeUrlpresent) {
      return res
        .send(400)
        .send({ status: false, msg: `${shortUrl} already exist` });
    }

    let responsebody = {
      longUrl: longUrl,
      shortUrl: shortUrl,
      urlCode: urlCode,
    };
    const data = await urlModel.create(responsebody);
    return res
      .status(201)
      .send({ status: true, msg: "url successfully created", data: data });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};
module.exports.createShortUrl = createShortUrl;
