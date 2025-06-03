import Video from "./video.model.js";
import Channel from "./Channel.model.js";
import User from "./user.model.js";
import Comment from "./comment.model.js";

Channel.hasMany(Video, { as: "videos", foreignKey: "channelId" });
Video.belongsTo(Channel, { as: "channel", foreignKey: "channelId" });

User.hasMany(Video, { as: "videos", foreignKey: "ownerId" });
Video.belongsTo(User, { as: "owner", foreignKey: "ownerId" });

Comment.belongsTo(User, { as: "owner", foreignKey: "ownerId" });
User.hasMany(Comment, { as: "comments", foreignKey: "ownerId" });

export { Video, Channel, User, Comment };
