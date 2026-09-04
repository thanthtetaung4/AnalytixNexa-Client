import PropTypes from "prop-types";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { listAnalyses, runAnalysis } from "../api/analyses";
import { deleteDataset, listDatasets, uploadDataset } from "../api/datasets";
import { toAnalysis, toFile } from "../api/normalize";
import { FileUploadError } from "./errors";
import useAuth from "./useAuth";

export const WorkspaceContext = createContext(null);

/**
 * The signed-in user's datasets and analyses, loaded once and shared.
 *
 * Every screen shows a slice of the same two collections (the library, the
 * queue, the results, the overview KPIs), so they are fetched here rather than
 * per page — one round trip instead of four, and no page can show a count that
 * contradicts its neighbour.
 */
export const WorkspaceProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const [datasets, setDatasets] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  // Ticket for the newest in-flight refresh, so a slow earlier response cannot
  // overwrite a newer one.
  const ticket = useRef(0);

  const refresh = useCallback(
    async ({ quiet = false } = {}) => {
      if (!isAuthenticated) return;
      const mine = ++ticket.current;
      if (!quiet) setStatus((current) => (current === "ready" ? "ready" : "loading"));
      try {
        const [datasetPage, analysisPage] = await Promise.all([
          listDatasets(),
          listAnalyses(),
        ]);
        if (mine !== ticket.current) return;
        setDatasets(datasetPage?.items ?? []);
        setJobs(analysisPage?.items ?? []);
        setError(null);
        setStatus("ready");
      } catch (cause) {
        if (mine !== ticket.current) return;
        setError(cause);
        setStatus("error");
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      ticket.current += 1;
      setDatasets([]);
      setJobs([]);
      setError(null);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    refresh();
    // user id is in the deps so switching account reloads rather than showing
    // the previous account's library.
  }, [isAuthenticated, user?.id, refresh]);

  const upload = useCallback(
    async (file) => {
      if (datasets.some((dataset) => dataset.filename === file.name)) {
        // The API happily stores two files with the same name; the library UI
        // identifies them by name, so stop it here with the old error code the
        // dropzone already explains.
        throw new FileUploadError("File Already Exist", "191");
      }
      const dataset = await uploadDataset(file);
      setDatasets((previous) => [dataset, ...previous]);
      refresh({ quiet: true });
      return dataset;
    },
    [datasets, refresh]
  );

  const remove = useCallback(
    async (files) => {
      const ids = files.map((file) => file.id).filter(Boolean);
      if (ids.length === 0) return;

      const outcomes = await Promise.allSettled(ids.map(deleteDataset));
      setDatasets((previous) => previous.filter((d) => !ids.includes(d.id)));
      setJobs((previous) => previous.filter((j) => !ids.includes(j.dataset_id)));
      // Re-read the truth: anything that failed to delete comes straight back.
      await refresh({ quiet: true });

      const failure = outcomes.find((outcome) => outcome.status === "rejected");
      if (failure) throw failure.reason;
    },
    [refresh]
  );

  const analyze = useCallback(
    async (datasetId, options) => {
      const job = await runAnalysis(datasetId, options);
      await refresh({ quiet: true });
      return job;
    },
    [refresh]
  );

  const datasetsById = useMemo(
    () => new Map(datasets.map((dataset) => [dataset.id, dataset])),
    [datasets]
  );

  const analysedIds = useMemo(
    () =>
      new Set(
        jobs
          .filter((job) => job.status === "succeeded")
          .map((job) => job.dataset_id)
      ),
    [jobs]
  );

  const files = useMemo(
    () => datasets.map((dataset) => toFile(dataset, analysedIds)),
    [datasets, analysedIds]
  );

  const results = useMemo(
    () =>
      jobs
        .filter((job) => job.status === "succeeded" && job.result)
        .map((job) => toAnalysis(job, datasetsById)),
    [jobs, datasetsById]
  );

  const value = useMemo(
    () => ({
      status,
      // The API list endpoints already order newest first.
      loading: status === "idle" || status === "loading",
      error,
      datasets,
      files,
      results,
      latest: results[0] ?? null,
      readyCount: files.filter((file) => file.available).length,
      refresh,
      uploadDataset: upload,
      deleteDatasets: remove,
      analyzeDataset: analyze,
    }),
    [status, error, datasets, files, results, refresh, upload, remove, analyze]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

WorkspaceProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
