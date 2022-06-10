const express = require('express')
const parser = require('body-parser')
const jwt = require('jsonwebtoken')
const axios = require('axios').default
const __ = require('lodash')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const app = express()
const port = 3000

const JWT_KEY_SECRET = '81f5217ce5f9a33491e57c03e50488edad703dc6daf3e3a35dfe08520b536f58fad553ca5681d2ab7cccf50890846e738f4232dce7abaceedca1d22e1b33faea'
const PRODUCT_URL = 'https://60c18de74f7e880017dbfd51.mockapi.io/api/v1/jabar-digital-services/product'
const CONVERSION_URL = 'https://free.currconv.com/api/v7/convert?q=USD_IDR&compact=ultra&apiKey=4e7121b9e76c66e76878'

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Fetch API",
      description: "Fetch API Information",
      contact: {
        name: "Rahman Mubarok"
      },
      servers: ["http://localhost:5000"]
    },
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        scheme: 'bearer',
        in: 'header',
      },
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ["app.js"],

}
const swaggerDocs = swaggerJsDoc(swaggerOptions)

app.use(parser.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

/**
 * @openapi
 * /fetch:
 *   get:
 *     description: Fetch product data
 *     responses:
 *       200:
 *         description: Returns product data with IDR price.
 */
app.get('/fetch', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  res.setHeader('Content-Type', 'application/json');

  if (token == null) {
    var error = 'Token required';
    return res.status(400).end(JSON.stringify({ error }));
  }

  jwt.verify(token, JWT_KEY_SECRET, async (err, _) => {
    if (err) {
      return res.status(401).end(JSON.stringify({ err }));
    }

    try {
      const converter = await fetchConverter();

      const response = await axios({
        url: PRODUCT_URL,
        method: 'get',
      });

      var data = [...response.data];

      var result = data.map(x => {
        var idr = +x['price'] * converter;

        return {
          ...x,
          priceIdr: idr.toFixed(2)
        }
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error });
    }
  });
})

/**
 * @openapi
 * /aggregation:
 *   get:
 *     description: Fetch aggregated product data
 *     responses:
 *       200:
 *         description: Returns product data grouped by department and product with IDR price sorted ascending.
 */
app.get('/aggregation', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  res.setHeader('Content-Type', 'application/json');

  if (token == null) {
    var error = 'Token required';
    return res.status(400).end(JSON.stringify({ error }));
  }

  jwt.verify(token, JWT_KEY_SECRET, async (err, user) => {
    if (err) {
      return res.status(401).end(JSON.stringify({ err }));
    }

    if (user.role !== 'admin')
      return res.status(401).end(JSON.stringify({ error: 'Unauthorized' }));

    try {
      const converter = await fetchConverter();

      const response = await axios({
        url: PRODUCT_URL,
        method: 'get',
      });

      var data = [...response.data];

      var modifiedData = data.map(x => {
        var idr = +x['price'] * converter;

        return {
          ...x,
          priceIdr: idr
        }
      });

      var departmentAggregate = __(modifiedData)
        .groupBy('department')
        .map((objs, key) => ({
          'department': key,
          'priceIdr': __.sumBy(objs, 'priceIdr')
        }))
        .value();

      var departmentSorted = __.sortBy(departmentAggregate, 'priceIdr');

      var departmentData = departmentSorted.map(x => ({
        'department': x['department'],
        'priceIdr': x['priceIdr'].toFixed(2)
      }));

      var productAggregate = __(modifiedData)
        .groupBy('product')
        .map((objs, key) => ({
          'product': key,
          'priceIdr': __.sumBy(objs, 'priceIdr')
        }))
        .value();

      var productSorted = __.sortBy(productAggregate, 'priceIdr');

      var data = productSorted.map(x => ({
        'product': x['product'],
        'priceIdr': x['priceIdr'].toFixed(2)
      }));

      var output = {
        byDepratment: departmentData,
        byProduct: data
      };

      res.status(200).json(output);
    } catch (error) {
      res.status(500).json({ error });
    }
  });
})


/**
 * @openapi
 * /validate:
 *   get:
 *     description: Validate JWT token
 *     responses:
 *       200:
 *         description: Returns token claim data.
 */
app.get('/validate', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  res.setHeader('Content-Type', 'application/json');

  if (token == null) {
    var error = 'Token required';
    return res.status(400).end(JSON.stringify({ error }));
  }

  jwt.verify(token, JWT_KEY_SECRET, (err, user) => {
    if (err) {
      return res.status(401).end(JSON.stringify({ err }));
    }

    res.status(200).end(JSON.stringify(user));
  });
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

async function fetchConverter() {
  try {
    const response = await axios({
      url: CONVERSION_URL,
      method: 'get',
    });

    const data = { ...response.data };

    return data['USD_IDR'];
  } catch (_) {
    return 14500;
  }
}