// This file is the bridge between HTTP requests and the student business
// logic in student.service.js. Each function here reads the request, calls
// a service function, and sends back a JSON response.

import * as studentService from "./student.service.js";
import {
  validateStudentUpdate,
  validateStatusChange,
  validateResortRequest,
} from "./student.validation.js";

function sendError(res, err) {
  res.status(err.statusCode || 500).json({ error: err.message });
}

export async function listStudents(req, res) {
  try {
    const students = await studentService.listStudents({
      class: req.query.class,
      section: req.query.section,
      status: req.query.status,
    });
    res.json(students);
  } catch (err) {
    sendError(res, err);
  }
}

export async function getStudent(req, res) {
  try {
    const student = await studentService.getStudentById(req.params.id);
    res.json(student);
  } catch (err) {
    sendError(res, err);
  }
}

export async function updateStudent(req, res) {
  const errors = validateStudentUpdate(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const student = await studentService.updateStudent(req.params.id, req.body);
    res.json(student);
  } catch (err) {
    sendError(res, err);
  }
}

export async function updateStatus(req, res) {
  const errors = validateStatusChange(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const student = await studentService.updateStatus(req.params.id, req.body.status);
    res.json(student);
  } catch (err) {
    sendError(res, err);
  }
}

export async function resortRolls(req, res) {
  const errors = validateResortRequest(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const students = await studentService.resortRollNumbers(
      req.body.class,
      req.body.section ?? null,
      req.body.academicYear
    );
    res.json(students);
  } catch (err) {
    sendError(res, err);
  }
}
