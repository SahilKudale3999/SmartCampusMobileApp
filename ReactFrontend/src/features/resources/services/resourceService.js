import http from "../../../lib/http";
export const list = (resource) => http.get(resource.loadPath || resource.endpoint);
export const create = (resource, body) => http.post(resource.endpoint, body);
export const update = (resource, key, body) => http.put(`${resource.endpoint}/${key}`, body);
export const remove = (resource, key) => http.delete(`${resource.endpoint}/${key}`);
export const action = (resource, key, type, value) => { if (type === "grade") return http.patch(`${resource.endpoint}/${key}/grade`, null, { params: { grade: value } }); if (type === "password") return http.put(`${resource.endpoint}/${key}/password`, value); return http.patch(`${resource.endpoint}/${key}/${type}`); };
