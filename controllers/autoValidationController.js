import { getAutoValidationSetting, setAutoValidation } from '../services/autoValidationService.js';

export const getSetting = async (req, res) => {
    try {
        return res.status(200).json(await getAutoValidationSetting(req.params.service));
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
    }
};

export const updateSetting = async (req, res) => {
    try {
        if (typeof req.body?.enabled !== 'boolean') {
            return res.status(400).json({ message: 'Le champ enabled doit être booléen' });
        }
        return res.status(200).json(await setAutoValidation(req.params.service, req.body.enabled, req.user?.userId));
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
    }
};

export const getSettingFor = (service) => (req, res) => {
    req.params.service = service;
    return getSetting(req, res);
};

export const updateSettingFor = (service) => (req, res) => {
    req.params.service = service;
    return updateSetting(req, res);
};