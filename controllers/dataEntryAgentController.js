import DataEntryOperatorReport from '../models/DataEntryOperatorReport.js';
import { dataEntryOperatorReportSchema } from '../validators/reportValidators.js';
import { createReportController } from '../services/reportControllerFactory.js';

const controller = createReportController({
    Model: DataEntryOperatorReport,
    schema: dataEntryOperatorReportSchema,
    empty: {
        dossiersRecus: 0,
        dossiersTraites: 0,
        dossiersRestants: 0,
        observations: '',
    },
    meaningfulFields: ['dossiersRecus', 'dossiersTraites', 'dossiersRestants', 'observations'],
    allowedProfiles: ['operateur_saisie_agent'],
    service: 'operateur-saisie',
});

export const getToday = controller.getToday;
export const updateToday = controller.updateToday;
export const submitToday = controller.submitToday;
