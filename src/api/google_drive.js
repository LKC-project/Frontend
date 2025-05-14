import {instance} from "./base.js";

export const uploadProject = async (data) => {
    const response = await instance.post("/google-drive/project", {
        access_token: data.access_token,
        project: data.project,
    })

    return {
        file_name: response.data.file_name
    }
}
