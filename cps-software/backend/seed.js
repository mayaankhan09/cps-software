// This is a one-off script for adding sample data to the database so you can
// quickly try out the API without typing every field by hand. It is NOT part
// of the running server — you run it on its own with "npm run seed".

import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import Staff from "./src/modules/staff/staff.model.js";
import { createStaff } from "./src/modules/staff/staff.service.js";
import FeeStructure from "./src/modules/feeStructures/feeStructure.model.js";
import { createFeeStructure } from "./src/modules/feeStructures/feeStructure.service.js";
import Registration from "./src/modules/registrations/registration.model.js";
import * as registrationService from "./src/modules/registrations/registration.service.js";

// A small mix of staffType values (teaching/driver/office) so you can try
// out filtering by type right away.
const SAMPLE_STAFF = [
  {
    employeeName: "Anita Sharma",
    gender: "Female",
    email: "anita.sharma@example.com",
    contactNo1: "9000000001",
    medium: "English",
    staffType: "teaching",
    department: "Primary Section",
    designation: "Class Teacher",
  },
  {
    employeeName: "Rajesh Kumar",
    gender: "Male",
    email: "rajesh.kumar@example.com",
    contactNo1: "9000000002",
    medium: "Hindi",
    staffType: "teaching",
    department: "Secondary Section",
    designation: "Mathematics Teacher",
  },
  {
    employeeName: "Suresh Yadav",
    gender: "Male",
    email: "suresh.yadav@example.com",
    contactNo1: "9000000003",
    medium: "Hindi",
    staffType: "driver",
    designation: "Bus Driver",
  },
  {
    employeeName: "Priya Verma",
    gender: "Female",
    email: "priya.verma@example.com",
    contactNo1: "9000000004",
    medium: "Both",
    staffType: "office",
    department: "Administration",
    designation: "Office Assistant",
  },
];

// A couple of simple monthly-tuition-only fee structures so dues/payments
// work (built in a later phase) has something real to test against.
const SAMPLE_FEE_STRUCTURES = [
  {
    academicYear: "2026-27",
    className: "Class 9",
    components: [{ name: "Tuition", amount: 1000, frequency: "monthly" }],
    dueDayOfMonth: 10,
  },
  {
    academicYear: "2026-27",
    className: "Class 10",
    components: [{ name: "Tuition", amount: 1200, frequency: "monthly" }],
    dueDayOfMonth: 10,
  },
];

// A couple of admitted students in the classes that already have fee
// structures above, so dues generation (built in this phase) and payments
// have real students to work with right away. These go through the actual
// registration -> approval flow (the same path the real app uses) so they
// come out as proper Student records with an admission number, roll
// number, and the current academic year — not a shortcut insert.
const SAMPLE_STUDENTS = [
  {
    studentName: "Aarav Mehta",
    fatherContact1: "9000000011",
    dateOfBirth: "2012-04-15",
    class: "Class 9",
  },
  {
    studentName: "Diya Patel",
    fatherContact1: "9000000012",
    dateOfBirth: "2011-08-22",
    class: "Class 10",
  },
];

async function seedStaff() {
  console.log("Seeding staff...");

  for (const sample of SAMPLE_STAFF) {
    // Skip a sample if it looks like it was already seeded before, so
    // running this script more than once doesn't pile up duplicates.
    const existing = await Staff.findOne({ email: sample.email });
    if (existing) {
      console.log(`Skipping ${sample.employeeName} — already seeded.`);
      continue;
    }

    const staff = await createStaff(sample);
    console.log(`Created ${staff.employeeName} (employeeId ${staff.employeeId}, staffType: ${staff.staffType})`);
  }
}

async function seedFeeStructures() {
  console.log("Seeding fee structures...");

  for (const sample of SAMPLE_FEE_STRUCTURES) {
    // Skip a sample if a fee structure already exists for this exact
    // class/year/board, so running this script more than once doesn't
    // hit the unique-index conflict or pile up duplicates.
    const existing = await FeeStructure.findOne({
      className: sample.className,
      academicYear: sample.academicYear,
      board: sample.board ?? null,
    });
    if (existing) {
      console.log(`Skipping ${sample.className} (${sample.academicYear}) — already seeded.`);
      continue;
    }

    const feeStructure = await createFeeStructure(sample);
    console.log(
      `Created fee structure for ${feeStructure.className} (${feeStructure.academicYear}), monthlyTotal: ${feeStructure.monthlyTotal}`
    );
  }
}

async function seedStudents() {
  console.log("Seeding students (via the real registration -> approval flow)...");

  for (const sample of SAMPLE_STUDENTS) {
    // Skip a sample if it looks like it was already seeded before, so
    // running this script more than once doesn't pile up duplicates.
    const existing = await Registration.findOne({
      studentName: sample.studentName,
      fatherContact1: sample.fatherContact1,
    });
    if (existing) {
      console.log(`Skipping ${sample.studentName} — already seeded.`);
      continue;
    }

    const registration = await registrationService.createRegistration(sample);
    const { student } = await registrationService.approveRegistration(registration._id);
    console.log(
      `Created student ${student.studentName} (admissionNumber ${student.admissionNumber}, ` +
        `class ${student.class}, academicYear ${student.academicYear})`
    );
  }
}

async function seed() {
  await connectDB();
  console.log("Database connected.");

  await seedStaff();
  await seedFeeStructures();
  await seedStudents();

  console.log("Seeding complete.");
  await mongoose.disconnect();
}

seed();
