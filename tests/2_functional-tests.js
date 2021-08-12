const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    // Viewing one stock: GET request to /api/stock-prices/
    // Viewing one stock and liking it: GET request to /api/stock-prices/
    // Viewing the same stock and liking it again: GET request to /api/stock-prices/
    // Viewing two stocks: GET request to /api/stock-prices/
    // Viewing two stocks and liking them: GET request to /api/stock-prices/

    suite('function tests FCC', function() {
        test('Viewing one stock: GET request to /api/stock-prices/', function(done) {
            chai.request(server)
                .get('/api/stock-prices')
                .query({ stock: "GOOG" })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.stockData.stock, 'GOOG');
                    assert.equal(res.body.stockData.likes, 0);
                    assert.exists(res.body.stockData.price, 'Found a price for stock!');
                    done();
                })
        })
        test('Viewing one stock and liking it: GET request to /api/stock-prices/', function(done) {
            chai.request(server)
                .get('/api/stock-prices/')
                .query({ stock: 'GOOG', like: 'true'})
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.stockData.stock, 'GOOG');
                    assert.equal(res.body.stockData.likes, 1);
                    assert.exists(res.body.stockData.price, 'Found a price for stock!');
                    done();
                })
        })
        test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function(done) {
            chai.request(server)
                .get('/api/stock-prices/')
                .query({ stock: 'GOOG', like: 'true'})
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.stockData.stock, 'GOOG');
                    assert.equal(res.body.stockData.likes, 1);
                    assert.exists(res.body.stockData.price, 'Found a price for stock!');
                    done();
                })
        })
        test('Viewing two stocks: GET request to /api/stock-prices/', function(done) {
            chai.request(server)
                .get('/api/stock-prices/')
                .query({ stock: ['AAPL', 'TSLA']})
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.stockData[0].stock, 'AAPL');
                    assert.equal(res.body.stockData[1].stock, 'TSLA');
                    assert.equal(res.body.stockData[0].rel_likes, 0);
                    assert.equal(res.body.stockData[1].rel_likes, 0);
                    done();
                })
        })
        test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function(done) {
            chai.request(server)
                .get('/api/stock-prices/')
                .query({ stock: ['AAPL', 'TSLA'], like: 'true'})
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.stockData[0].stock, 'AAPL');
                    assert.equal(res.body.stockData[1].stock, 'TSLA');
                    assert.equal(res.body.stockData[0].rel_likes, 0);
                    assert.equal(res.body.stockData[1].rel_likes, 0);
                    done();
                })
        })
        
    })
});
