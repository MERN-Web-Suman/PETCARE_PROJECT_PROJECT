import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Clinics = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/clinics");
        setClinics(res.data);
      } catch (err) {
        console.error("Failed to fetch clinics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-outfit">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4OCIgaGVpZ2h0PSI4OCI+CjxwYXRoIGQ9Ik04OCA4OEgwek0wIDBoODh6IiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik00NCA0NEw0MCA0MGg4bC00IDR6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4zIi8+Cjwvc3ZnPg==')]"></div>
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tight animate-fade-in-up">Find Expert Pet Care</h1>
          <p className="text-xl opacity-90 font-bold max-w-2xl mx-auto drop-shadow-sm">
            Discover and book the best veterinarians and specialty clinics in your area.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        ) : clinics.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] shadow-sm border border-gray-100">
            <span className="text-6xl mb-6 block">🩺</span>
            <h2 className="text-3xl font-black text-gray-800 mb-2">No Clinics Available</h2>
            <p className="text-gray-500 font-bold">Check back later for new veterinary listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {clinics.map((clinic) => (
              <Link 
                key={clinic._id} 
                to={`/clinic/${clinic._id}`}
                className="group bg-white rounded-[40px] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col"
              >
                <div className="relative h-64 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                  <span className="text-8xl opacity-20 filter blur-[1px] absolute transform -rotate-12">🩺</span>
                  <div className="relative z-10 text-6xl drop-shadow-2xl">🏥</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 inline-block">
                      {clinic.specialization}
                    </span>
                    <h3 className="text-white text-2xl font-black drop-shadow-md leading-tight">
                      {clinic.doctorName}
                    </h3>
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 font-black text-xl">
                        🐾
                      </div>
                      <h4 className="text-xl font-black text-gray-800">{clinic.name}</h4>
                   </div>
                   
                   <p className="text-gray-500 font-bold text-sm mb-6 flex-1 line-clamp-2 italic">
                     "{clinic.doctorAbout || `Expert pet care at ${clinic.name}.`}"
                   </p>
                   
                   <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500 text-xs font-black uppercase tracking-widest bg-green-50 px-2 py-1 rounded">Open</span>
                      </div>
                      <span className="text-blue-600 font-black text-sm uppercase tracking-tight group-hover:translate-x-2 transition-transform duration-300">
                        View Profile →
                      </span>
                   </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Clinics;
