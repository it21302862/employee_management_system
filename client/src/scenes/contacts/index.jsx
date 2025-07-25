import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  useTheme,
  Grid,
  Divider,
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useEffect, useState } from "react";
import axios from "axios";

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const res = await axios.get("http://localhost:8000/api/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  if (!user) return <Typography>Loading...</Typography>;

  return (
    <Box m="20px">
      <Header title="CONTACT PROFILE" subtitle="User Profile" />

      <Box display="flex" justifyContent="center" mt="40px">
        <Card
          sx={{
            width: "100%",
            maxWidth: 900,
            display: "flex",
            backgroundColor: colors.primary[400],
            boxShadow: 6,
            borderRadius: "16px",
          }}
        >
          {/* Left Side */}
          <Box
            sx={{
              width: "40%",
              backgroundColor: colors.blueAccent[700],
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "30px",
              borderTopLeftRadius: "16px",
              borderBottomLeftRadius: "16px",
              color: colors.grey[100],
            }}
          >
            <Avatar
              src={user.profileImage}
              sx={{
                width: 140,
                height: 140,
                fontSize: 50,
                bgcolor: colors.greenAccent[500],
                mb: 3,
              }}
            >
              {!user.profileImage && user.name.split(" ").map((n) => n[0]).join("")}
            </Avatar>
            <Typography variant="h4" gutterBottom>
              {user.name}
            </Typography>
            <Typography variant="body1">Role: {user.role}</Typography>
            <Typography variant="body1">Position: {user.position}</Typography>
            <Typography variant="body1">Age: {user.age}</Typography>
          </Box>

          {/* Right Side */}
          <CardContent
            sx={{
              width: "60%",
              padding: "30px",
              color: colors.grey[100],
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 2, backgroundColor: colors.grey[600] }} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1"><strong>Email:</strong> {user.email}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1"><strong>Phone:</strong> {user.phone}</Typography>
              </Grid>
              <Grid item xs={12} mt={2}>
                <Typography variant="h6" gutterBottom>
                  Address
                </Typography>
                <Divider sx={{ mb: 2, backgroundColor: colors.grey[600] }} />
                <Typography variant="body1">{user.address}</Typography>
                <Typography variant="body1">{user.city}, {user.zipCode}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Contacts;
