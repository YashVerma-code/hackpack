import UserModel from "../models/user.model.js";
import connectDB from "../lib/dbconnect.js";

// Create user
export async function createUser(payload) {
  try {
    await connectDB();

    const userData = {
      clerkId: payload.id,
      email: (payload.email_addresses && payload.email_addresses[0]?.email_address) || "",
      username: payload.username || "",
      photo: payload.profile_image_url || "",
      firstName: payload.first_name || "",
      lastName: payload.last_name || "",
    };

    const newUser = await UserModel.create(userData);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Update user
export async function updateUser(payload) {
  try {
    await connectDB();

    const updatedUser = await UserModel.findOneAndUpdate(
      { clerkId: payload.id },
      {
        email: (payload.email_addresses && payload.email_addresses[0]?.email_address) || "",
        username: payload.username || "",
        photo: payload.profile_image_url || "",
        firstName: payload.first_name || "",
        lastName: payload.last_name || "",
      },
      { new: true }
    );

    return updatedUser ? JSON.parse(JSON.stringify(updatedUser)) : null;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Delete user
export async function deleteUser(payload) {
  try {
    await connectDB();
    await UserModel.findOneAndDelete({ clerkId: payload.id });
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
