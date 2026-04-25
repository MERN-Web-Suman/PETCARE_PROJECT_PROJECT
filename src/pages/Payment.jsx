import { useState, useContext } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC || "pk_test_51234567890abcdefghijklmnopqrstuvwxyz"
);

const CheckoutForm = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements) return;

    try {
      setLoading(true);

      // Create payment intent
      const { data } = await axios.post(
        "http://localhost:5001/api/payment/create-intent",
        { amount },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      // Confirm payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: "Pet Owner" }
        }
      });

      if (result.paymentIntent?.status === "succeeded") {
        onSuccess(result.paymentIntent);
      } else {
        setError("Payment failed: " + (result.error?.message || "Unknown error"));
      }
    } catch (err) {
      setError("Error processing payment: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-300 rounded-lg p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": { color: "#aab7c4" }
              }
            }
          }}
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition"
      >
        {loading ? "Processing..." : `Pay ₹${amount}`}
      </button>
    </form>
  );
};

const Payment = () => {
  const { user } = useContext(AuthContext);
  const [amount, setAmount] = useState(500);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedService, setSelectedService] = useState("consultation");

  const services = [
    { id: "consultation", name: "Online Vet Consultation", price: 500 },
    { id: "checkup", name: "General Pet Checkup", price: 1000 },
    { id: "vaccination", name: "Vaccination Package", price: 1500 },
    { id: "grooming", name: "Pet Grooming", price: 800 }
  ];

  const handleServiceSelect = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    setSelectedService(serviceId);
    setAmount(service.price);
  };

  const handlePaymentSuccess = (paymentIntent) => {
    setPaymentSuccess(true);
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 font-outfit">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center">
          <div className="text-6xl mb-6 opacity-30">🔒</div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Please login to proceed with secure payment</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-outfit">
      <Navbar />
      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h1 className="text-4xl font-black text-center text-gray-900 mb-12 flex items-center justify-center gap-4">
          <span className="text-blue-500">💳</span> Secure Payment
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Services Selection */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-widest text-sm">Select a Service</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className={`p-6 rounded-3xl border-2 transition-all text-left ${
                    selectedService === service.id
                      ? "bg-blue-50 border-blue-500 shadow-lg shadow-blue-100 scale-[1.02]"
                      : "bg-white border-gray-100 hover:border-blue-200 shadow-sm"
                  }`}
                >
                  <h3 className="font-bold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-2xl font-black text-blue-600">₹{service.price}</p>
                </button>
              ))}
            </div>

            {/* Payment Form */}
            {!paymentSuccess ? (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-widest text-sm">Payment Details</h3>
                <Elements stripe={stripePromise}>
                  <CheckoutForm amount={amount} onSuccess={handlePaymentSuccess} />
                </Elements>
              </div>
            ) : (
              <div className="bg-green-50 border-2 border-green-500 rounded-3xl p-12 text-center shadow-lg shadow-green-100 animate-fade-in relative overflow-hidden">
                <div className="absolute -right-8 -top-8 text-9xl opacity-10">✅</div>
                <h3 className="text-3xl font-black text-green-700 mb-4 relative z-10">Payment Successful!</h3>
                <p className="text-green-800 font-bold mb-4 relative z-10">Your service has been booked successfully.</p>
                <p className="text-sm text-green-700 font-bold uppercase tracking-widest relative z-10">Confirmation has been sent to your email.</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 h-fit sticky top-32">
            <h3 className="text-2xl font-black mb-8">Order Summary</h3>

            <div className="space-y-4 mb-8 border-b border-indigo-400/30 pb-8">
              <div className="flex justify-between items-center text-indigo-100">
                <span className="font-bold">Service</span>
                <span className="font-black text-white text-right max-w-[60%]">
                  {services.find(s => s.id === selectedService)?.name}
                </span>
              </div>
              <div className="flex justify-between items-center text-indigo-100">
                <span className="font-bold">Duration</span>
                <span className="font-black text-white">1 Hour</span>
              </div>
              <div className="flex justify-between items-center text-indigo-100">
                <span className="font-bold">Date</span>
                <span className="font-black text-white">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-indigo-100 text-sm">
                <span className="font-bold uppercase tracking-widest">Subtotal</span>
                <span className="font-black text-white">₹{amount}</span>
              </div>
              <div className="flex justify-between items-center text-indigo-100 text-sm">
                <span className="font-bold uppercase tracking-widest">Tax (5%)</span>
                <span className="font-black text-white">₹{Math.round(amount * 0.05)}</span>
              </div>
            </div>

            <div className="border-t border-indigo-400/30 pt-6">
              <div className="flex justify-between items-end">
                <span className="text-xl font-black">Total</span>
                <span className="text-4xl font-black text-white">₹{Math.round(amount * 1.05)}</span>
              </div>
            </div>

            <div className="mt-8 bg-indigo-700/50 rounded-2xl p-4 flex gap-3 text-indigo-100">
              <span className="text-xl">🔒</span>
              <p className="text-xs font-bold leading-relaxed">
                Payment is secured by Stripe. Your information is encrypted and never stored on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white border border-gray-100 rounded-3xl p-10 mt-6 shadow-sm">
          <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
            <span className="text-blue-500">❓</span> Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-3">Can I cancel my booking?</h4>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">Yes, you can cancel up to 24 hours before the service for a full refund to your original payment method.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-3">Is my payment secure?</h4>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">Absolutely. We use Stripe for universally recognized secure, PCI-compliant payment processing.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-3">Will I get a receipt?</h4>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">Yes, you'll receive a detailed receipt via email immediately after your payment is successfully processed.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Payment;
