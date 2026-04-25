import Product from "../models/Product.js";
import { getIO } from "../utils/socket.js";

// Helper to map inventory product to mart-compatible format
export const mapProductForMart = (p) => {
  const obj = p.toObject ? p.toObject() : { ...p };
  
  const formattedImageUrl = obj.image ? (obj.image.startsWith('http') ? obj.image : `http://localhost:5001/${obj.image.replace(/\\/g, "/")}`) : null;

  // The Mart frontend expects `images` (array) and `quantity`
  if (!obj.images || obj.images.length === 0) {
    obj.images = formattedImageUrl ? [formattedImageUrl] : [];
  }
  
  // Expose formatted solo image as well
  obj.image = formattedImageUrl;

  if (obj.quantity === undefined) {
    obj.quantity = obj.stock ?? 0;
  }
  // Map additional fields the Mart UI uses
  obj.brand = obj.brandName || '';
  obj.description = obj.medicineName
    ? `${obj.medicineName} by ${obj.brandName || 'Unknown Brand'} — ${obj.type || 'General'}`
    : `${obj.category || 'General'} product`;
  obj.availabilityStatus = obj.status || (obj.stock > 0 ? 'In Stock' : 'Out of Stock');
  // Build specifications as an object for the details page
  if (Array.isArray(obj.specifications)) {
    const specObj = {};
    obj.specifications.forEach(s => { if (s.key) specObj[s.key] = s.value; });
    if (obj.suitableFor?.length) specObj['Suitable For'] = obj.suitableFor;
    if (obj.breedSize?.length) specObj['Breed Size'] = obj.breedSize;
    if (obj.ageGroup?.length) specObj['Age Group'] = obj.ageGroup;
    if (obj.type) specObj['Type'] = obj.type;
    obj.specifications = specObj;
  }
  return obj;
};

export const getProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category && req.query.category !== 'All') {
      filter.category = { $regex: new RegExp(req.query.category, 'i') };
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products.map(mapProductForMart));
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch products', error: e.message });
  }
};

export const getProviderProducts = async (req, res) => {
  try {
    const products = await Product.find({ provider: req.user.id }).sort({ createdAt: -1 });
    res.json(products.map(mapProductForMart));
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch provider products', error: e.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(mapProductForMart(product));
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch product', error: e.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    // Ensure image from body doesn't conflict with file upload or cause casting errors
    delete data.image; 

    console.log("Creating product with sanitized data:", data);
    console.log("User ID from token:", req.user?.id);

    // Automatically set the provider (owner) if authenticated
    data.provider = req.user?.id; 

    if (!data.provider) {
      console.error("CRITICAL: req.user.id is missing!");
      return res.status(403).json({ message: "Provider identification failed. Please re-login." });
    }

    if (req.file) {
      console.log("File received:", req.file.filename);
      data.image = req.file.path.replace(/\\/g, "/"); 
    } else {
      console.log("No file provided in this request.");
    }

    const parseJsonField = (field) => {
      try {
        if (data[field] && typeof data[field] === 'string' && data[field].trim() !== '') {
          data[field] = JSON.parse(data[field]);
        } else if (typeof data[field] === 'string' && data[field].trim() === '') {
          delete data[field]; // Don't try to parse empty strings
        }
      } catch (err) {
        console.warn(`Failed to parse ${field}:`, err.message);
      }
    };

    parseJsonField('specifications');
    parseJsonField('suitableFor');
    parseJsonField('breedSize');
    parseJsonField('ageGroup');

    // Remove empty specifications to avoid subdocument validation errors
    if (Array.isArray(data.specifications)) {
      data.specifications = data.specifications.filter(s => s.key && s.value);
    }

    const product = await Product.create(data);
    console.log("Product saved successfully:", product._id);

    const io = getIO();
    if (io) io.emit("inventory-created", product);
    res.json(product);
  } catch (e) {
    console.error("CRITICAL: Product Creation Failed", e);
    
    // Extract validation error details if available
    let errorMsg = e.message;
    if (e.errors) {
      errorMsg = Object.values(e.errors).map(err => err.message).join(", ");
    }
    
    res.status(500).json({ message: "Failed to create product", error: errorMsg });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    delete data.image; // Sanitize image from body

    console.log(`Updating product ${id} with sanitized data:`, data);

    if (req.file) {
      data.image = req.file.path.replace(/\\/g, "/"); 
    }

    const parseJsonField = (field) => {
      try {
        if (data[field] && typeof data[field] === 'string' && data[field].trim() !== '') {
          data[field] = JSON.parse(data[field]);
        } else if (typeof data[field] === 'string' && data[field].trim() === '') {
          delete data[field];
        }
      } catch (err) {
        console.warn(`Failed to parse ${field}:`, err.message);
      }
    };

    parseJsonField('specifications');
    parseJsonField('suitableFor');
    parseJsonField('breedSize');
    parseJsonField('ageGroup');

    if (Array.isArray(data.specifications)) {
      data.specifications = data.specifications.filter(s => s.key && s.value);
    }

    const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    
    console.log("Product updated successfully:", id);

    const io = getIO();
    if (io) io.emit("inventory-updated", product);
    res.json(product);
  } catch (e) {
    console.error("CRITICAL: Product Update Failed", e);
    
    // Extract validation error details
    let errorMsg = e.message;
    if (e.errors) {
      errorMsg = Object.values(e.errors).map(err => err.message).join(", ");
    }
    
    res.status(500).json({ message: "Failed to update product", error: errorMsg });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  const io = getIO();
  if (io) io.emit("inventory-deleted", { id });
  res.json({ id });
};
