'use strict';
const stockModel = require('../data-model').Stock;
const fetch = require('node-fetch');

module.exports = function (app) {

  async function getPrice(stock) {
    const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
    const { symbol, latestPrice } = await response.json();
    return { symbol, latestPrice };
  }

  async function findStock(stock) {
    return await stockModel.findOne({ symbol: stock }).exec();
  }

  function createStock(stock, like, ip) {
    if (like === 'true') {
      stockModel.create({ symbol: stock, likes: [ip] });
    } else {
      stockModel.create({ symbol: stock, likes: [] });
    }
  }

  async function updateStock(stock, like, ip) {
    let foundStock = await findStock(stock);
    if (like === 'true' && !foundStock.likes.includes(ip)) {
      foundStock.likes.push(ip);
      foundStock.save();
    }
  }

  app.route('/api/stock-prices')
    .get(async function (req, res){
      
      const { stock, like } = req.query;
      const ip = req.ip;

      if (Array.isArray(stock)) {                             ////// Two stocks ///////

        let foundStock0 = await findStock(stock[0]);
        let foundStock1 = await findStock(stock[1]);
        let gotPrice0 = await getPrice(stock[0]);
        let gotPrice1 = await getPrice(stock[1]);
        let response0, response1, rel_likes0, rel_likes1;

        if (!foundStock0 && !foundStock1) {
          rel_likes0 = 0;
          rel_likes1 = 0;
        } else if (foundStock0 && !foundStock1) {
          rel_likes0 = foundStock0.likes.length - like==='true' && !foundStock0.likes.includes(ip) ? 1 : 0;
          rel_likes1 = like==='true' && !foundStock1.likes.includes(ip) ? 1 : 0;
        } else if (!foundStock0 && foundStock1) {
          rel_likes1 = foundStock1.likes.length - like==='true' && !foundStock1.likes.includes(ip) ? 1 : 0;
          rel_likes0 = like==='true' && !foundStock0.likes.includes(ip) ? 1 : 0;
        } else {
          rel_likes0 = foundStock0.likes.length - foundStock1.likes.length;
          rel_likes1 = foundStock1.likes.length - foundStock0.likes.length;
        }

        if (!gotPrice0.symbol) {
          response0 = { rel_likes: rel_likes0 };
          if (!foundStock0) {
            createStock(stock[0], like, ip);
          } else {
            if (like==='true' && !foundStock0.likes.includes(ip)) {
              await updateStock(stock[0], like, ip);
            }
          }
        } else {
          response0 = { stock: gotPrice0.symbol, price: gotPrice0.latestPrice, rel_likes: rel_likes0 };
          if (!foundStock0) {
            createStock(stock[0], like, ip);
          } else {
            if (like==='true' && !foundStock0.likes.includes(ip)) {
              await updateStock(stock[0], like, ip);
            }
          }
        }

        if (!gotPrice1.symbol) {
          response1 = { rel_likes: rel_likes1 };
          if (!foundStock1) {
            createStock(stock[1], like, ip);
          } else {
            if (like==='true' && !foundStock1.likes.includes(ip)) {
              await updateStock(stock[1], like, ip);
            }
          }
        } else {
          response1 = { stock: gotPrice1.symbol, price: gotPrice1.latestPrice, rel_likes: rel_likes1 };
          if (!foundStock1) {
            createStock(stock[1], like, ip);
          } else {
            if (like==='true' && foundStock1.likes.includes(ip)) {
              await updateStock(stock[1], like, ip);
            }
          }
        }
        
        res.json({ stockData: [response0, response1]});


      } else {                                                 ////// One stock ///////

        let foundStock = await findStock(stock);
        let gotPrice = await getPrice(stock); 

        if (!gotPrice.symbol) {
          if (!foundStock) {
            res.json({ stockData: { likes: like==='true' ? 1 : 0 } });
            createStock(stock, like, ip);
          } else {
            if (like==='true' && !foundStock.likes.includes(ip)) {
              res.json({ stockData: { likes: foundStock.likes.length + 1 }});
            } else {
              res.json({ stockDate: { likes: foundStock.likes.length }});
            }
            await updateStock(stock, like, ip); 
          }
        } else {
          if (!foundStock) {
            res.json({ stockData: { stock: gotPrice.symbol, price: gotPrice.latestPrice, likes: like==='true' ? 1 : 0 } })
            createStock(stock, like, ip);
          } else {
            if (like==='true' && !foundStock.likes.includes(ip)) {
              res.json({ stockData: { stock: gotPrice.symbol, price: gotPrice.latestPrice, likes: foundStock.likes.length + 1 }});
            } else {
              res.json({ stockData: { stock: gotPrice.symbol, price: gotPrice.latestPrice, likes: foundStock.likes.length }});
            }
            await updateStock(stock, like, ip);
          }
        }

      }
      
    });
    
};
