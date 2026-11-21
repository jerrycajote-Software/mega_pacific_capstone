const {
  listErrorReports,
  getErrorReportById,
  updateErrorReportStatus
} = require("../../services/errorReportService");

// Return filtered user error reports and open-count KPIs for the Admin portal
const listAdminErrorReports = async (req, res, next) => {
  try {
    const { status, portal, source, search } = req.query;
    const result = await listErrorReports({ status, portal, source, search });

    return res.status(200).json({
      success: true,
      message: "Error reports loaded successfully.",
      data: result.reports,
      summary: result.summary
    });
  } catch (err) {
    return next(err);
  }
};

// Return full technical diagnostics and user notes for a single error report
const getAdminErrorReportById = async (req, res, next) => {
  try {
    const report = await getErrorReportById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Error report could not be found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Error report details loaded successfully.",
      data: report
    });
  } catch (err) {
    return next(err);
  }
};

// Update the investigation status and Admin notes for an error report
const updateAdminErrorReportStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body || {};
    const updatedReport = await updateErrorReportStatus(req.params.id, {
      status,
      adminNotes,
      resolvedById: req.user?.userId || null
    });

    const io = req.app.get("io");
    if (io) {
      io.to("admin").emit("admin_error_report_updated", {
        report: updatedReport
      });
    }

    return res.status(200).json({
      success: true,
      message: `Error report ${updatedReport.traceId} marked as ${updatedReport.status}.`,
      data: updatedReport
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listAdminErrorReports,
  getAdminErrorReportById,
  updateAdminErrorReportStatus
};
