import Environment from "../environment";
import { createConnection } from "typeorm";

// @ts-ignore
createConnection({ ...Environment.config.get("typeorm") });
