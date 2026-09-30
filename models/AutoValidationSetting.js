import mongoose from 'mongoose';

const autoValidationSettingSchema = new mongoose.Schema({
    service: {
        type: String,
        enum: ['support-client', 'controleur', 'operateur-saisie'],
        unique: true,
        required: true,
    },
    enabled: { type: Boolean, default: false },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
}, { timestamps: true });

const AutoValidationSetting = mongoose.model('AutoValidationSetting', autoValidationSettingSchema);

export default AutoValidationSetting;