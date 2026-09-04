import { useMemo } from "react";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import { Box, Typography } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import PropTypes from "prop-types";

import {
  MAX_SERIES_COLORS,
  baseOptions,
  barGradient,
  seriesColor,
} from "./chartTheme";

/**
 * Renders one `ChartSpec` from the API.
 *
 * The AI provider decides which cut of the data carries the finding and returns
 * a chart spec for it — kind, labels, series, and an optional one-line reading.
 * Only the engine that ran the analysis knows what is worth drawing, so the
 * choice belongs there; this component's job is to draw it faithfully and to
 * refuse to draw something misleading.
 *
 * Three rules it enforces locally, because a chart that is wrong is worse than
 * one that is missing:
 *
 *  - **Never two y-axes.** A second scale on the right makes any two series
 *    look correlated at whatever zoom the axes happen to pick.
 *  - **Never a flattened series either.** Honouring one axis while plotting
 *    revenue in the tens of thousands against an order count in the hundreds
 *    pins the smaller series to the baseline. Series whose magnitudes are too
 *    far apart are split into stacked charts, one scale each — the honest
 *    version of what a dual axis was trying to show.
 *  - **Never a cycled colour.** Beyond four series the tail folds into a single
 *    "Other" series rather than reusing a hue, so two entities never share a
 *    colour. Pie slices fold the same way.
 */

const CHART_COMPONENT = {
  bar: Bar,
  horizontal_bar: Bar,
  line: Line,
  area: Line,
  pie: Pie,
  doughnut: Doughnut,
};

const isRound = (kind) => kind === "pie" || kind === "doughnut";

/**
 * Above this ratio between the largest series and the smallest, one shared
 * axis cannot show both. Eight is forgiving enough to keep a genuine
 * comparison together (two products, one twice the other) and strict enough to
 * catch a measure mismatch (revenue against a count).
 */
const SCALE_SPLIT_RATIO = 8;

const peak = (series) =>
  Math.max(0, ...series.data.map((v) => Math.abs(Number(v) || 0)));

/**
 * Group series that share a scale.
 *
 * Sorted by magnitude, then cut wherever the next series is more than
 * `SCALE_SPLIT_RATIO` smaller than the largest in the current group. One group
 * back means one chart, which is the common case.
 */
const groupByScale = (series) => {
  if (series.length < 2) return [series];

  const sorted = [...series].sort((a, b) => peak(b) - peak(a));
  const groups = [[sorted[0]]];

  for (const entry of sorted.slice(1)) {
    const current = groups[groups.length - 1];
    const largest = peak(current[0]);
    const mine = peak(entry);
    // A zero-valued series has no scale of its own; keep it with the group it
    // was found in rather than giving it a chart of its own.
    if (mine === 0 || largest === 0 || largest / mine <= SCALE_SPLIT_RATIO) {
      current.push(entry);
    } else {
      groups.push([entry]);
    }
  }
  return groups;
};

/** Fold everything past the palette into one "Other" bucket. */
const foldTail = (entries) => {
  if (entries.length <= MAX_SERIES_COLORS) return entries;
  const kept = entries.slice(0, MAX_SERIES_COLORS - 1);
  const tail = entries.slice(MAX_SERIES_COLORS - 1);
  return [
    ...kept,
    {
      label: `Other (${tail.length})`,
      data: tail[0].data.map((_, i) =>
        tail.reduce((total, entry) => total + (Number(entry.data[i]) || 0), 0)
      ),
    },
  ];
};

/** Same fold, over the single series of a pie: labels are the categories. */
const foldSlices = (labels, values) => {
  if (labels.length <= MAX_SERIES_COLORS) return { labels, values };
  const keep = MAX_SERIES_COLORS - 1;
  const tail = values.slice(keep);
  return {
    labels: [...labels.slice(0, keep), `Other (${tail.length})`],
    values: [...values.slice(0, keep), tail.reduce((a, b) => a + b, 0)],
  };
};

