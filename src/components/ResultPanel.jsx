import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";
import PropTypes from "prop-types";

import AiChart from "./AiChart";
import MyChart from "./MyChart";
import TemporalChart from "./TemporalChart";
import { KIND_LABELS, formatDateTime, reportMetrics } from "../api/normalize";
import { GlassCard, MetricStrip } from "./ui";

/**
 * Render one trace step's arguments.
 *
 * Scalars only, and never more than a line: the API already drops nested
 * values, but a report stored before it did would otherwise render an
 * unreadable `[object Object]` here.
 */
const formatArgs = (args) => {
  const pairs = Object.entries(args ?? {}).filter(
    ([, value]) => value !== null && typeof value !== "object"
  );
  if (pairs.length === 0) return null;
  return `(${pairs.map(([key, value]) => `${key}=${value}`).join(", ")})`;
};

/**
 * One analysed dataset, rendered as a collapsible panel.
 *
 * Reads the API's `AnalysisReport` directly, so which engine produced it makes
 * no structural difference — but the two engines return different amounts, and
 * the panel follows the report rather than padding it out:
 *
 *  - **pandas** fills the numeric slots only, so the panel is the charts it
 *    can build from them.
 *  - **the AI engine** additionally returns a headline, narrative, findings,
 *    its own chart specs and recommendations. Those lead, because the written
 *    finding is the thing worth reading first; its charts replace the built-in
 *    ones, since it chose them to carry that finding.
 *
 * Shared by the Overview and Results pages — both previously carried a
 * near-identical copy of this markup, which is how they drifted apart.
 */
