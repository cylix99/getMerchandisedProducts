const axios = require("axios");
const EbayAuthToken = require("ebay-oauth-nodejs-client");
const marketplaceList = require("./marketplace.json");

const ebayAuthToken = new EbayAuthToken({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: "",
});

const getAppToken = async () => {
  try {
    const token = await ebayAuthToken.getApplicationToken(
      "PRODUCTION",
      "https://api.ebay.com/oauth/api_scope/buy.marketing"
    );

    return token && JSON.parse(token);
  } catch (error) {
    console.error(error);
  }
};

let token = null;

async function results(cmc, limit) {
  let cached = true;
  let today = new Date();
  if (token === null || (token.created && token.created !== today.getHours())) {
    cached = false;
    token = await getAppToken();
    token.created = today.getHours();
  }

  let marketPlaceDetails = await getMarketplaceDetails(cmc);

  if (token) {
    let url = `https://api.ebay.com/buy/marketing/v1_beta/merchandised_product?metric_name=BEST_SELLING&category_id=31388&limit=${limit}`;

    let affiliateReferenceId = marketPlaceDetails.EbayAffiliateCampaignIdVs;

    let requestConfig = {
      method: "GET",
      url,
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
        "X-EBAY-C-MARKETPLACE-ID": marketPlaceDetails.EbayMarketplaceId,
        "X-EBAY-C-ENDUSERCTX": `affiliateCampaignId=${affiliateReferenceId},affiliateReferenceId=${affiliateReferenceId}`,
      },
    };

    try {
      let apiResponse = await axios(requestConfig);
      if (apiResponse.data) {
        return apiResponse.data;
      }
    } catch (error) {
      console.error(error);
      return error.response;
    }
  } else {
    return "no Token";
  }
}

const getMarketplaceDetails = (cmc) =>
  new Promise((resolve, reject) => {
    if (isUndefined(cmc)) {
      // set US as default
      let marketPlaceDetail = marketplaceList.Marketplace.filter(
        (x) => x.Cmc === "uk"
      )[0];
      resolve(marketPlaceDetail);
    } else {
      let marketPlaceDetail = marketplaceList.Marketplace.filter(
        (x) => x.Cmc === cmc.toLowerCase()
      )[0];

      if (isUndefined(marketPlaceDetail)) reject("Invalid Marketplace Value.");
      resolve(marketPlaceDetail);
    }
  });
const isUndefined = (value) => typeof value === "undefined";

module.exports = { results };
