import {instance} from "./base.js";

export const upload = async (data) => {
    const formData = new FormData();
    formData.append('file', data.file);

    const response = await instance.post("/image", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return {
        url: response.data.url
    }
}
