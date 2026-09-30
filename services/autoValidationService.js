import AutoValidationSetting from '../models/AutoValidationSetting.js';
import SupportClientReport from '../models/SupportClientReport.js';
import ControllerReport from '../models/ControllerReport.js';
import DataEntryOperatorReport from '../models/DataEntryOperatorReport.js';

const serviceConfig = {
    'support-client': { Model: SupportClientReport },
    controleur: { Model: ControllerReport },
    'operateur-saisie': { Model: DataEntryOperatorReport },
};

export const getServiceConfig = (service) => {
    const config = serviceConfig[service];
    if (!config) {
        const error = new Error('Service invalide');
        error.status = 400;
        throw error;
    }
    return config;
};

export const isAutoValidationEnabled = async (service) => {
    const setting = await AutoValidationSetting.findOne({ service }).lean();
    return Boolean(setting?.enabled);
};

export const getAutoValidationSetting = async (service) => {
    getServiceConfig(service);
    const setting = await AutoValidationSetting.findOne({ service }).lean();
    return { enabled: Boolean(setting?.enabled) };
};

export const setAutoValidation = async (service, enabled, userId) => {
    const { Model } = getServiceConfig(service);
    const setting = await AutoValidationSetting.findOneAndUpdate(
        { service },
        { service, enabled, ...(userId ? { updatedBy: userId } : {}) },
        { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    let validatedCount = 0;
    if (enabled) {
        const result = await Model.updateMany(
            { status: 'submitted' },
            { $set: { status: 'validated', validatedBy: userId, validatedAt: new Date() } },
        );
        validatedCount = result.modifiedCount || 0;
    }

    return { enabled: setting.enabled, validatedCount };
};