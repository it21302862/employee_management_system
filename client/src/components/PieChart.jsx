import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

const PieChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchMonthlySummary = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/attendance/dash-monthly-summary",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { totalHours, totalMinutes } = res.data;

        const totalTimeString = `${totalHours} hrs ${totalMinutes} mins`;
        const totalDecimalHours = totalHours + totalMinutes / 60;

        const chartData = [
          {
            id: "TotalTime",
            label: totalTimeString,
            value: totalDecimalHours,
          },
          {
            id: "Remaining",
            label: "Remaining",
            value: Math.max(1200 - totalDecimalHours, 0), 
          },
        ];

        setData(chartData);
      } catch (err) {
        console.error("Error fetching pie chart data:", err);
      }
    };

    fetchMonthlySummary();
  }, []);

  return (
    <ResponsivePie
      data={data}
      colors={({ id }) =>
        id === "TotalTime" ? "#3f51b5" : "#bdbdbd"
      }
      theme={{
        axis: {
          domain: { line: { stroke: colors.grey[100] } },
          legend: { text: { fill: colors.grey[100] } },
          ticks: {
            line: { stroke: colors.grey[100], strokeWidth: 1 },
            text: { fill: colors.grey[100] },
          },
        },
        legends: { text: { fill: colors.grey[100] } },
      }}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={colors.grey[100]}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      enableArcLabels={true}
      arcLabelsRadiusOffset={0.4}
      arcLabelsSkipAngle={7}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
      legends={[
        {
          anchor: "bottom",
          direction: "row",
          translateY: 56,
          itemWidth: 120,
          itemHeight: 18,
          itemTextColor: "#999",
          symbolSize: 18,
          symbolShape: "circle",
          effects: [
            {
              on: "hover",
              style: {
                itemTextColor: "#000",
              },
            },
          ],
        },
      ]}
    />
  );
};

export default PieChart;
