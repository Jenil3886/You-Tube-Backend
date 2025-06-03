import { DataTypes } from "sequelize";
import { sequelize } from "../../config/sequelize.js";

const Channel = sequelize.define(
  "Channel",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    handle: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default_handle",
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bannerPicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // profilePicture: {
    //   type: DataTypes.TEXT,
    //   allowNull: true,
    // },
    // bannerPicture: {
    //   type: DataTypes.TEXT,
    //   allowNull: true,
    // },
    subscriberCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users", // Use table name string to avoid circular ref
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default Channel;
