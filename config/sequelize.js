import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/you_tube`
);

export { sequelize }; // Export sequelize instance
