import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  //   `postgres://postgres:Jenil%403886@localhost:5000/youtube_staging`, // for leptop on jenil gajera
  { logging: false }
);

export { sequelize };
