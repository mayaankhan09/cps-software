// This file is the bridge between HTTP requests and the registration
// business logic in registration.service.js. Each function here reads the
// request, calls a service function, and sends back a JSON response.

import * as registrationService from "./registration.service.js";
import { validateRegistrationInput, validateRegistrationUpdate } from "./registration.validation.js";

// Sends an error response using the statusCode attached to the error
// (defaulting to 500 for anything unexpected).
function sendError(res, err) {
  res.status(err.statusCode || 500).json({ error: err.message });
}

export async function createRegistration(req, res) {
  const errors = validateRegistrationInput(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const registration = await registrationService.createRegistration(req.body);
    res.status(201).json(registration);
  } catch (err) {
    sendError(res, err);
  }
}

export async function listRegistrations(req, res) {
  try {
    const registrations = await registrationService.listRegistrations({ status: req.query.status });
    res.json(registrations);
  } catch (err) {
    sendError(res, err);
  }
}

export async function getRegistration(req, res) {
  try {
    const registration = await registrationService.getRegistrationById(req.params.id);
    res.json(registration);
  } catch (err) {
    sendError(res, err);
  }
}

export async function updateRegistration(req, res) {
  const errors = validateRegistrationUpdate(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const registration = await registrationService.updateRegistration(req.params.id, req.body);
    res.json(registration);
  } catch (err) {
    sendError(res, err);
  }
}

export async function approveRegistration(req, res) {
  try {
    const { registration, student } = await registrationService.approveRegistration(req.params.id);
    res.json({ registration, student });
  } catch (err) {
    sendError(res, err);
  }
}

export async function rejectRegistration(req, res) {
  try {
    const registration = await registrationService.rejectRegistration(req.params.id);
    res.json(registration);
  } catch (err) {
    sendError(res, err);
  }
}
