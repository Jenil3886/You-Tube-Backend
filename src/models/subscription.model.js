import { DataTypes } from "sequelize";
import { sequelize } from "../../config/sequelize.js"; // adjust path as needed
import User from "./user.model.js"; // adjust path as needed
import Channel from "./Channel.model.js"; // add this import

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
        model: Channel, // FIX: reference Channel, not User
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default Subscription;
