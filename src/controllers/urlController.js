
const shortid = require("shortid");
const validurl = require("valid-url");
const urlModel = require("../models/urlModel");
const { get } = require("../routes/route");
const redis =  require("redis");
const {promisify} = require("util")


const redisClient = redis.createClient(
    12877,
    "redis-12877.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    {no_ready_check:true}
)
redisClient.auth("568KEaYdilBtOnx8WWaiN14vIuCSkBDr",function(err){
    if(err) throw err
})
redisClient.on("connect",async function(){
    console.log("connected to redis")
})


const SET_ASYNC=promisify(redisClient.SET).bind(redisClient)
const GET_ASYNC=promisify(redisClient.GET).bind(redisClient)

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
  
      //long url is valid url or not checking validation
      if (!validurl.isUri(longUrl)) {
        return res.status(400).send({ status: false, message: "url invalid!" });
      }
      const cacheUrl = await GET_ASYNC(`${longUrl}`)
      const shortUrlPresent = await urlModel.findOne({longUrl}).select({shortUrl:1,_id:0})
      if(cacheUrl) return res.status(200).send({status:true,msg:shortUrlPresent})
  
      //long url already present in database or not
      const alreadyExistUrl = await urlModel.findOne({longUrl}).select({_id:0,__v:0})
      
      if (alreadyExistUrl) {
        await SET_ASYNC(`${longUrl}`,JSON.stringify(alreadyExistUrl))
        return res.status(400).send({ status: false, msg: `${longUrl}  already exist.It should be unique` });
      }
  

      //Generate Url code
      const urlCode = shortid.generate().toLowerCase();
  
      //generated Url code prent in database or not
      const alreadyExistUrlCode = await urlModel.findOne({ urlCode:urlCode });
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
        shortUrl:shortUrl,
        urlCode: urlCode,
      };
  
      //create url model in database
        await urlModel.create(responsebody);
        const data = await urlModel.findOne({longUrl}).select({_id:0,createdAt:0,updatedAt:0,__v:0})
        await SET_ASYNC(`${longUrl}`,JSON.stringify(data))
     return res.status(201).send({ status: true, msg: "url successfully created", data: data });
    }
    catch (error) {
      return res.status(500).send({ status: false, msg: error.message });
    }
  };
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const getUrlCodes = async function(req,res){
  try{
const urlCode = req.params.urlCode
if(!isValidRequestBody(urlCode)){return res.status(400).send({status:false,msg:"Please enter the input"})}
if(!shortid.isValid(urlCode)){return res.status(400).send({status:false,msg:`${urlCode} is invalid`})}
const checkUrlCode = await urlModel.findOne({urlCode})
if(!checkUrlCode){return res.status(404).send({status:false,msg:"Url does not exist in db"})}
if(checkUrlCode){return res.status(302).redirect(checkUrlCode.longUrl)}

}
catch(err){
    return res.status(500).send({ status: false, msg: error.message });
}
}







module.exports.createShortUrl = createShortUrl;
module.exports.getUrlCodes = getUrlCodes