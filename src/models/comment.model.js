import { DataTypes } from "sequelize";
import { sequelize } from "../../config/sequelize.js"; // adjust path as needed
import User from "./user.model.js"; // adjust path as needed
import Video from "./video.model.js"; // adjust path as needed

const Comment = sequelize.define(
  "Comment",
  {
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    videoId: {
      type: DataTypes.INTEGER,
      references: {
        model: Video,
        key: "id",
      },
    },
    ownerId: {
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

export default Comment;
