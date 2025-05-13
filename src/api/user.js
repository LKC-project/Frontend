import {instance} from "./base.js";

export const me = async () => {
    return (await instance.get("/user/@me")).data
}
