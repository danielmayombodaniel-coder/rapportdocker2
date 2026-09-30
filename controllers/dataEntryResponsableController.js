import DataEntryOperatorReport from '../models/DataEntryOperatorReport.js';
import { createResponsableController } from '../services/responsableControllerFactory.js';

const controller = createResponsableController({
    Model: DataEntryOperatorReport,
    summary: (report) => ({
        dossiersRecus: report.dossiersRecus || 0,
        dossiersTraites: report.dossiersTraites || 0,
        dossiersRestants: report.dossiersRestants || 0,
    }),
    totals: {
        dossiersRecus: 'dossiersRecus',
        dossiersTraites: 'dossiersTraites',
        dossiersRestants: 'dossiersRestants',
    },
});

export const list = controller.list;
export const detail = controller.detail;
export const update = controller.update;
export const validate = controller.validate;
export const requestCorrection = controller.requestCorrection;
export const statistics = controller.statistics;
