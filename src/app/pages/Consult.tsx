import { useState } from "react";
import { Search, Star, MapPin, Video, MessageCircle, ChevronLeft, Send, Phone, Store, Hospital } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet default icon fix
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons for different types
const hospitalIcon = L.divIcon({
  className: "bg-transparent",
  html: `<div style="background-color: #D94F8A; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">H</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const storeIcon = L.divIcon({
  className: "bg-transparent",
  html: `<div style="background-color: #4F46E5; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">S</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function Consult() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatMsg, setChatMsg] = useState("");
  const [mapFilter, setMapFilter] = useState<"All" | "Hospital" | "Store">("All");
  const lang = (localStorage.getItem("lang") || "ID").toLowerCase() as 'en' | 'id';

  const t = {
    en: {
      title: "Consultation & Map 🩺",
      subtitle: "Connect with doctors or find nearby hospitals and stores",
      searchPlaceholder: "Search doctors by name or specialty...",
      availableDoctors: "Available Doctors",
      hospitalStoreMap: "Hospitals & Stores Map",
      all: "All",
      hospital: "Hospital",
      store: "Store",
      book: "Book",
      chatBtn: "Chat",
      call: "Call",
      drMsg: "Hello, I am ready to consult. What symptoms are you experiencing?",
      userMsgWait: "Thank you for the information. A doctor will be with you shortly.",
      typeMsg: "Type a message...",
      mapTitle: "Map View",
      getDirections: "Get Directions",
      nearbyClinics: "Find Virelia™ products or Hospitals",
      hospitals: "Hospitals & Clinics",
      stores: "Stores selling Virelia™"
    },
    id: {
      title: "Konsultasi & Peta 🩺",
      subtitle: "Terhubung dengan dokter atau cari rumah sakit dan toko terdekat",
      searchPlaceholder: "Cari dokter berdasarkan nama atau spesialisasi...",
      availableDoctors: "Dokter Tersedia",
      hospitalStoreMap: "Peta Rumah Sakit & Toko",
      all: "Semua",
      hospital: "Rumah Sakit",
      store: "Toko",
      book: "Pesan",
      chatBtn: "Obrolan",
      call: "Panggilan",
      drMsg: "Halo, saya siap untuk konsultasi. Gejala apa yang Anda alami?",
      userMsgWait: "Terima kasih atas informasinya. Dokter akan segera melayani Anda.",
      typeMsg: "Ketik pesan...",
      mapTitle: "Tampilan Peta",
      getDirections: "Dapatkan Arah",
      nearbyClinics: "Temukan produk Virelia™ atau Rumah Sakit",
      hospitals: "Rumah Sakit & Klinik",
      stores: "Toko yang menjual Virelia dip test™"
    }
  };

  const currentT = t[lang] || t.id;

  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "doctor", text: currentT.drMsg },
  ]);

  const doctors = [
    {
      id: 1,
      name: "Dr. Amanda White",
      spec: lang === 'en' ? "Obgyn Specialist" : "Spesialis Kandungan",
      rating: "4.9",
      exp: "8 Yrs",
      img: "https://images.unsplash.com/photo-1758691463606-1493d79cc577?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwY29uc3VsdGF0aW9uJTIwZG9jdG9yfGVufDF8fHx8MTc3ODYyNjQ4N3ww&ixlib=rb-4.1.0&q=80&w=200",
      status: "Online",
    },
    {
      id: 2,
      name: "Dr. Sarah Lee",
      spec: lang === 'en' ? "Gynecologist" : "Ginekolog",
      rating: "4.8",
      exp: "12 Yrs",
      img: "https://images.unsplash.com/photo-1758691463606-1493d79cc577?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwY29uc3VsdGF0aW9uJTIwZG9jdG9yfGVufDF8fHx8MTc3ODYyNjQ4N3ww&ixlib=rb-4.1.0&q=80&w=200",
      status: "Busy",
    },
    {
      id: 3,
      name: "Dr. Michael Chen",
      spec: lang === 'en' ? "General Practitioner" : "Dokter Umum",
      rating: "4.7",
      exp: "5 Yrs",
      img: "https://images.unsplash.com/photo-1758691463606-1493d79cc577?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwY29uc3VsdGF0aW9uJTIwZG9jdG9yfGVufDF8fHx8MTc3ODYyNjQ4N3ww&ixlib=rb-4.1.0&q=80&w=200",
      status: "Offline",
    },
  ];

  // Map Data
  const mapCenter: [number, number] = [-6.200000, 106.816666]; // Jakarta Center for Demo
  const mapLocations = [
    { id: 1, name: "RSIA Grand Family", type: "Hospital", lat: -6.1950, lng: 106.8200, dist: "1.2 km", info: "Dr. Amanda White available here" },
    { id: 2, name: "Guardian Pharmacy Senayan", type: "Store", lat: -6.2050, lng: 106.8100, dist: "0.8 km", info: "CERVISCAN™ Kits In Stock" },
    { id: 3, name: "Siloam Hospital Center", type: "Hospital", lat: -6.2100, lng: 106.8250, dist: "2.4 km", info: "24/7 Maternity Emergency" },
    { id: 4, name: "Klinik Sehat Utama", type: "Hospital", lat: -6.1850, lng: 106.8100, dist: "3.0 km", info: "General checkup available" },
    { id: 5, name: "Kimia Farma Sudirman", type: "Store", lat: -6.2200, lng: 106.8000, dist: "4.1 km", info: "CERVISCAN™ Kits In Stock" },
  ];

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.spec.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLocations = mapFilter === "All" ? mapLocations : mapLocations.filter(loc => loc.type === mapFilter);

  const handleAction = (action: string, docName: string) => {
    if (action === "Chat" || action === "Obrolan") {
      setActiveChat(docName);
      setChatMessages([
        { id: 1, sender: "doctor", text: lang === 'en' ? `Hello, I'm ${docName}. How can I assist you with your reproductive health today?` : `Halo, saya ${docName}. Ada yang bisa saya bantu terkait kesehatan reproduksi Anda hari ini?` },
      ]);
    } else {
      toast.success(lang === 'en' ? `Opening ${action} session with ${docName}...` : `Membuka sesi ${action} dengan ${docName}...`);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    setChatMessages([...chatMessages, { id: Date.now(), sender: "user", text: chatMsg }]);
    setChatMsg("");
    setTimeout(() => {
      setChatMessages(prev => [...prev, { id: Date.now(), sender: "doctor", text: currentT.userMsgWait }]);
    }, 1500);
  };

  if (activeChat) {
    const doctor = doctors.find((d) => d.name === activeChat);
    return (
      <div className="flex-1 p-0 md:p-8 lg:p-10 flex flex-col relative max-w-4xl mx-auto w-full">
        <div className="bg-white md:rounded-3xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveChat(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden relative">
                  <img src={doctor?.img} alt={doctor?.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{doctor?.name}</h3>
                  <p className="text-xs text-green-500 font-medium">Online</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toast.success(lang === 'en' ? "Calling doctor..." : "Memanggil dokter...")}
                className="w-10 h-10 rounded-full bg-pink-50 text-[#D94F8A] flex items-center justify-center hover:bg-pink-100"
              >
                <Phone size={18} />
              </button>
              <button
                onClick={() => toast.success(lang === 'en' ? "Starting video call..." : "Memulai panggilan video...")}
                className="w-10 h-10 rounded-full bg-pink-50 text-[#D94F8A] flex items-center justify-center hover:bg-pink-100"
              >
                <Video size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-4">
            <div className="text-center text-xs text-gray-400 font-medium my-2">Today, 10:42 AM</div>
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#D94F8A] text-white rounded-tr-sm shadow-md shadow-pink-200/50"
                      : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-3 items-center">
            <input
              type="text"
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              placeholder={currentT.typeMsg}
              className="flex-1 bg-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
            <button
              type="submit"
              className="w-12 h-12 rounded-2xl bg-[#D94F8A] text-white flex items-center justify-center hover:bg-pink-600 transition-colors shadow-sm"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-10 flex flex-col relative max-w-7xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{currentT.title}</h1>
        <p className="text-gray-500 text-sm md:text-base mt-2 font-medium">{currentT.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Search & List) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
          {/* Search */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#D94F8A] transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 shadow-sm rounded-2xl text-sm focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all outline-none font-medium"
              placeholder={currentT.searchPlaceholder}
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            <h3 className="text-lg font-bold text-gray-900">{currentT.availableDoctors}</h3>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-white rounded-3xl border border-gray-100">
              <Search size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="font-medium">{lang === 'en' ? "No doctors found matching your search." : "Tidak ada dokter yang cocok dengan pencarian Anda."}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDoctors.map((doc, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={doc.id}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-all group"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden relative flex-shrink-0">
                      <img
                        src={doc.img}
                        alt={doc.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div
                        className={`absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                          doc.status === "Online" ? "bg-green-500" : doc.status === "Busy" ? "bg-orange-500" : "bg-gray-400"
                        }`}
                      ></div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-bold text-gray-900 text-base">{doc.name}</h4>
                      <p className="text-xs text-[#D94F8A] font-bold mt-0.5">{doc.spec}</p>

                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-700 font-bold bg-yellow-50 px-1.5 py-0.5 rounded-md border border-yellow-100">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          {doc.rating}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">{doc.exp}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-gray-50 pt-3">
                    <button
                      onClick={() => handleAction(currentT.chatBtn, doc.name)}
                      disabled={doc.status === "Offline"}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl flex justify-center items-center gap-2 text-xs font-bold hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageCircle size={16} /> {currentT.chatBtn}
                    </button>
                    <button
                      onClick={() => handleAction(currentT.call, doc.name)}
                      disabled={doc.status === "Offline"}
                      className="flex-1 bg-pink-50 text-[#D94F8A] py-2 rounded-xl flex justify-center items-center gap-2 text-xs font-bold hover:bg-pink-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Video size={16} /> {currentT.call}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (Leaflet Map) */}
        <div className="lg:col-span-7 xl:col-span-8 order-1 lg:order-2 flex flex-col">
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 flex-1 flex flex-col min-h-[400px] md:min-h-[500px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <div>
                <h3 className="font-bold text-gray-900 text-xl">{currentT.hospitalStoreMap}</h3>
                <p className="text-sm text-gray-500">{currentT.nearbyClinics}</p>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {(["All", "Hospital", "Store"] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setMapFilter(type)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${mapFilter === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {type === "All" ? currentT.all : type === "Hospital" ? currentT.hospital : currentT.store}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 rounded-2xl overflow-hidden relative border border-gray-200 z-0 bg-gray-50">
              <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {filteredLocations.map(loc => (
                  <Marker 
                    key={loc.id} 
                    position={[loc.lat, loc.lng]} 
                    icon={loc.type === "Hospital" ? hospitalIcon : storeIcon}
                  >
                    <Popup className="rounded-xl overflow-hidden shadow-xl border-0">
                      <div className="p-1">
                        <div className="flex items-center gap-2 mb-2">
                          {loc.type === "Hospital" ? <Hospital size={16} className="text-[#D94F8A]" /> : <Store size={16} className="text-indigo-600" />}
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider ${loc.type === 'Hospital' ? 'text-[#D94F8A]' : 'text-indigo-600'}`}>
                            {loc.type}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">{loc.name}</h4>
                        <p className="text-xs text-gray-600 font-medium mb-3">{loc.info}</p>
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs font-bold text-gray-400">{loc.dist} {lang === 'en' ? "away" : "jauhnya"}</span>
                          <button 
                            onClick={() => toast.success(lang === 'en' ? `Navigating to ${loc.name}...` : `Menavigasi ke ${loc.name}...`)}
                            className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            {currentT.getDirections}
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#D94F8A] text-white flex items-center justify-center text-[8px] font-bold">H</div>
                <span className="font-medium text-gray-600">{currentT.hospitals}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[8px] font-bold">S</div>
                <span className="font-medium text-gray-600">{currentT.stores}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
