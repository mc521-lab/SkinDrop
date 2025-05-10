import axios from "axios";

export async function uploadFileToAlist(file: File, filename: string) {
    const username = import.meta.env.VITE_ALIST_USERNAME;
    const password = import.meta.env.VITE_ALIST_PASSWORD;

    const httpClient = axios.create({
        baseURL: import.meta.env.VITE_ALIST_URL,
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!username || !password || !file || !filename) {
        return [null, "输入不完整!"];
    }

    try {
        // 登录
        const loginResponse = await httpClient.post(`/api/auth/login`, {
            username: username,
            password: password,
        });

        if (!loginResponse.data?.data?.token) {
            throw new Error("登录失败: 未获取到token");
        }
        const token = loginResponse.data.data.token;

        // 上传文件
        const formData = new FormData();
        formData.append("file", file);
        formData.append("path", "/");

        const uploadResponse = await httpClient.put(`/api/fs/form`, formData, {
            headers: {
                Authorization: token,
                "Content-Type": "multipart/form-data",
                "File-Path": "/" + filename,
            },
        });

        return [uploadResponse.data, null];
    } catch (error) {
        return [null, `上传失败: ${error instanceof Error ? error.message : String(error)}`];
    }
}
