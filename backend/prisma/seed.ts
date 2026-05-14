import bcrypt from "bcryptjs";
import { PrismaClient, RoleName } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const departments = [
    ["HR", "People operations and company policies"],
    ["Finance", "Budgets, invoices, and approvals"],
    ["IT", "Infrastructure, security, and support"],
    ["Marketing", "Campaigns, content, and brand"],
    ["Operations", "Processes, vendors, and execution"]
  ];

  for (const [name, description] of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name, description }
    });
  }

  const it = await prisma.department.findUniqueOrThrow({ where: { name: "IT" } });
  const ops = await prisma.department.findUniqueOrThrow({ where: { name: "Operations" } });
  const hash = await bcrypt.hash("Admin123!", 12);

  const users = [
    { name: "System Admin", email: "admin@company.com", role: RoleName.ADMIN, departmentId: it.id },
    { name: "Team Manager", email: "manager@company.com", role: RoleName.MANAGER, departmentId: ops.id },
    { name: "Employee Demo", email: "employee@company.com", role: RoleName.EMPLOYEE, departmentId: ops.id }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, passwordHash: hash }
    });
  }

  for (const role of [RoleName.ADMIN, RoleName.MANAGER, RoleName.EMPLOYEE]) {
    for (const resource of ["users", "files", "messages", "departments", "analytics"]) {
      await prisma.permission.create({
        data: {
          role,
          resource,
          canRead: true,
          canCreate: role !== RoleName.EMPLOYEE || resource !== "users",
          canUpdate: role !== RoleName.EMPLOYEE,
          canDelete: role === RoleName.ADMIN
        }
      });
    }
  }
}

main().finally(async () => prisma.$disconnect());
