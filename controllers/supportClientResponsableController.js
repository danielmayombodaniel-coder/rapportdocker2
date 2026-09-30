import SupportClientReport from '../models/SupportClientReport.js';
import { createResponsableController } from '../services/responsableControllerFactory.js';

const controller = createResponsableController({
    Model: SupportClientReport,
    summary: (report) => ({
        mailsTraites: report.mails?.mailsTraites || 0,
        dossiersEnCours: report.dossiers?.enCours || 0,
    }),
    totals: {
        demandesSouscription: 'mails.demandesSouscription',
        questionsDiverses: 'mails.questionsDiverses',
        mailsTraites: 'mails.mailsTraites',
        dossiersEnAttenteRegularisation: 'mails.dossiersEnAttenteRegularisation',
        dossiersAssignes: 'dossiers.assignes',
        dossiersEnCours: 'dossiers.enCours',
        dossiersSaisis: 'dossiers.saisis',
    },
});

export const list = controller.list;
export const detail = controller.detail;
export const update = controller.update;
export const validate = controller.validate;
export const requestCorrection = controller.requestCorrection;
export const statistics = controller.statistics;
