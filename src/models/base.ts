import { Model } from "sequelize-typescript";

export default class BaseModel<T extends Model<T>> extends Model<T> {

}
