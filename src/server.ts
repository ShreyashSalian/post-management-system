import "dotenv/config"; // ✅ FIRST LINE
import app from "./app";

import cluster from "cluster";
import os from "os";
import { connectDB } from "./config/database/connect";

const PORT: string | number | undefined = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`The application is connected to : http://localhost:${PORT}`);
    });
  })
  .catch((err: any) => {
    console.log(
      `Error while connecting to the database from the server file. ${err}`,
    );
  });
// if (cluster.isMaster) {
//   const numCPUs = os.cpus().length; // Number of CPU cores
//   console.log(`Master process ${process.pid} is running`);
//   console.log(`Forking ${numCPUs} workers...`);

//   // Fork workers
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   // Restart worker if it crashes
//   cluster.on("exit", (worker, code, signal) => {
//     console.log(`Worker ${worker.process.pid} died. Restarting...`);
//     cluster.fork();
//   });
// } else {
//   // Worker processes
//   connectDB()
//     .then(() => {
//       // Add routes
//       app.listen(PORT, () => {
//         console.log(
//           `Worker ${process.pid} started. App running on http://localhost:${PORT}`,
//         );
//       });
//     })
//     .catch((err) => {
//       console.log(`Error while connecting to DB: ${err}`);
//     });
// }
