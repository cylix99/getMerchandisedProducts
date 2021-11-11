const axios = require("axios");
const EbayAuthToken = require("ebay-oauth-nodejs-client");
const marketplaceList = require("./marketplace.json");
const xss = require("xss");
const ebay = require("./ebay");

exports.handler = async (opt, context, cb) => {
  let params = opt;
  if (opt.params?.querystring) {
    params = opt.params?.querystring;
  }
  let cmc = xss(params.cmc) || "uk";
  let data = await ebay.results(cmc);
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
