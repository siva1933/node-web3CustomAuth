// const fetch = (...args) => import('node-fetch')
const { Web3Auth } = require("@web3auth/node-sdk");
const { EthereumPrivateKeyProvider } = require("@web3auth/ethereum-provider");
const { Wallet } = require("ethers");
const { Bot } = require("grammy");
const { CHAIN_NAMESPACES } = require("@web3auth/base");
const jwt = require("jsonwebtoken");
const fs = require("fs");

// Use "openssl genrsa -out privateKey.pem 2048" to generate a private key
// Also, use this private key to generate a public key using "openssl rsa -in privateKey.pem -pubout -out publicKey.pem"
// Convert PEM to JWKS and expose it on a public URL, and make a web3auth verifier using that.
// Check out https://web3auth.io/docs/auth-provider-setup/byo-jwt-providers for more details.
var privateKey = fs.readFileSync("privateKey.pem");
const verifier = 'meraevents-verifier'

const clientId =
  'BAErEGsVzBeMgHUXHqMQDgV3zgrW2kmLLFLZWsje6rrIeTYDe-Tjm1KY-RP5jaFDKlktNvhi9BeD_2fghkliExs' // get from https://dashboard.web3auth.io

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: {
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0x1",
      rpcTarget: "https://rpc.ankr.com/eth",
      displayName: "Ethereum Mainnet",
      blockExplorer: "https://etherscan.io",
      ticker: "ETH",
      tickerName: "Ethereum",
    },
  },
});

// Instantiate Web3Auth Node.js SDK
const web3auth = new Web3Auth({
  clientId, // Get your Client ID from Web3Auth Dashboard
  web3AuthNetwork: "testnet",
});

// const web3auth = new Web3AuthNoModal({
// clientId,
// chainConfig,
// web3AuthNetwork: "cyan",
// });

// const privateKeyProvider = new CommonPrivateKeyProvider({
//   config: {
//     chainConfig: {
//       chainNamespace: CHAIN_NAMESPACES.OTHER,
//       chainId: 'meraevents',
//       rpcTarget: 'https://rpc.meraevents.autonomy.network/',
//     }
//   }
// });

web3auth.init({ provider: privateKeyProvider });

// const user = {
//   id: "faj2720i2fdG7NsqznOKrthDvq43", // must be unique to each user
//   name: "Mohammad Shahbaz Alam",
//   email: "shahbaz@web3auth.io",
//   profileImage: "https://avatars.githubusercontent.com/u/46641595?v=4",
// };

const connect = async (user, private) => {
  const web3authNodeprovider = await web3auth.connect({
    verifier, // e.g. `web3auth-sfa-verifier` replace with your verifier name, and it has to be on the same network passed in init().
    verifierId: user.id?.toString(), // e.g. `Yux1873xnibdui` or `name@email.com` replace with your verifier id(sub or email)'s value.
    idToken: jwt.sign(
      {
        sub: user.id?.toString(), // must be unique to each user
        name: user.username,
        aud: "urn:api.uat.autonomy.network",
        iss: "https://api.uat.autonomy.network",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      },
      privateKey,
      { algorithm: "RS256", keyid: "1bb9605c36eYXV0b25vbXk69386830202b2d" }
    ), // or replace it with your newly created unused JWT Token.
  });
  const ethPrivateKey = await web3authNodeprovider.request({ method: "eth_private_key" });
  const wallet = new Wallet(ethPrivateKey)
  // The private key returned here is the CoreKitKey
  if (private)
    return ethPrivateKey
  else return wallet.address;
};

// connect();
const bot = new Bot("6459453990:AAE4LhLSNwItXsWYQrWoJqTsY-MxRZO8Sg0");

bot.command("start", (ctx) => {
  ctx.reply("Welcome!.\n\n1.Use /privatekey to get your privatekey\n2. Use /account to get your wallet address.")
});
// Handle other messages.
bot.command("privatekey", async (ctx) => {
  const privatekey = await connect(ctx.from, true)
  ctx.reply(`Your Private Key:  ${privatekey}`)
});
bot.command("account", async (ctx) => {
  const address = await connect(ctx.from)
  ctx.reply(`Your Wallet Address: ${address}`)
});

bot.on("message", (ctx) => ctx.reply("Got another message!"));

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  console.log(e.message)
  ctx.reply("Got Error")
});

// Start the bot.
bot.start();
