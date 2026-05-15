import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link, useLocation, useParams } from 'react-router-dom';
import { Home, PlusSquare, User, Search, MapPin, Phone, CheckCircle2, XCircle, ChevronRight, LayoutGrid, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Business {
  id: string;
  ownerName: string;
  businessName: string;
  skillArea: string;
  location: string;
  productCategory: string;
  description: string;
  dailyCapacity: number;
  capacityUnit: string;
  bulkPrice: string;
  phoneNumber: string;
  imageUrl: string;
  isAvailable: boolean;
  weeklyCapacity: number;
  ownerId: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
}

// --- Components ---

const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { name: 'Browse', path: '/', icon: Home },
    { name: 'Add', path: '/add', icon: PlusSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-3 px-6 z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-primary-green" : "text-gray-400"
            )}
          >
            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium uppercase tracking-wider">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

const BusinessCard = ({ business }: { business: Business }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-4 group"
    >
      <Link to={`/business/${business.id}`}>
        <div className="relative h-48 w-full">
          <img
            src={business.imageUrl}
            alt={business.businessName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-4 right-4">
            <span className={business.isAvailable ? "availability-badge-ready" : "availability-badge-busy"}>
              {business.isAvailable ? "Ready to Produce" : "Currently Busy"}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
             <span className="text-white text-xs font-medium px-2 py-1 bg-accent-amber/90 rounded-md backdrop-blur-sm">
                {business.productCategory}
             </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{business.businessName}</h3>
          <p className="text-sm text-primary-green font-semibold mb-2">{business.skillArea}</p>
          
          <div className="flex items-center gap-3 text-gray-500 text-sm mb-3">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{business.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <LayoutGrid size={14} />
              <span>{business.dailyCapacity} {business.capacityUnit.split('/')[0]}/day</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <span className="text-gray-900 font-bold">{business.bulkPrice}</span>
            <div className="text-primary-green flex items-center gap-1 text-sm font-medium">
              View Profile <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// --- Pages ---

const HomePage = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetch('/api/businesses')
      .then(res => res.json())
      .then(data => setBusinesses(data));
  }, []);

  const filtered = businesses.filter(b => {
    const matchesSearch = b.businessName.toLowerCase().includes(search.toLowerCase()) || 
                         b.skillArea.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || b.productCategory === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pb-24 px-4 pt-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kutira-Kushala</h1>
        <p className="text-gray-500">Connecting bulk buyers with village entrepreneurs.</p>
      </header>

      <div className="flex flex-col gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 shadow-sm" size={20} />
          <input
            type="text"
            placeholder="Search skills or business names..."
            className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["All", "Food", "Craft", "Textile", "Other"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                category === cat 
                  ? "bg-primary-green text-white shadow-md shadow-green-200" 
                  : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">No micro-factories found in this category.</p>
        </div>
      )}
    </div>
  );
};

const BusinessDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/businesses/${id}`)
      .then(res => res.json())
      .then(data => setBusiness(data));
  }, [id]);

  if (!business) return <div className="p-10 text-center">Loading profile...</div>;

  return (
    <div className="pb-24">
      <div className="relative h-[40vh] w-full">
        <img src={business.imageUrl} className="w-full h-full object-cover" alt="" />
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg"
        >
          <ChevronRight className="rotate-180" size={24} />
        </button>
      </div>

      <div className="px-6 -mt-10 relative bg-white rounded-t-[40px] pt-8 min-h-[60vh] bottom-card-shadow">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{business.businessName}</h1>
            <div className="flex items-center gap-2 text-primary-green font-bold">
              <CheckCircle2 size={18} />
              <span>{business.skillArea}</span>
            </div>
          </div>
          <span className={business.isAvailable ? "availability-badge-ready" : "availability-badge-busy"}>
            {business.isAvailable ? "Ready" : "Busy"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <span className="text-xs text-gray-400 block mb-1">Owner Name</span>
            <span className="font-semibold text-gray-800">{business.ownerName}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <span className="text-xs text-gray-400 block mb-1">Bulk Price</span>
            <span className="font-bold text-primary-green">{business.bulkPrice}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <span className="text-xs text-gray-400 block mb-1">Daily Capacity</span>
            <span className="font-semibold text-gray-800">{business.dailyCapacity} {business.capacityUnit.split('/')[0]}</span>
          </div>
           <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <span className="text-xs text-gray-400 block mb-1">Weekly Capacity</span>
            <span className="font-semibold text-gray-800">{business.weeklyCapacity} {business.capacityUnit.split('/')[0]}</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-display font-bold text-lg mb-2">About the Micro-Factory</h3>
          <p className="text-gray-600 leading-relaxed italic border-l-4 border-accent-amber pl-4 py-1">
            "{business.description}"
          </p>
        </div>

        <div className="mb-8">
           <div className="flex items-center gap-2 text-gray-500 mb-4">
             <MapPin size={20} />
             <span className="font-medium">{business.location}</span>
           </div>
        </div>

        <a 
          href={`tel:${business.phoneNumber}`}
          className="w-full bg-primary-green text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-colors"
        >
          <Phone size={22} fill="white" />
          Call to Connect
        </a>
      </div>
    </div>
  );
};

const AddBusinessPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    skillArea: '',
    location: '',
    productCategory: 'Food',
    description: '',
    dailyCapacity: 0,
    capacityUnit: 'units/day',
    bulkPrice: '',
    phoneNumber: '',
    imageUrl: 'https://images.unsplash.com/photo-1590422443890-2a39620b8525?auto=format&fit=crop&q=80&w=800'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        isAvailable: true,
        weeklyCapacity: formData.dailyCapacity * 6,
        ownerId: 'user1' // Hardcoded for demo
      })
    });
    if (res.ok) navigate('/');
  };

  return (
    <div className="pb-24 px-6 pt-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">List Your Business</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
          <input 
            required
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-green"
            placeholder="e.g. Handmade Pottery Hub"
            value={formData.businessName}
            onChange={e => setFormData({...formData, businessName: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Owner Name</label>
            <input 
              required
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none"
              value={formData.ownerName}
              onChange={e => setFormData({...formData, ownerName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select 
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none"
              value={formData.productCategory}
              onChange={e => setFormData({...formData, productCategory: e.target.value})}
            >
              <option>Food</option>
              <option>Craft</option>
              <option>Textile</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
          <input 
            required
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none"
            placeholder="City, State"
            value={formData.location}
            onChange={e => setFormData({...formData, location: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Daily Units</label>
            <input 
              type="number"
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none"
              value={formData.dailyCapacity}
              onChange={e => setFormData({...formData, dailyCapacity: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Type</label>
            <select 
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none"
              value={formData.capacityUnit}
              onChange={e => setFormData({...formData, capacityUnit: e.target.value})}
            >
              <option>units/day</option>
              <option>kg/day</option>
              <option>dozen/day</option>
              <option>packs/day</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Bulk Price (e.g. ₹50/pc)</label>
          <input 
            required
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none"
            value={formData.bulkPrice}
            onChange={e => setFormData({...formData, bulkPrice: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
          <input 
            type="tel"
            required
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none"
            value={formData.phoneNumber}
            onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea 
            rows={3}
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none"
            placeholder="Tell buyers about your story and product quality..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-accent-amber text-white py-4 rounded-2xl font-bold shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all"
        >
          Submit Micro-Factory Listing
        </button>
      </form>
    </div>
  );
};

const ProfilePage = () => {
  const [myBusiness, setMyBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo, we get the first business that belongs to 'user1'
    fetch('/api/businesses')
      .then(res => res.json())
      .then(data => {
        const mine = data.find((b: Business) => b.ownerId === 'user1');
        setMyBusiness(mine || null);
        setLoading(false);
      });
  }, []);

  const toggleAvailability = async () => {
    if (!myBusiness) return;
    const newStatus = !myBusiness.isAvailable;
    const res = await fetch(`/api/businesses/${myBusiness.id}/capacity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: newStatus, weeklyCapacity: myBusiness.weeklyCapacity })
    });
    if (res.ok) setMyBusiness({ ...myBusiness, isAvailable: newStatus });
  };

  const updateWeeklyCapacity = async (val: number) => {
    if (!myBusiness) return;
    const res = await fetch(`/api/businesses/${myBusiness.id}/capacity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: myBusiness.isAvailable, weeklyCapacity: val })
    });
    if (res.ok) setMyBusiness({ ...myBusiness, weeklyCapacity: val });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="pb-24 px-6 pt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <div className="h-12 w-12 bg-primary-green rounded-full flex items-center justify-center text-white font-bold">
          SJ
        </div>
      </div>

      {!myBusiness ? (
        <div className="text-center py-20">
          <Info size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-6">You haven't listed a business yet.</p>
          <Link to="/add" className="bg-primary-green text-white px-8 py-3 rounded-xl font-bold">
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Capacity Meter</h2>
             
             <div className="flex items-center justify-between mb-8">
                <div>
                   <p className="text-lg font-bold text-gray-900">Production Ready</p>
                   <p className="text-sm text-gray-500">Enable when you are open for bulk orders.</p>
                </div>
                <button 
                  onClick={toggleAvailability}
                  className={cn(
                    "relative w-14 h-8 rounded-full transition-colors",
                    myBusiness.isAvailable ? "bg-primary-green" : "bg-gray-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform",
                    myBusiness.isAvailable ? "translate-x-6" : ""
                  )} />
                </button>
             </div>

             <div className="pt-6 border-t border-gray-50">
                <p className="text-lg font-bold text-gray-900 mb-2">Weekly Availability</p>
                <div className="flex items-center gap-4">
                  <input 
                    type="number"
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-2xl text-primary-green"
                    value={myBusiness.weeklyCapacity}
                    onChange={(e) => updateWeeklyCapacity(parseInt(e.target.value) || 0)}
                  />
                  <span className="text-gray-400 font-medium">{myBusiness.capacityUnit.split('/')[0]} total</span>
                </div>
                <p className="mt-4 text-xs text-gray-400 bg-gray-50 p-3 rounded-lg flex items-start gap-2">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  Updating this value will inform buyers of your real-time capacity for the next 7 days.
                </p>
             </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 flex items-center justify-between shadow-sm">
            <div>
               <p className="font-bold text-lg text-gray-900">{myBusiness.businessName}</p>
               <p className="text-sm text-gray-500">{myBusiness.skillArea}</p>
            </div>
            <Link to={`/business/${myBusiness.id}`} className="text-primary-green font-bold text-sm">
              View Public
            </Link>
          </div>
          
          <button 
            onClick={() => {}} 
            className="w-full py-4 text-red-500 font-bold border-2 border-red-50 hover:bg-red-50 rounded-2xl transition-all"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl shadow-gray-200">
        <main className="min-h-screen bg-gray-50/30">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/business/:id" element={<BusinessDetailPage />} />
            <Route path="/add" element={<AddBusinessPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
