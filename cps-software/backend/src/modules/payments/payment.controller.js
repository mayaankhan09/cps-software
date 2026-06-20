// This file is the bridge between HTTP requests and the payment business
// logic in payment.service.js. Each function here reads the request, calls
// a service function, and sends back a JSON response.

import * as paymentService from "./payment.service.js";
import { validateRecordPaymentInput, validateReverseInput } from "./payment.validation.js";

function sendError(res, err) {
  res.status(err.statusCode || 500).json({ error: err.message });
}

export async function recordPayment(req, res) {
  const errors = validateRecordPaymentInput(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const payment = await paymentService.recordPayment(req.body);
    res.status(201).json(payment);
  } catch (err) {
    sendError(res, err);
  }
}

export async function listPayments(req, res) {
  try {
    const payments = await paymentService.listPayments({
      student: req.query.student,
      mode: req.query.mode,
      status: req.query.status,
      from: req.query.from,
      to: req.query.to,
    });
    res.json(payments);
  } catch (err) {
    sendError(res, err);
  }
}

export async function getPayment(req, res) {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    res.json(payment);
  } catch (err) {
    sendError(res, err);
  }
}

export async function reversePayment(req, res) {
  const errors = validateReverseInput(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const reversal = await paymentService.reversePayment(req.params.id, req.body.reason);
    res.status(201).json(reversal);
  } catch (err) {
    sendError(res, err);
  }
}
