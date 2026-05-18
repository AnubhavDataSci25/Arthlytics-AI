import api from "./api";

export const chatService = {
    query: (file_id, query, top_k=5) =>
        api.post('/api/chat', {file_id, query, top_k})
}