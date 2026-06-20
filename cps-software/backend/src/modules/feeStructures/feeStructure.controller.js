// This file is the bridge between HTTP requests and the fee structure
// business logic in feeStructure.service.js. Each function here reads the
// request, calls a service function, and sends back a JSON response.

import * as feeStructureService from "./feeStructure.service.js";
import {
  validateFeeStructureInput,
  validateFeeStructureUpdate,
  validateStatusChange,
} from "./feeStructure.validation.js";

function sendError(res, err) {
  res.status(err.statusCode || 500).json({ error: err.message });
}

export async function createFeeStructure(req, res) {
  const errors = validateFeeStructureInput(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const feeStructure = await feeStructureService.createFeeStructure(req.body);
    res.status(201).json(feeStructure);
  } catch (err) {
    sendError(res, err);
  }
}

export async function listFeeStructures(req, res) {
  try {
    const feeStructures = await feeStructureService.listFeeStructures({
      academicYear: req.query.academicYear,
      className: req.query.className,
      isActive: req.query.isActive,
    });
    res.json(feeStructures);
  } catch (err) {
    sendError(res, err);
  }
}

export async function getFeeStructure(req, res) {
  try {
    const feeStructure = await feeStructureService.getFeeStructureById(req.params.id);
    res.json(feeStructure);
  } catch (err) {
    sendError(res, err);
  }
}

export async function updateFeeStructure(req, res) {
  const errors = validateFeeStructureUpdate(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const feeStructure = await feeStructureService.updateFeeStructure(req.params.id, req.body);
    res.json(feeStructure);
  } catch (err) {
    sendError(res, err);
  }
}

export async function updateStatus(req, res) {
  const errors = validateStatusChange(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const feeStructure = await feeStructureService.updateActiveStatus(req.params.id, req.body.isActive);
    res.json(feeStructure);
  } catch (err) {
    sendError(res, err);
  }
}
