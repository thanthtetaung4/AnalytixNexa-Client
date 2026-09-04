/** Dataset upload and inspection. */

import { request } from "./client";

/** The API paginates; the UI shows the whole library, so ask for one big page. */
export const listDatasets = ({ limit = 200, offset = 0 } = {}) =>
  request(`/datasets?limit=${limit}&offset=${offset}`);

export const uploadDataset = (file) => {
  const formData = new FormData();
  formData.append("file", file, file.name);
  return request("/datasets", { method: "POST", formData });
};

export const readDataset = (datasetId) => request(`/datasets/${datasetId}`);

export const previewDataset = (datasetId, rows = 20) =>
  request(`/datasets/${datasetId}/preview?rows=${rows}`);

export const deleteDataset = (datasetId) =>
  request(`/datasets/${datasetId}`, { method: "DELETE" });
