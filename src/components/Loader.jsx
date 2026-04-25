const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{message}</p>
    </div>
  );
};

export default Loader;
