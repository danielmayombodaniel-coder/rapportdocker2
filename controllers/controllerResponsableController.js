import ControllerReport from '../models/ControllerReport.js';
import { aggregateFrequentErrors } from '../services/reportAggregation.js';
import { createResponsableController } from '../services/responsableControllerFactory.js';

const controller = createResponsableController({
    Model: ControllerReport,
    summary: (report) => ({
        dossiersAssignes: report.dossiersAssignes || 0,
        dossiersControles: report.dossiersControles || 0,
        dossiersEnAttente: report.dossiersEnAttente || 0,
    }),
    totals: {
        dossiersAssignes: 'dossiersAssignes',
        dossiersControles: 'dossiersControles',
        dossiersEnAttente: 'dossiersEnAttente',
    },
    extraStats: (reports) => ({ frequentErrors: aggregateFrequentErrors(reports) }),
});

export const list = controller.list;
export const detail = controller.detail;
export const update = controller.update;
export const validate = controller.validate;
export const requestCorrection = controller.requestCorrection;
export const statistics = controller.statistics;
