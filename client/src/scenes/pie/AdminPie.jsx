import { Box } from "@mui/material";
import Header from "../../components/Header";
import AdminPieChart from "../../components/PieChart";

const Pie = () => {
  return (
    <Box m="20px">
      <Header title="Work Chart" subtitle="Monthly Attendance Pie Chart" />
      <Box height="75vh">
        <AdminPieChart />
      </Box>
    </Box>
  );
};

export default Pie;
