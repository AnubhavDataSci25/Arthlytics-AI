import api from "./api";

export const vizService = {
    generate: (file_id, query) =>
        api.post('/api/visualize', {file_id, query}),
}