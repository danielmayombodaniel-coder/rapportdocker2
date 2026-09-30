import SupportClientReport from '../models/SupportClientReport.js';
import { supportClientReportSchema } from '../validators/reportValidators.js';
import { createReportController } from '../services/reportControllerFactory.js';

const controller = createReportController({
    Model: SupportClientReport,
    schema: supportClientReportSchema,
    empty: {
        mails: {
            demandesSouscription: 0,
            questionsDiverses: 0,
            mailsTraites: 0,
            dossiersEnAttenteRegularisation: 0,
        },
        dossiers: { assignes: 0, enCours: 0, saisis: 0 },
    },
    meaningfulFields: ['mails', 'dossiers'],
    allowedProfiles: ['support_client_agent'],
    service: 'support-client',
});

export const getToday = controller.getToday;
export const updateToday = controller.updateToday;
export const submitToday = controller.submitToday;
