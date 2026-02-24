export const rolePermission = {
  admin: ["create", "read", "update", "delete"],
  manager: ["read", "update"],
  user: ["read"],
};

interface UserList {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  contactNumber: string;
  role: string;
  password: string;
  permission: string[];
}

export const adminListToAdd: UserList[] = [
  {
    firstName: "Shreyash",
    lastName: "Salian",
    password: "Admin@123",
    userName: "ShreyashSalian",
    role: "admin",
    contactNumber: "1234567890",
    email: "shreyashsalian15@gmail.com",
    permission: rolePermission.admin,
  },
  {
    firstName: "Admin",
    lastName: "Admin",
    email: "admin123@gmail.com",
    userName: "AdminAdmin",
    password: "Admin@123",
    role: "admin",
    contactNumber: "987654321",
    permission: rolePermission.admin,
  },
  {
    firstName: "Rohit",
    lastName: "sharma",
    email: "rohit@gmail.com",
    password: "Rohit@123",
    userName: "RohitSharma",
    role: "user",
    contactNumber: "1231231231",
    permission: rolePermission.admin,
  },
  {
    firstName: "Virat",
    lastName: "Kohli",
    email: "virat23@gmail.com",
    userName: "ViratKholi",
    password: "Virat@123",
    role: "user",
    contactNumber: "987654311",
    permission: rolePermission.admin,
  },
];
