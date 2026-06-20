// This is a one-off script for adding sample data to the database so you can
// quickly try out the API without typing every field by hand. It is NOT part
// of the running server — you run it on its own with "npm run seed".

import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import Staff from "./src/modules/staff/staff.model.js";
import { createStaff } from "./src/modules/staff/staff.service.js";

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

async function seed() {
  await connectDB();
  console.log("Database connected. Seeding staff...");

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

  console.log("Seeding complete.");
  await mongoose.disconnect();
}

seed();
