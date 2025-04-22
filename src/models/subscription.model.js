import { DataTypes } from "sequelize";
import { sequelize } from "../../config/sequelize.js"; // adjust path as needed
import User from "./user.model.js"; // adjust path as needed

const Subscription = sequelize.define(
  "Subscription",
  {
    subscriberId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    channelId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default Subscription;
