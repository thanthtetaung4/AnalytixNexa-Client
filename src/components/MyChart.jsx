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

const MyChart = ({ analysisData }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Product Analysis Chart",
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
  // console.log(analysisData);
  // console.log(typeof analysisData);

  const labels = analysisData ? analysisData.map((data) => data.product) : [];

  const data = {
    labels,
    datasets: [
      {
        label: "Product Preference Analysis",
        data: analysisData ? analysisData.map((data) => data.count) : [],
        backgroundColor: "#6DAED6",
      },
    ],
  };
  return <Bar options={options} data={data} />;
};

MyChart.propTypes = {
  analysisData: PropTypes.array,
};

export default MyChart;
