import Clinic from "../models/Clinic.js";

export const createClinic = async (req, res) => {
  try {
    const { name, email, phone, address, doctorName, doctorAbout, experience, specialization, workingHours, isAvailable } = req.body;
    console.log('Attempting to create clinic for provider:', req.user.id);
    const clinic = await Clinic.create({
      provider: req.user.id,
      name,
      email,
      phone,
      address,
      doctorName,
      doctorAbout,
      experience,
      specialization,
      workingHours,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });
    res.status(201).json(clinic);
  } catch (err) {
    console.error('createClinic Error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getProviderClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find({ provider: req.user.id });
    res.json(clinics);
  } catch (err) {
    console.error('getProviderClinics Error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const updateClinic = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, doctorName, doctorAbout, experience, specialization, workingHours, isAvailable } = req.body;
    
    const updateData = { name, email, phone, address, doctorName, doctorAbout, experience, specialization, workingHours };
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    const clinic = await Clinic.findOneAndUpdate(
      { _id: id, provider: req.user.id },
      updateData,
      { new: true }
    );
    
    if (!clinic) return res.status(404).json({ message: "Clinic not found or unauthorized" });
    res.json(clinic);
  } catch (err) {
    console.error('updateClinic Error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteClinic = async (req, res) => {
  try {
    const { id } = req.params;
    const clinic = await Clinic.findOneAndDelete({ _id: id, provider: req.user.id });
    
    if (!clinic) return res.status(404).json({ message: "Clinic not found or unauthorized" });
    res.json({ message: "Clinic deleted successfully" });
  } catch (err) {
    console.error('deleteClinic Error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getAllClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find();
    res.json(clinics);
  } catch (err) {
    console.error('getAllClinics Error:', err);
    res.status(500).json({ message: err.message });
  }
};
export const getClinicById = async (req, res) => {
  try {
    const { id } = req.params;
    const clinic = await Clinic.findById(id);
    if (!clinic) return res.status(404).json({ message: "Clinic not found" });
    res.json(clinic);
  } catch (err) {
    console.error('getClinicById Error:', err);
    res.status(500).json({ message: err.message });
  }
};