const AiChart = ({ spec, height = 280 }) => {
  const theme = useTheme();

  const panels = useMemo(() => {
    const kind = CHART_COMPONENT[spec?.kind] ? spec.kind : "bar";
    const Chart = CHART_COMPONENT[kind];
    const surface = theme.palette.background.paper;

    const rawSeries = (spec?.series ?? []).filter((s) => (s?.data ?? []).length > 0);
    const labels = (spec?.labels ?? []).map(String);

    if (isRound(kind)) {
      // A pie shows one series as a share of the whole; extra series have no
      // meaning here, so the first one is the chart.
      const { labels: sliceLabels, values } = foldSlices(
        labels,
        (rawSeries[0]?.data ?? []).map(Number)
      );
      const options = baseOptions(theme, { title: spec.title, legend: true });
      return [
        {
          key: "slices",
          Component: Chart,
          describedBy: `${kind === "pie" ? "Pie" : "Doughnut"} chart: ${spec.title}`,
          data: {
            labels: sliceLabels,
            datasets: [
              {
                label: rawSeries[0]?.label ?? "Share",
                data: values,
                backgroundColor: sliceLabels.map((_, i) => seriesColor(theme, i)),
                // A 2px ring in the surface colour keeps touching slices from
                // bleeding into one shape.
                borderColor: surface,
                borderWidth: 2,
                hoverOffset: 6,
              },
            ],
          },
          // Category axes are meaningless on an arc chart, and chart.js will
          // happily try to draw them.
          options: { ...options, scales: {}, cutout: kind === "doughnut" ? "58%" : undefined },
        },
      ];
    }

    const horizontal = kind === "horizontal_bar";
    const groups = groupByScale(rawSeries);
    // Colour follows the entity, not its position in a group — so the index is
    // taken from the whole spec, and splitting a chart never repaints a series.
    const colorOf = (entry) => seriesColor(theme, rawSeries.indexOf(entry));

    return groups.map((group, groupIndex) => {
      const series = foldTail(group);
      const multi = series.length > 1;
      // A split chart is titled by its series; the spec's title heads the first.
      const title =
        groups.length === 1
          ? spec.title
          : groupIndex === 0
          ? spec.title
          : series.map((s) => s.label).join(" · ");

      const datasets = series.map((entry) => {
        const tone = colorOf(entry) ?? seriesColor(theme, 0);
        if (kind === "line" || kind === "area") {
          return {
            label: entry.label,
            data: entry.data.map(Number),
            borderColor: tone,
            backgroundColor: kind === "area" ? alpha(tone, 0.18) : tone,
            fill: kind === "area",
            borderWidth: 2,
            tension: 0.32,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: tone,
            // Ring the markers in the surface colour so overlapping series
            // stay countable where lines cross.
            pointBorderColor: surface,
            pointBorderWidth: 2,
          };
        }
        return {
          label: entry.label,
          data: entry.data.map(Number),
          // A single series keeps the brand gradient the rest of the app uses;
          // several series need flat, identifiable hues instead.
          backgroundColor: multi
            ? tone
            : (ctx) =>
                barGradient(
                  ctx,
                  theme.palette.primary.main,
                  theme.palette.secondary.main
                ),
          hoverBackgroundColor: multi ? alpha(tone, 0.82) : theme.palette.primary.light,
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 40,
          // 2px of surface between neighbours, so adjacent bars read as
          // separate marks rather than one striped block.
          borderColor: surface,
          borderWidth: { top: 0, right: 1, bottom: 0, left: 1 },
        };
      });

      const options = baseOptions(theme, {
        title,
        horizontal,
        // Identity is never colour-alone: two or more series always get a legend.
        legend: multi,
      });
      // Values here are money and counts, not indices — the shared default
      // rounds ticks to whole numbers, which is right for a count and wrong
      // for a mean. Let chart.js choose.
      const valueAxis = horizontal ? options.scales.x : options.scales.y;
      delete valueAxis.ticks.precision;

      return {
        key: series.map((s) => s.label).join("|") || `group-${groupIndex}`,
        Component: Chart,
        describedBy: `${horizontal ? "Horizontal bar" : kind} chart: ${title}`,
        data: { labels, datasets },
        options,
      };
    });
  }, [spec, theme]);

  if (!spec?.labels?.length || !spec?.series?.length) return null;

  return (
    <Box>
      {spec.subtitle && (
        <Typography
          variant="caption"
          sx={{ display: "block", color: "text.secondary", mb: 1 }}
        >
          {spec.subtitle}
        </Typography>
      )}

      {panels.map(({ key, Component, data, options, describedBy }, index) => (
        <Box
          key={key}
          sx={{
            height,
            width: "100%",
            mt: index > 0 ? 2 : 0,
          }}
        >
          <Component data={data} options={options} aria-label={describedBy} />
        </Box>
      ))}

      {panels.length > 1 && (
        <Typography
          variant="caption"
          sx={{ display: "block", mt: 1, color: "text.disabled" }}
        >
          Plotted separately: these measures are on different scales, and one
          shared axis would flatten the smaller of them.
        </Typography>
      )}

      {/* The provider's own reading of the chart. Worth more than an axis
          label: it says why this cut of the data was drawn at all. */}
      {spec.insight && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 1.5,
            pl: 1.25,
            borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.45)}`,
            color: "text.secondary",
            lineHeight: 1.55,
          }}
        >
          {spec.insight}
        </Typography>
      )}
    </Box>
  );
};

AiChart.propTypes = {
  /** An API `ChartSpec`: `{ kind, title, subtitle, labels, series, insight }`. */
  spec: PropTypes.shape({
    kind: PropTypes.string,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    insight: PropTypes.string,
    labels: PropTypes.arrayOf(PropTypes.string),
    series: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        data: PropTypes.arrayOf(PropTypes.number),
      })
    ),
  }),
  height: PropTypes.number,
};

export default AiChart;
