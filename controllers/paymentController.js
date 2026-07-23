const Payment = require("../models/Payment");

exports.makePayment = async (req,res)=>{

const {orderId,amount,method} = req.body;

const payment = await Payment.create({
orderId,
amount,
method,
status:"Paid"
});

res.json(payment);

};
const axios = require("axios");
const crypto = require("crypto");

exports.initiateEasebuzzPayment = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const key = "YOUR_KEY";      // 🔴 replace
    const salt = "YOUR_SALT";    // 🔴 replace

    const txnid = "TXN" + Date.now();
    const productinfo = "Fuel Order";

    const name = "Customer";
    const email = "test@gmail.com";
    const phone = "9999999999";

    // 🔐 HASH GENERATION
    const hashString =
      key +
      "|" +
      txnid +
      "|" +
      amount +
      "|" +
      productinfo +
      "|" +
      name +
      "|" +
      email +
      "|||||||||||" +
      salt;

    const hash = crypto
      .createHash("sha512")
      .update(hashString)
      .digest("hex");

    const paymentData = {
      key,
      txnid,
      amount,
      productinfo,
      firstname: name,
      email,
      phone,
      surl: `http://localhost:5000/success.html`,
      furl: `http://localhost:5000/failure.html`,
      hash
    };

    const response = await axios.post(
      "https://testpay.easebuzz.in/payment/initiateLink",
      paymentData
    );

    res.json(response.data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Easebuzz error" });
  }
};