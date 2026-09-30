import SupportClientReport from '../models/SupportClientReport.js';
import ControllerReport from '../models/ControllerReport.js';
import DataEntryOperatorReport from '../models/DataEntryOperatorReport.js';
import {
    aggregateFrequentErrors,
    countReportStatuses,
    countValidatedByDay,
    findReportsForRange,
    getPeriodDateRange,
    sumValidatedFields,
} from '../services/reportAggregation.js';

const sources = [
    {
        key: 'supportClient',
        service: 'support-client',
        Model: SupportClientReport,
        totals: {
            demandesSouscription: 'mails.demandesSouscription',
            questionsDiverses: 'mails.questionsDiverses',
            mailsTraites: 'mails.mailsTraites',
            dossiersEnAttenteRegularisation: 'mails.dossiersEnAttenteRegularisation',
            dossiersAssignes: 'dossiers.assignes',
            dossiersEnCours: 'dossiers.enCours',
            dossiersSaisis: 'dossiers.saisis',
        },
    },
    {
        key: 'controleur',
        service: 'controleur',
        Model: ControllerReport,
        totals: {
            dossiersAssignes: 'dossiersAssignes',
            dossiersControles: 'dossiersControles',
            dossiersEnAttente: 'dossiersEnAttente',
        },
    },
    {
        key: 'operateurSaisie',
        service: 'operateur-saisie',
        Model: DataEntryOperatorReport,
        totals: {
            dossiersRecus: 'dossiersRecus',
            dossiersTraites: 'dossiersTraites',
            dossiersRestants: 'dossiersRestants',
        },
    },
];

/**
 * Returns global statistics for the selected calendar period.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getGlobalStatistics = async (req, res) => {
    try {
        const range = getPeriodDateRange(req.query.periode || 'jour', req.query.date);
        const reportsBySource = await Promise.all(sources.map(async (source) => ({
            ...source,
            reports: await findReportsForRange(source.Model, range),
        })));

        const services = Object.fromEntries(reportsBySource.map((source) => [source.key, {
            service: source.service,
            counts: countReportStatuses(source.reports),
            totals: sumValidatedFields(source.reports, source.totals),
            ...(source.key === 'controleur' ? { frequentErrors: aggregateFrequentErrors(source.reports) } : {}),
        }]));
        const allReports = reportsBySource.flatMap((source) => source.reports);

        return res.status(200).json({
            periode: req.query.periode || 'jour',
            dateReference: range.date,
            start: range.start,
            end: range.end,
            services,
            validatedByDay: countValidatedByDay(allReports, range),
        });
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
    }
};
