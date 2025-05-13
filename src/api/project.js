import {instance} from "./base.js";

export const my = async () => {
    const response = await instance.get("/projects/@my")

    return response.data
}

export const get = async (data) => {
    const response = await instance.get(`/project/${data.id}`)

    return response.data
}

export const create = async (data) => {
    const response = await instance.post("/project", {
        name: data.name,
        description: data.description,
        content: data.content,
    })

    return {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        content: response.data.content,
    }
}

export const update = async (data) => {
    let payload = {}

    if ("name" in data) {
        payload["name"] = data["name"]
    }

    if ("description" in data) {
        payload["description"] = data["description"]
    }

    if ("content" in data) {
        payload["content"] = data["content"]
    }

    const response = await instance.patch(`/project/${data.id}`, payload)
}

export const remove = async (data) => {

}

