import express from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
import { createUser, updateUser, deleteUser } from "../actions/user.actions.js";

const router = express.Router();

router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const evt = await verifyWebhook(req);

      const eventType = evt.type;
      const data = evt.data;

      switch (eventType) {
        case "user.created":
          await createUser(data);
          console.log("User created (webhook):", data.id);
          break;

        case "user.updated":
          await updateUser(data);
          console.log("User updated (webhook):", data.id);
          break;

        case "user.deleted":
          await deleteUser(data);
          console.log("User deleted (webhook):", data.id);
          break;

        default:
          console.log(`Unhandled Clerk event type: ${eventType}`);
      }

      return res.status(200).send("Webhook received");
    } catch (err) {
      console.error("Error verifying Clerk webhook:", err);
      return res.status(400).send("Error verifying webhook");
    }
  }
);

export default router;
