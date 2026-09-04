import { Box, Chip, Divider, Grid, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import NightModeToggle from "../../components/NightModeToggle";
import useApiHealth from "../../components/useApiHealth";
import useProviders from "../../components/useProviders";
import useWorkspace from "../../components/useWorkspace";
import { formatBytes } from "../../api/normalize";
import { GlassCard, PageHeader, StatusDot } from "../../components/ui";
import PropTypes from "prop-types";

const SettingRow = ({ icon, title, description, children }) => {
  const theme = useTheme();
  return (
    <Grid container spacing={2} alignItems="center" sx={{ py: 2.5 }}>
      <Grid item xs={12} md={6}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              flexShrink: 0,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              color: "primary.light",
              background: theme.gradients.brandSoft,
              border: `1px solid ${theme.palette.glass.border}`,
              "& svg": { fontSize: 18 },
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontSize: "0.9375rem" }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {description}
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        sx={{ display: "flex", justifyContent: { md: "flex-end" } }}
      >
        {children}
      </Grid>
    </Grid>
  );
};

SettingRow.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  children: PropTypes.node,
};

const ENGINE_LABEL = { pandas: "Statistics", ai: "AI analyst" };

const Settings = () => {
  const theme = useTheme();
  const { datasets } = useWorkspace();
  const { providers, defaultProvider } = useProviders();
  // "Online" used to be hardcoded here, which made it decoration rather than a
  // status. It is a real probe now.
  const engine = useApiHealth();

  const engineTone = {
    checking: theme.palette.text.secondary,
    online: theme.palette.success.main,
    offline: theme.palette.error.main,
  }[engine.state];

  const engineLabel = {
    checking: "Checking…",
    online: `Online · ${engine.provider ?? "unknown"} engine`,
    offline: "Unreachable",
  }[engine.state];

  const storedBytes = datasets.reduce(
    (total, dataset) => total + (dataset.size_bytes ?? 0),
    0
  );

  return (
    <Box component="section">
      <PageHeader
        title="Workspace settings"
        subtitle="How this workspace looks on this device, and the state of the services behind it."
      />

      <GlassCard padding={{ xs: 2, sm: 3 }} sx={{ maxWidth: 980 }}>
        <SettingRow
          icon={<PaletteRoundedIcon />}
          title="Appearance"
          description="Choose the theme for the whole workspace. Saved in this browser."
        >
          <NightModeToggle />
        </SettingRow>

        <Divider />

        <SettingRow
          icon={<BoltRoundedIcon />}
          title="Analysis engine"
          description={
            engine.state === "offline"
              ? engine.message || "The analysis service is not responding."
              : "Live status of the service that processes your datasets."
          }
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <StatusDot color={engineTone} pulse={engine.state === "online"} />
            <Typography
              variant="body2"
              sx={{ color: engineTone, fontWeight: 600 }}
            >
              {engineLabel}
            </Typography>
          </Box>
        </SettingRow>

        <Divider />

        {/* Which engines exist and which this server can actually run. The AI
            engine needs an API key, so "not configured" is a normal state that
            has to be visible somewhere rather than only surfacing on submit. */}
        {providers.length > 0 && (
          <>
            <SettingRow
              icon={<AutoAwesomeRoundedIcon />}
              title="Analysis engines"
              description="The engines you can pick from when running an analysis."
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  justifyContent: { md: "flex-end" },
                }}
              >
                {providers.map((provider) => {
                  const usable = provider.implemented && provider.available;
                  const tone = usable
                    ? theme.palette.success.main
                    : theme.palette.text.disabled;
                  return (
                    <Chip
                      key={provider.name}
                      size="small"
                      label={
                        `${ENGINE_LABEL[provider.name] ?? provider.name}` +
                        (provider.name === defaultProvider ? " · default" : "") +
                        (usable ? "" : " · not configured")
                      }
                      sx={{
                        color: tone,
                        bgcolor: `${tone}18`,
                        borderColor: `${tone}3A`,
                      }}
                    />
                  );
                })}
              </Box>
            </SettingRow>

            <Divider />
          </>
        )}

        <SettingRow
          icon={<StorageRoundedIcon />}
          title="Data storage"
          description="Uploaded files and results are stored against your account."
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {datasets.length} {datasets.length === 1 ? "dataset" : "datasets"} ·{" "}
            {formatBytes(storedBytes)}
          </Typography>
        </SettingRow>
      </GlassCard>
    </Box>
  );
};

export default Settings;
