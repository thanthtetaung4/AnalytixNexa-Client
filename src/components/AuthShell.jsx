import { Box, Typography, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import { AuroraBackground, BrandMark, GlassCard, StatusDot } from "./ui";
import useApiHealth from "./useApiHealth";

const PROOF = [
  {
    icon: <BoltRoundedIcon />,
    title: "Analysis in seconds",
    body: "Drop a CSV and get customer, sales and temporal breakdowns immediately.",
  },
  {
    icon: <InsightsRoundedIcon />,
    title: "Charts, not spreadsheets",
    body: "Product preference and month-by-month revenue rendered on arrival.",
  },
  {
    icon: <ShieldRoundedIcon />,
    title: "Your data stays yours",
    body: "Files are scoped to your account and removable at any time.",
  },
];

/**
 * Shared shell for login / signup: an editorial glass panel on the
 * left carrying the value proposition, the form on the right.
 *
 * Below `lg` the panel collapses away entirely rather than stacking — on a
 * phone the fastest path to the form matters more than the pitch.
 */
const AuthShell = ({ children, maxWidth = 440 }) => {
  const theme = useTheme();
  const apiHealth = useApiHealth();

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", display: "flex" }}>
      <AuroraBackground />

      {/* ── brand panel (lg and up) ── */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          position: "relative",
          zIndex: 1,
          width: "44%",
          maxWidth: 620,
          flexDirection: "column",
          justifyContent: "space-between",
          p: 6,
          borderRight: `1px solid ${theme.palette.glass.border}`,
        }}
      >
        <BrandMark size={40} />

        <Box>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.75,
              mb: 3,
              borderRadius: 999,
              border: `1px solid ${theme.palette.glass.border}`,
              bgcolor: theme.palette.glass.surface,
              backdropFilter: "blur(12px)",
            }}
          >
            <StatusDot
              color={
                apiHealth.state === "offline"
                  ? theme.palette.error.main
                  : apiHealth.state === "checking"
                  ? theme.palette.text.disabled
                  : theme.palette.success.main
              }
              pulse={apiHealth.state === "online"}
            />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {apiHealth.state === "online"
                ? "Analysis engine online"
                : apiHealth.state === "offline"
                ? "Analysis engine unreachable"
                : "Checking analysis engine…"}
            </Typography>
          </Box>

          <Typography
            variant="h2"
            component="p"
            sx={{
              color: "text.primary",
              mb: 2,
              maxWidth: 520,
            }}
          >
            Turn a raw CSV into a{" "}
            <Box
              component="span"
              sx={{
                background: theme.gradients.text,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              decision
            </Box>
            .
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", maxWidth: 460, mb: 4 }}
          >
            AnalytixNexa reads your sales data and returns customer behaviour,
            revenue and seasonality analysis — no formulas, no pivot tables.
          </Typography>

          <Stack spacing={1.5} sx={{ maxWidth: 480 }}>
            {PROOF.map((p, i) => (
              <GlassCard key={p.title} padding={2} delay={i * 70} interactive>
                <Box sx={{ display: "flex", gap: 1.75, alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      flexShrink: 0,
                      borderRadius: 1.75,
                      display: "grid",
                      placeItems: "center",
                      color: "primary.light",
                      background: theme.gradients.brandSoft,
                      border: `1px solid ${theme.palette.glass.border}`,
                      "& svg": { fontSize: 19 },
                    }}
                  >
                    {p.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: "text.primary", fontSize: "0.875rem" }}
                    >
                      {p.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {p.body}
                    </Typography>
                  </Box>
                </Box>
              </GlassCard>
            ))}
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          © {new Date().getFullYear()} AnalytixNexa
        </Typography>
      </Box>

      {/* ── form column ── */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2.5, sm: 4 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth, display: { lg: "none" }, mb: 3 }}>
          <BrandMark size={38} />
        </Box>
        <Box sx={{ width: "100%", maxWidth }}>{children}</Box>
      </Box>
    </Box>
  );
};

AuthShell.propTypes = {
  children: PropTypes.node,
  maxWidth: PropTypes.number,
};

export default AuthShell;
