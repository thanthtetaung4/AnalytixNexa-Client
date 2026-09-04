import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  BarController,
  LineController,
  PieController,
  DoughnutController,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  // Arc + the pie/doughnut controllers: the AI provider may ask for a share-of-
  // total chart, which the bar-only registration could not draw.
  ArcElement,
  BarController,
  LineController,
  PieController,
  DoughnutController,
  Filler,
  Title,
  Tooltip,
  Legend
);

/**
 * Categorical series colours — identity, not magnitude.
 *
 * Four slots, assigned in fixed order and never cycled: a fifth series folds
 * into "Other" instead of getting a generated hue, because a repeated colour
 * means two different things look like one thing.
 *
 * These are not the brand ramp steps. They were searched for and verified with
 * a colour-vision validator, all-pairs (not just neighbours), against each
 * mode's own chart surface: every pair clears the lightness band, the chroma
 * floor, the normal-vision separation floor and 3:1 contrast. Slot 1 is pinned
 * to the brand indigo so the primary series still reads as the product's
 * colour. Six-slot and five-slot sets were tried first — neither can be made
 * all-pairs safe at these lightnesses, which is why the cap is four.
 *
 * The dark set's teal/rose pair sits at deuteranopic ΔE 6.6, inside the floor
 * band that is only legal alongside a second cue — hence the always-on legend
 * for two or more series and the surface gap between adjacent marks below.
 * Re-verify with the validator before changing any value here.
 */
export const SERIES_COLORS = {
  light: ["#4460E8", "#BE4D77", "#AD6800", "#0087AB"],
  dark: ["#6E89F5", "#C85E83", "#B27923", "#1E97A5"],
};

/** Colour for series/slice `index`, in fixed order. */
export const seriesColor = (theme, index) => {
  const ramp = SERIES_COLORS[theme.palette.mode] ?? SERIES_COLORS.dark;
  return ramp[index % ramp.length];
};

export const MAX_SERIES_COLORS = SERIES_COLORS.light.length;

/**
 * Shared Chart.js styling derived from the MUI theme, so charts inherit the
 * glass palette and typography instead of carrying their own hardcoded blues.
 */
export const chartFont = {
  family:
    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

/** Vertical gradient fill for bars — falls back to a flat colour off-canvas. */
export const barGradient = (ctx, from, to) => {
  const { chart } = ctx;
  const { ctx: c, chartArea } = chart;
  if (!chartArea) return from;
  const g = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  g.addColorStop(0, to);
  g.addColorStop(1, from);
  return g;
};

export const baseOptions = (
  theme,
  { title, horizontal = false, legend = true } = {}
) => {
  const grid = theme.palette.mode === "dark"
    ? "rgba(255,255,255,0.06)"
    : "rgba(15,23,42,0.07)";
  const tick = theme.palette.text.secondary;

  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? "y" : "x",
    layout: { padding: { top: 4, right: 8, bottom: 0, left: 0 } },
    interaction: { mode: "index", intersect: false },
    animation: { duration: 700, easing: "easeOutQuart" },
    plugins: {
      legend: {
        // a single-series legend just repeats the chart title
        display: legend,
        position: "top",
        align: "end",
        labels: {
          color: tick,
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 7,
          boxHeight: 7,
          padding: 14,
          font: { ...chartFont, size: 11, weight: "600" },
        },
      },
      title: title
        ? {
            display: true,
            text: title,
            align: "start",
            color: theme.palette.text.primary,
            font: { ...chartFont, size: 13, weight: "600" },
            padding: { bottom: 14 },
          }
        : { display: false },
      tooltip: {
        backgroundColor:
          theme.palette.mode === "dark" ? "#131829" : "#1B2440",
        borderColor: theme.palette.glass.borderStrong,
        borderWidth: 1,
        titleColor: "#FFFFFF",
        bodyColor: "rgba(255,255,255,0.82)",
        titleFont: { ...chartFont, size: 12, weight: "600" },
        bodyFont: { ...chartFont, size: 12 },
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: { display: horizontal, color: grid, drawBorder: false },
        border: { display: false },
        ticks: {
          color: tick,
          font: { ...chartFont, size: 11 },
          maxRotation: 0,
          autoSkipPadding: 12,
          callback(value) {
            const label = this.getLabelForValue(value);
            return typeof label === "string" && label.length > 18
              ? `${label.slice(0, 17)}…`
              : label;
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: { display: !horizontal, color: grid, drawBorder: false },
        border: { display: false },
        ticks: {
          color: tick,
          font: { ...chartFont, size: 11 },
          precision: 0,
          padding: 6,
        },
      },
    },
  };
};
