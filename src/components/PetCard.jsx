const PetCard = ({ pet, onClick, actionBtn = null }) => {
  if (!pet) return null;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:5001/${imagePath}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all cursor-pointer transform border-l-4 border-secondary-500" onClick={onClick}>
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
        {pet.image ? (
          <img src={getImageUrl(pet.image)} alt={pet.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-6xl">🐾</div>
        )}
        {pet.hasAppointment && pet.status === 'Sold' && (
          <div className="absolute inset-0 z-30 bg-white/60 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl transform -rotate-12 border-4 border-white scale-110">
              Adopted
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-gray-800">{pet.name}</h3>
          <span className="bg-gradient-primary text-white text-xs font-bold px-3 py-1 rounded-full">{pet.type || "Pet"}</span>
        </div>
        <div className="space-y-2 text-sm text-gray-600 mb-3">
          <p><strong className="text-gray-800">Breed:</strong> {pet.breed}</p>
          {pet.age && <p><strong className="text-gray-800">Age:</strong> {pet.age}</p>}
          {pet.hasAppointment && (
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${pet.status === 'Sold' ? 'bg-red-500' : 'bg-green-500'}`}></span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${pet.status === 'Sold' ? 'text-red-500' : 'text-green-500'}`}>
                {pet.status === 'Sold' ? 'Adopted' : 'Available'}
              </span>
            </div>
          )}
        </div>
        {pet.owner && (
          <p className="text-xs text-gray-500 mb-3">Owner: {typeof pet.owner === 'object' ? pet.owner.name : pet.owner}</p>
        )}
        <div className="flex gap-2">
          <button 
            disabled={pet.status === 'Sold'}
            className={`flex-1 py-2 rounded-lg font-bold transition text-[10px] uppercase tracking-wider ${pet.status === 'Sold' ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:opacity-90'}`}
            onClick={(e) => {
              e.stopPropagation();
              if (pet.status === 'Sold') return;
              if (actionBtn && actionBtn.onAdopt) {
                actionBtn.onAdopt();
              } else if (window.onPetAdopt) {
                window.onPetAdopt(pet);
              }
            }}
          >
            Adopt
          </button>
          <button 
            disabled={pet.status === 'Sold'}
            className={`flex-1 py-2 rounded-lg font-bold transition text-[10px] uppercase tracking-wider ${pet.status === 'Sold' ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:opacity-90'}`}
            onClick={(e) => {
              e.stopPropagation();
              if (pet.status === 'Sold') return;
              if (actionBtn && actionBtn.onOuting) {
                actionBtn.onOuting();
              } else if (window.onPetOuting) {
                window.onPetOuting(pet);
              }
            }}
          >
            Outing
          </button>
        </div>
        {actionBtn && (
          <button className="w-full mt-2 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 transition text-[10px] uppercase tracking-wider" onClick={(e) => {
            e.stopPropagation();
            actionBtn.onClick();
          }}>
            {actionBtn.label}
          </button>
        )}
        
        {/* Owner Quick Status Toggle */}
        {actionBtn?.isOwner && (pet.hasAppointment || pet.status === 'Sold') && (
           <button 
             className={`w-full mt-2 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all border-2 ${
               pet.status === 'Sold' 
                 ? 'bg-white border-green-500 text-green-600 hover:bg-green-50' 
                 : 'bg-white border-red-500 text-red-600 hover:bg-red-50'
             }`}
             onClick={(e) => {
               e.stopPropagation();
               if (actionBtn.onStatusToggle) {
                 actionBtn.onStatusToggle(pet._id, pet.status === 'Sold' ? 'Available' : 'Sold');
               }
             }}
           >
             {pet.status === 'Sold' ? 'Re-list as Available 🔙' : 'Mark as Adopted 🏆'}
           </button>
        )}
      </div>
    </div>
  );
};

export default PetCard;
