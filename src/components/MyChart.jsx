import { Bar } from "react-chartjs-2";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import { baseOptions, barGradient } from "./chartTheme";

/** Product preference — a ranked category comparison, so: sorted bar chart. */
const MyChart = ({ analysisData, height = 300 }) => {
  const theme = useTheme();

  // ranking is the insight, so sort descending before plotting
  const rows = [...(analysisData || [])].sort(
    (a, b) => (b.count ?? 0) - (a.count ?? 0)
  );

  const data = {
    labels: rows.map((d) => d.product),
    datasets: [
      {
        label: "Units sold",
        data: rows.map((d) => d.count),
        backgroundColor: (ctx) =>
          barGradient(
            ctx,
            theme.palette.primary.main,
            theme.palette.secondary.main
          ),
        hoverBackgroundColor: theme.palette.primary.light,
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 42,
      },
    ],
  };

  return (
    <Box sx={{ height, width: "100%" }}>
      <Bar
        options={baseOptions(theme, {
          title: "Product preference",
          legend: false,
        })}
        data={data}
        aria-label="Bar chart of units sold per product"
      />
    </Box>
  );
};

MyChart.propTypes = {
  analysisData: PropTypes.array,
  height: PropTypes.number,
};

export default MyChart;
