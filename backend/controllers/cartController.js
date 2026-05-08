const pool = require('../db');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getAllCarts = async (req, res) => {
  try {
    const [results] = await pool.promise().query('SELECT * FROM CART');
    res.json(results);
  } catch (error) {
    console.error('Error fetching carts:', error);
    res.status(500).json('Error fetching carts from the database.');
  }
};

const sendReceiptEmail = (buyerEmail, products, totalCost) => {
  // Generate the HTML receipt content
  const productDetails = products
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.NAME}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">$${item.PRICE}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">$${(item.PRICE * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const emailHtml = `
    <h2>Thank you for your purchase!</h2>
    <p>Here is your receipt:</p>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="padding: 8px; border: 1px solid #ddd;">Product Name</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Unit Price</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Total Price</th>
        </tr>
      </thead>
      <tbody>
        ${productDetails}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;">Final Total:</td>
          <td style="padding: 8px; border: 1px solid #ddd;">$${totalCost.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    <p>If you have any questions, feel free to contact us.</p>
  `;

  // Set email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: buyerEmail,
    subject: "Your Receipt - Thank you for your purchase",
    html: emailHtml,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    }
  });
};

// Checkout function
const checkout = async (req, res) => {
  const { buyerId, products } = req.body; // products = [{ productId, quantity }, ...]
  const checkoutDate = new Date();

  if (!buyerId || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: "Invalid request: missing buyerId or products." });
  }

  const invalidItem = products.find(
    (item) => !item.productId || !item.quantity || Number(item.quantity) <= 0
  );
  if (invalidItem) {
    return res.status(400).json({ error: "Each product must include a valid productId and quantity." });
  }

  let connection;
  try {
    connection = await pool.promise().getConnection();
    await connection.beginTransaction();

    const [buyerRows] = await connection.query(
      "SELECT EMAIL FROM USER WHERE USER_ID = ?",
      [buyerId]
    );
    if (buyerRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: "Buyer not found." });
    }

    const buyerEmail = buyerRows[0].EMAIL;

    const [cartResult] = await connection.query(
      "INSERT INTO CART (CHECKOUT_DATE, BUYER_ID) VALUES (?, ?)",
      [checkoutDate, buyerId]
    );
    const cartId = cartResult.insertId;

    for (const item of products) {
      await connection.query(
        "INSERT INTO CART_PRODUCT_JUNCTION (PRODUCT_ID, CART_ID, QUANTITY) VALUES (?, ?, ?)",
        [item.productId, cartId, item.quantity]
      );

      const [updateResult] = await connection.query(
        "UPDATE PRODUCT SET AVAILABLE = AVAILABLE - ? WHERE PRODUCT_ID = ? AND AVAILABLE >= ?",
        [item.quantity, item.productId, item.quantity]
      );
      if (updateResult.affectedRows === 0) {
        await connection.rollback();
        return res.status(400).json({ error: "One or more items are out of stock." });
      }
    }

    await connection.query(
      "INSERT INTO CHECK_OUT (CHECKOUT_DATE, CART_ID) VALUES (?, ?)",
      [checkoutDate, cartId]
    );

    const productIds = products.map((item) => item.productId);
    const [productResults] = await connection.query(
      "SELECT PRODUCT_ID, NAME, PRICE FROM PRODUCT WHERE PRODUCT_ID IN (?)",
      [productIds]
    );

    const detailedProducts = productResults.map((product) => {
      const item = products.find((p) => p.productId === product.PRODUCT_ID);
      return {
        ...product,
        quantity: item.quantity,
      };
    });

    const totalCost = detailedProducts.reduce(
      (sum, product) => sum + product.PRICE * product.quantity,
      0
    );

    await connection.commit();

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      sendReceiptEmail(buyerEmail, detailedProducts, totalCost);
    }

    res.status(200).json({ message: "Checkout completed successfully and receipt sent." });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Transaction error:", error.message);
    res.status(500).json(error.message);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};


module.exports = {
  getAllCarts,
  checkout
};
