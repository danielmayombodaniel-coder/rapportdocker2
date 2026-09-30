import ControllerReport from '../models/ControllerReport.js';
import { controllerReportSchema } from '../validators/reportValidators.js';
import { createReportController } from '../services/reportControllerFactory.js';

const controller = createReportController({
    Model: ControllerReport,
    schema: controllerReportSchema,
    empty: {
        dossiersAssignes: 0,
        dossiersControles: 0,
        dossiersEnAttente: 0,
        observations: '',
        dataEntryPersons: [],
        frequentErrors: [],
    },
    meaningfulFields: ['dossiersAssignes', 'dossiersControles', 'dossiersEnAttente', 'observations', 'dataEntryPersons', 'frequentErrors'],
    allowedProfiles: ['controleur_agent'],
    service: 'controleur',
});

export const getToday = controller.getToday;
export const updateToday = controller.updateToday;
export const submitToday = controller.submitToday;
