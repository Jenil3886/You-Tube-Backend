import { DataTypes } from "sequelize";
import { sequelize } from "../../config/sequelize.js";
import User from "./user.model.js";
import Video from "./video.model.js";
import Comment from "./comment.model.js";
import Tweet from "./tweet.model.js";

const Like = sequelize.define(
  "Like",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    videoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Video,
        key: "id",
      },
    },
    commentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Comment,
        key: "id",
      },
    },
    tweetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Tweet,
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default Like;
