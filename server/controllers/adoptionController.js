import Adoption from "../models/Adoption.js";
import { getIO } from "../utils/socket.js";

export const addPetForAdoption = async (req, res) => {
  const adoption = await Adoption.create(req.body);
  const io = getIO();
  if (io) io.emit("adoption-created", adoption);
  res.json(adoption);
};

export const getAdoptions = async (req, res) => {
  res.json(await Adoption.find());
};

export const updateAdoption = async (req, res) => {
  const { id } = req.params;
  const adoption = await Adoption.findByIdAndUpdate(id, req.body, { new: true });
  const io = getIO();
  if (io) io.emit("adoption-updated", adoption);
  res.json(adoption);
};
