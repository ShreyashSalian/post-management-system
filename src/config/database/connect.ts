import mongoose from "mongoose";
import { addAdminUser } from "../../utils/addAdmin";

export const connectDB = async (): Promise<void> => {
  try {
    // To connect to the local or the live server----------------------------------
    // const DB =
    //   process.env.NODE_ENV === "development"
    //     ? `${process.env.LOCAL_PATH}/${process.env.DATABASE}`
    //     : `${process.env.LIVE_PATH}/${process.env.DATABASE}`;

    // const connection = await mongoose.connect(DB);

    //To connect to docker--------------------------------------------------------
    const connection = await mongoose.connect(
      `mongodb://mongodb-container:27017/${process.env.DATABASE_NAME}`,
    );
    addAdminUser();
    console.log(
      `The server is connected to the: ${connection.connection.host} database`,
    );
  } catch (err: any) {
    console.log(`Error while connecting to mongodb database : ${err}`);
    process.exit(1);
  }
};
