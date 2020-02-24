import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import sequelizeConfig from '../sequelizeConfig';
const environment = process.env.NODE_ENV || 'development';
const config = sequelizeConfig[environment];
const basename = path.basename(module.filename);
const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// reading in the types of models to initialize sequelize with
fs
  .readdirSync(__dirname)
  .filter((file) =>
    (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  )
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
