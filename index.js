const axios = require("axios");
const EbayAuthToken = require("ebay-oauth-nodejs-client");
const marketplaceList = require("./marketplace.json");
const xss = require("xss");
const ebay = require("./ebay");

exports.handler = async (opt, context, cb) => {
  let params = opt;
  if (params?.querystring) {
    params = opt.params?.querystring;
  }
  if (params?.queryStringParameters) {
    params = params?.queryStringParameters;
  }
  let cmc = xss(params.cmc) || "uk";
  let limit = xss(params.limit) || 10;
  let id = xss(params.id) || 31388;
  let data = await ebay.results(cmc, limit, id);
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
