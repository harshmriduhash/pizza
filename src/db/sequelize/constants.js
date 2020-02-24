const environment = process.env.NODE_ENV || 'development';
import sequelizeConfig from './sequelizeConfig';
const config = sequelizeConfig[environment];

export const db = `${config.dialect}://${config.username}:${config.password}@${config.host}/${config.database}`;

export default {
  db,
};
