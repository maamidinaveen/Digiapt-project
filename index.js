const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "productDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//api to create a product table

app.get("/create/table/", async (request, response) => {
  const createTableQuery = `CREATE TABLE product(
        product_id INTEGER, product_name TEXT, product_category TEXT, image_url TEXT, product_description TEXT
    )`;
  const createTable = await db.run(createTableQuery);
  response.send("Table created successfully");
});

//api to fetch a product by product id

app.get("/product/:productId/", async (request, response) => {
  const { productId } = request.params;
  const productQuery = `select * from product where product_id=${productId};`;
  const product = await db.get(productQuery);
  response.send(product);
});

//api to fetch all products with filters and pagination

app.get("/products/", async (request, response) => {
  const {
    page = 0,
    pageSize = 1,
    productName = "",
    category = "",
  } = request.query;
  const getProductsQuery = `select * from product where product_name like '${productName}' and product_category like '${category}'
  limit ${pageSize} offset ${page};`;

  const productArray = await db.all(getProductsQuery);
  response.send(productArray);
});

//api to delete a product by id

app.delete("/product/:productId", async (request, response) => {
  const { productId } = request.params;
  const deleteQuery = `delete from product where product_id=${productId};`;
  db.run(deleteQuery);
  response.send("Product Deleted Successfully");
});

//api to add a product

app.post("/add/product/", async (request, response) => {
  const productDetails = request.body;
  const {
    id,
    productName,
    productCategory,
    imageUrl,
    productDescription,
  } = productDetails;

  addProductQuery = `insert into product(product_id,product_name,product_category,image_url,product_description)
  values(
      ${id},
      '${productName}',
      '${productCategory}',
      '${imageUrl}',
      '${productDescription}'
  );`;

  const dbResponse = await db.run(addProductQuery);
  const productId = dbResponse.lastID;
  response.send({ productId: productId });
});