const ResultPanel = ({ result, defaultExpanded = false, delay, compact = false }) => {
  const theme = useTheme();
  const [traceOpen, setTraceOpen] = useState(false);

  if (!result) return null;

  const {
    months,
    products,
    uniqueCustomers,
    averageSale,
    totalSale,
    headline,
    narrative,
    keyFindings,
    sections,
    charts,
    recommendations,
    trace,
    model,
    kindsSkipped,
  } = reportMetrics(result.report);

  const isAi = result.provider === "ai";
  const hasWriting = Boolean(headline || narrative || keyFindings.length);
  // The headline numbers are shown only when nothing has already said them in
  // words. A narrative that opens with "revenue totalled 425.00" beside a tile
  // reading 425.00 is the same fact twice.
  const showNumbers = !hasWriting && totalSale !== undefined;
  // The engine's own charts are a deliberate choice of what to show. Fall back
  // to the built-in ones only when it did not make that choice.
  const showBuiltInCharts = charts.length === 0;
  // Overview is a summary, so it gets one chart. A six-month dataset produced
  // six stacked full-width charts there, which pushed the file list and
  // everything else off the screen entirely.
  const shownCharts = compact ? charts.slice(0, 1) : charts;
  // Newest period first when only one fits — that is the one being asked about.
  const shownMonths = compact ? months.slice(-1) : months;
  const hiddenCharts =
    (charts.length - shownCharts.length) + (months.length - shownMonths.length);

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      sx={{
        mb: 1.5,
        ...(delay !== undefined && {
          animation: `rise-in ${theme.motion.slow}ms ${theme.motion.ease} both`,
          animationDelay: `${delay}ms`,
        }),
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRoundedIcon />}
        aria-controls={`result-${result.id}-content`}
        id={`result-${result.id}-header`}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minWidth: 0,
            width: "100%",
            pr: 1,
          }}
        >
          <Box
            sx={{
              width: 30,
              height: 30,
              flexShrink: 0,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              color: "primary.light",
              background: theme.gradients.brandSoft,
              border: `1px solid ${theme.palette.glass.border}`,
              "& svg": { fontSize: 16 },
            }}
          >
            {isAi ? <AutoAwesomeRoundedIcon /> : <DescriptionRoundedIcon />}
          </Box>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: "0.9375rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {result.fileName}
            </Typography>
            {/* Prefer the engine's own one-liner over a count of periods and
                products — it says what the analysis found, not its shape. */}
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {headline ||
                `${months.length} ${months.length === 1 ? "period" : "periods"} · ` +
                  `${products.length} ${products.length === 1 ? "product" : "products"} · ` +
                  formatDateTime(result.createdAt)}
            </Typography>
          </Box>
          <Chip
            label={isAi ? "AI" : "Statistics"}
            size="small"
            icon={isAi ? <AutoAwesomeRoundedIcon /> : undefined}
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              color: isAi ? theme.palette.primary.light : theme.palette.success.main,
              bgcolor: alpha(
                isAi ? theme.palette.primary.main : theme.palette.success.main,
                0.12
              ),
              borderColor: alpha(
                isAi ? theme.palette.primary.main : theme.palette.success.main,
                0.28
              ),
              "& .MuiChip-icon": { fontSize: 14 },
            }}
          />
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        {result.question && (
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              pl: 1.5,
              borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
              color: "text.secondary",
              fontStyle: "italic",
            }}
          >
            “{result.question}”
          </Typography>
        )}

        {showNumbers && (
          <Box sx={{ mb: 2 }}>
            <MetricStrip
              metrics={[
                {
                  label: "Total sales",
                  value: totalSale,
                  decimals: 2,
                  icon: <PaymentsRoundedIcon />,
                  accent: theme.palette.success.main,
                },
                {
                  label: "Average sale",
                  value: averageSale,
                  decimals: 2,
                  icon: <ReceiptLongRoundedIcon />,
                  accent: theme.palette.secondary.main,
                },
                {
                  label: "Unique customers",
                  value: uniqueCustomers,
                  icon: <GroupsRoundedIcon />,
                  accent: theme.palette.info.main,
                },
              ]}
            />
          </Box>
        )}

        {/* ── what the engine found ── */}
        {hasWriting && (
          <Box sx={{ mb: shownCharts.length || showBuiltInCharts ? 2.5 : 0 }}>
            {headline && (
              <Typography variant="h6" sx={{ fontSize: "1.0625rem", mb: 1 }}>
                {headline}
              </Typography>
            )}
            {narrative && (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", whiteSpace: "pre-line", lineHeight: 1.7 }}
              >
                {narrative}
              </Typography>
            )}

            {keyFindings.length > 0 && (
              <Box
                component="ul"
                sx={{ pl: 0, mt: 2, mb: 0, listStyle: "none", display: "grid", gap: 0.75 }}
              >
                {keyFindings.map((finding) => (
                  <Box
                    component="li"
                    key={finding}
                    sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
                  >
                    <CheckCircleOutlineRoundedIcon
                      sx={{ fontSize: 15, mt: 0.35, color: "success.main", flexShrink: 0 }}
                    />
                    <Typography variant="body2">{finding}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* ── charts ── */}
        {shownCharts.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {shownCharts.map((spec, index) => (
              <Grid
                item
                xs={12}
                lg={shownCharts.length > 1 && !compact ? 6 : 12}
                key={`${spec.title}-${index}`}
              >
                <GlassCard padding={2.5}>
                  <AiChart spec={spec} height={compact ? 240 : 280} />
                </GlassCard>
              </Grid>
            ))}
          </Grid>
        )}

        {showBuiltInCharts && (
          <Grid container spacing={2}>
            {shownMonths.map((month) => (
              <Grid
                item
                xs={12}
                lg={shownMonths.length > 1 && !compact ? 6 : 12}
                key={month.month}
              >
                <GlassCard padding={2.5}>
                  <TemporalChart analysisData={month} height={compact ? 240 : 300} />
                </GlassCard>
              </Grid>
            ))}
            {products.length > 0 && !compact && (
              <Grid item xs={12}>
                <GlassCard padding={2.5}>
                  <MyChart analysisData={products} height={330} />
                </GlassCard>
              </Grid>
            )}
          </Grid>
        )}

        {compact && hiddenCharts > 0 && (
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 1.5, color: "text.disabled" }}
          >
            +{hiddenCharts} more {hiddenCharts === 1 ? "chart" : "charts"} on the
            Results page.
          </Typography>
        )}

        {/* ── the deeper write-up ── */}
        {sections.length > 0 && !compact && (
          <Box sx={{ mt: shownCharts.length || showBuiltInCharts ? 2.5 : 0 }}>
            {sections.map((section, index) => (
              <Box key={section.heading} sx={{ mt: index > 0 ? 2.5 : 0 }}>
                <Typography variant="subtitle1" sx={{ fontSize: "0.9375rem", mb: 0.5 }}>
                  {section.heading}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", lineHeight: 1.7 }}
                >
                  {section.body}
                </Typography>
                {section.bullets?.length > 0 && (
                  <Box component="ul" sx={{ pl: 2.5, mt: 0.75, mb: 0 }}>
                    {section.bullets.map((bullet) => (
                      <Typography
                        component="li"
                        variant="body2"
                        key={bullet}
                        sx={{ color: "text.secondary", mb: 0.25 }}
                      >
                        {bullet}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

        {recommendations.length > 0 && (
          <GlassCard padding={2.25} sx={{ mt: 2.5 }}>
            <Typography
              variant="caption"
              sx={{ color: "text.disabled", display: "block", mb: 1.25 }}
            >
              What to do next
            </Typography>
            <Box sx={{ display: "grid", gap: 1 }}>
              {recommendations.map((item) => (
                <Box key={item} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  <LightbulbOutlinedIcon
                    sx={{ fontSize: 16, mt: 0.3, color: "primary.light", flexShrink: 0 }}
                  />
                  <Typography variant="body2">{item}</Typography>
                </Box>
              ))}
            </Box>
          </GlassCard>
        )}

        {/* An analysis that skipped something must say so — otherwise a missing
            section reads as a bug rather than as "your data cannot show this". */}
        {kindsSkipped.length > 0 && (
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 2, color: "text.disabled" }}
          >
            Not covered by this dataset:{" "}
            {kindsSkipped.map((kind) => KIND_LABELS[kind] ?? kind).join(", ")}.
          </Typography>
        )}

        {/* How the agent worked. Collapsed by default: it is here to be
            auditable, not to be read every time. */}
        {trace.length > 0 && !compact && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 1.5 }} />
            <Button
              size="small"
              variant="text"
              onClick={() => setTraceOpen((open) => !open)}
              startIcon={<TerminalRoundedIcon sx={{ fontSize: 15 }} />}
              sx={{ color: "text.secondary", fontSize: "0.75rem" }}
            >
              {traceOpen ? "Hide" : "Show"} how this was analysed
              {` (${trace.length} ${trace.length === 1 ? "step" : "steps"}`}
              {model ? `, ${model})` : ")"}
            </Button>
            <Collapse in={traceOpen} unmountOnExit>
              <Box component="ol" sx={{ pl: 2.5, mt: 1, mb: 0 }}>
                {trace.map((step, index) => (
                  <Box component="li" key={`${step.tool}-${index}`} sx={{ mb: 0.75 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                        color: step.ok === false ? "error.main" : "text.secondary",
                      }}
                    >
                      {step.tool}
                      {formatArgs(step.arguments)}
                    </Typography>
                    {step.summary && (
                      <Typography
                        variant="caption"
                        sx={{ display: "block", color: "text.disabled" }}
                      >
                        {step.summary}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

ResultPanel.propTypes = {
  /** A normalised analysis: see `toAnalysis` in `src/api/normalize.js`. */
  result: PropTypes.object,
  defaultExpanded: PropTypes.bool,
  delay: PropTypes.number,
  /** Tighter layout for the Overview page, which shows this beside other
   *  cards rather than as the whole page. Drops the deep write-up and the
   *  audit trail, both of which belong on the Results page. */
  compact: PropTypes.bool,
};

export default ResultPanel;
