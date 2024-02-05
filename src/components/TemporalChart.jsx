import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import PropTypes from "prop-types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TemporalChart = ({ analysisData }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Temporal Analysis Chart",
      },
    },
    scales: {
      y: {
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  console.log(analysisData.monthly_sale);
  console.log(typeof analysisData);

  const labels = analysisData.monthly_sale?.map(
    (data) => data.product + " unit price:" + data.unit_price * 100
  );

  const data = {
    labels,
    datasets: [
      {
        label: analysisData.month,
        data: analysisData.monthly_sale?.map((data) => data.sale),
        backgroundColor: "#6DAED6",
      },
    ],
  };
  return <Bar options={options} data={data} />;
};

TemporalChart.propTypes = {
  analysisData: PropTypes.any,
};

export default TemporalChart;
