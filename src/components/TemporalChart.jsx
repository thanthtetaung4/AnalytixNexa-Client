import { Bar } from "react-chartjs-2";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import { baseOptions, barGradient } from "./chartTheme";

/** Sales for one month, broken down by product. */
const TemporalChart = ({ analysisData, height = 300 }) => {
  const theme = useTheme();
  const rows = analysisData?.monthly_sale ?? [];

  const data = {
    labels: rows.map((d) => d.product),
    datasets: [
      {
        label: `Sales — ${analysisData?.month ?? ""}`,
        data: rows.map((d) => d.sale),
        backgroundColor: (ctx) =>
          barGradient(
            ctx,
            theme.palette.secondary.main,
            theme.palette.info.main
          ),
        hoverBackgroundColor: theme.palette.secondary.main,
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 42,
      },
    ],
  };

  const options = baseOptions(theme, {
    title: `Sales — ${analysisData?.month ?? "period"}`,
    legend: false,
  });

  // unit price is context, not a second axis — surface it in the tooltip
  options.plugins.tooltip.callbacks = {
    afterBody: (items) => {
      const row = rows[items[0]?.dataIndex];
      return row?.unit_price !== undefined
        ? `Unit price: ${row.unit_price}`
        : "";
    },
  };

  return (
    <Box sx={{ height, width: "100%" }}>
      <Bar
        options={options}
        data={data}
        aria-label={`Bar chart of sales per product for ${
          analysisData?.month ?? "the period"
        }`}
      />
    </Box>
  );
};

TemporalChart.propTypes = {
  analysisData: PropTypes.any,
  height: PropTypes.number,
};

export default TemporalChart;
