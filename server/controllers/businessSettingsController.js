const BusinessSettings = require('../models/BusinessSettings');

// Get Settings (Public)
const getSettings = async (req, res, next) => {
  try {
    let settings = await BusinessSettings.findOne();
    if (!settings) {
      settings = await BusinessSettings.create({});
    }
    res.json({
      success: true,
      settings
    });
  } catch (err) {
    next(err);
  }
};

// Update Settings (Admin)
const updateSettings = async (req, res, next) => {
  try {
    let settings = await BusinessSettings.findOne();
    if (!settings) {
      settings = new BusinessSettings();
    }

    const {
      storeName,
      tagline,
      contactNumber,
      whatsappNumber,
      email,
      address,
      defaultAdvancePercentage,
      flatShippingRate,
      freeShippingThreshold,
      socialLinks,
      policies,
      paymentSettings
    } = req.body;

    if (storeName) settings.storeName = storeName;
    if (tagline !== undefined) settings.tagline = tagline;
    if (contactNumber !== undefined) settings.contactNumber = contactNumber;
    if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;
    if (email !== undefined) settings.email = email;
    if (address) settings.address = { ...settings.address, ...address };
    if (defaultAdvancePercentage !== undefined) settings.defaultAdvancePercentage = Number(defaultAdvancePercentage);
    if (flatShippingRate !== undefined) settings.flatShippingRate = Number(flatShippingRate);
    if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = Number(freeShippingThreshold);
    if (socialLinks) settings.socialLinks = { ...settings.socialLinks, ...socialLinks };
    if (policies) settings.policies = { ...settings.policies, ...policies };
    if (paymentSettings) settings.paymentSettings = { ...settings.paymentSettings, ...paymentSettings };

    await settings.save();

    res.json({
      success: true,
      message: 'Business settings updated successfully.',
      settings
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings };
