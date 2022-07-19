const shortid = require("shortid");
const validurl = require("valid-url");
const urlModel = require("../models/urlModel");
const { get } = require("../routes/route");


//Validation
const isValid = function (value) {
  if (typeof value == "undefined" || value == null) return false;
  if (typeof value == "string" && value.trim().length == 0) return false;
  if (typeof value == "number") return false;
  return true;
};

const isValidRequestBody = function (request) {
  return (Object.keys(request).length > 0)
}

const createShortUrl = async function (req, res) {
  try {
    let urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%.\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%\+.~#?&//=]*)/
    //declare logUrl from request body
    const longUrl = req.body.longUrl;

    //decleare baseUrl
    const baseUrl = "http://localhost:3000/";

    //Empty body validation
    if (!isValidRequestBody) {
      return res.status(400).send({ status: false, message: "Please Enter Input in request body" })
    }

    //Long Url validation
    if (!isValid(longUrl)) {
      return res.status(400).send({ status: false, msg: "Please enter url" });
    }

    if(!urlRegex.test(longUrl)){
      return res.status(400).send({status: false, msg: `${longUrl}  is not in a valid url.` })
    }

    //long url is valid url or not checking validation
    if (!validurl.isUri(longUrl)) {
      return res.status(400).send({ status: false, message: "url invalid!" });
    }

    //long url already present in database or not
    const alreadyExistUrl = await urlModel.findOne({ longUrl });
    if (alreadyExistUrl) {
      return res.status(400).send({ status: false, msg: `${longUrl}  already exist.It should be unique` });
    }

    //Generate Url code
    const urlCode = shortid.generate().toLowerCase();

    //generated Url code prent in database or not
    const alreadyExistUrlCode = await urlModel.findOne({ urlCode: urlCode });
    if (alreadyExistUrlCode) {
      return res.send(400).send({ status: false, msg: `${urlCode} is already exist` });
    }

    //create short Url by adding baseurl and generated Url code
    let shortUrl = baseUrl + urlCode;

    //short Url present in database or not
    const completeUrlExist = await urlModel.findOne({ shortUrl: shortUrl });
    if (completeUrlExist) {
      return res.send(400).send({ status: false, msg: `${shortUrl} already exist` });
    }

    //decreale the response body
    let responsebody = {
      longUrl: longUrl,
      shortUrl: shortUrl,
      urlCode: urlCode,
    };

    //create url model in database
    const data = await urlModel.create(responsebody);
    return res.status(201).send({ status: true, msg: "url successfully created", data: data });
  }
  catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const getUrlCodes = async function (req, res) {
  try {
    const urlCode = req.params.urlCode

    if (!isValidRequestBody(urlCode)) { return res.status(400).send({ status: false, msg: "Please enter the input" }) }
    const checkUrlCode = await urlModel.findOne({ urlCode })
    if (!checkUrlCode) { return res.status(404).send({ status: false, msg: "Url does not exist in db" }) }
    if (checkUrlCode) { return res.status(302).redirect(checkUrlCode.longUrl) }

  }
  catch (err) {
    return res.status(500).send({ status: false, msg: error.message });
  }
}







module.exports.createShortUrl = createShortUrl;
module.exports.getUrlCodes = getUrlCodes;