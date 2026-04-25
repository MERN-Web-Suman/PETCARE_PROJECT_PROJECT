import Pet from "../models/Pet.js";

export const addPet = async (req, res) => {
  try {
    const petData = { ...req.body };
    // Automatically set the owner from the token
    petData.owner = req.user.id; 

    if (req.file) {
      petData.image = req.file.path.replace(/\\/g, "/"); 
    }
    const pet = await Pet.create(petData);
    res.status(201).json(pet);
  } catch (error) {
    console.error("Pet Creation Error:", error);
    res.status(400).json({ 
      message: error.name === "ValidationError" 
        ? Object.values(error.errors).map(val => val.message)[0] 
        : error.message || "Failed to create pet" 
    });
  }
};

export const getPets = async (req, res) => {
  try {
    const { owner } = req.query;
    const filter = owner ? { owner } : {};
    const pets = await Pet.find(filter).sort({ createdAt: -1 }).populate("owner", "name email");
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pets", error: error.message });
  }
};

export const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('owner', 'name email');
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pet details", error: error.message });
  }
};

export const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // Authorization: Check if the user is the owner
    if (pet.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied. Action restricted to the owner." });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path.replace(/\\/g, "/"); 
    }

    // Fix empty fields causing CastErrors
    ['age', 'dateOfBirth', 'nextAppointment'].forEach(field => {
       if (updateData[field] === "" || updateData[field] === "null" || updateData[field] === "undefined") {
           updateData[field] = null;
       }
    });

    // Remove immutable paths
    delete updateData._id;
    delete updateData.__v;
    delete updateData.owner;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json(updatedPet);
  } catch (error) {
    console.error("Pet Update Error:", error);
    res.status(500).json({ message: "Failed to update pet", error: error.message });
  }
};

export const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // Authorization: Check if the user is the owner
    if (pet.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied. Action restricted to the owner." });
    }

    await Pet.findByIdAndDelete(req.params.id);
    res.json({ message: "Pet deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete pet", error: error.message });
  }
};

export const updatePetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!["Available", "Sold"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const pet = await Pet.findById(id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // Authorization: Check if the user is the owner
    if (pet.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied. Action restricted to the owner." });
    }

    pet.status = status;
    await pet.save();
    
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: "Failed to update pet status", error: error.message });
  }
};
