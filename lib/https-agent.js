const HttpsProxyAgent = require("https-proxy-agent");
const logger = require("./logger");

class HttpsAgent {
  proxyAgent = null;

  constructor() {
    const proxy = process.env.https_proxy || process.env.HTTPS_PROXY;
    
    if(proxy) {
      this.proxyAgent = new HttpsProxyAgent(proxy);
      logger(['using proxy'.bgGreen], { proxy: proxy });
    }
  }
  
  proxyEnabled() {
    return !!this.proxyAgent;
  }

  getAgent(req) {
    return this.proxyEnabled() ? this.proxyAgent : req.globalAgent;
  }
}

module.exports=new HttpsAgent();
