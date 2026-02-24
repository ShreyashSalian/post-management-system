import { UserModel } from "../models/user.model";
import { adminListToAdd } from "./adminUserList";

export const addAdminUser = async (): Promise<void> => {
  try {
    for (let user of adminListToAdd) {
      const userExist = await UserModel.findOne({
        $or: [
          {
            email: user?.email,
          },
          {
            userName: user?.userName,
          },
        ],
      });
      if (!userExist) {
        const userCreation = await UserModel.create({
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          permission: user?.permission,
          role: user?.role,
          contactNumber: user?.contactNumber,
          password: user?.password,
          userName: user?.userName,
          isEmailVerified: true,
        });
        console.log(
          `The admin user ${user.firstName} ${user.lastName} has been added successfully.`,
        );
      }
    }
  } catch (err: any) {
    console.log(err);
  }
};
