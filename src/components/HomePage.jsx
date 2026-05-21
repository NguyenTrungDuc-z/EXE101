import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
import { 
  Search, Brush, Zap, Wrench, Snowflake,
  LayoutGrid, MapPin, X, Navigation, Loader2
} from 'lucide-react';
import './HomePage.css';

const getCategoryIcon = (iconString) => {
  switch (iconString) {
    case 'cleaning_services': return <Brush size={28} />;
    case 'build': return <Wrench size={28} />;
    case 'plumbing': return <Zap size={28} />;
    case 'ac_unit': return <Snowflake size={28} />;
    default: return <LayoutGrid size={28} />;
  }
};

export default function HomePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Hà Nội, Việt Nam');
  const [searchInput, setSearchInput] = useState(''); 
  const [isLocating, setIsLocating] = useState(false); 
  const [serviceKeyword, setServiceKeyword] = useState('');
  const normalizeText = (text) => {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\u0111/g, 'd')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  useEffect(() => {
    fetch('http://localhost:9999/categories')
      .then(res => res.json())
      .then(catData => {
        setCategories(catData.slice(0, 4)); 
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Lỗi:", error);
        setIsLoading(false);
        toast.error("Không thể tải danh mục dịch vụ");
      });
  }, []);

  const handleSearchWorker = async () => {
    if (!serviceKeyword.trim()) {
      toast.warning("Vui lòng nhập dịch vụ bạn cần tìm!");
      return;
    }

    try {
      const [services, categories] = await Promise.all([
        fetch('http://localhost:9999/services').then(res => res.json()),
        fetch('http://localhost:9999/categories').then(res => res.json())
      ]);

      const categoryMap = new Map(categories.map(c => [String(c.id), c]));
      const serviceAliases = {
        srv_1: ['sua do', 'sua do gia dung', 'sua chua', 'sua dien', 'sua quat', 'sua may'],
        srv_2: ['don dep', 'lau nha', 've sinh nha', 'quet nha', 'lau don'],
        srv_3: ['ve sinh may lanh', 'bao duong may lanh', 'sua may lanh', 'nap gas']
      };

      const keyword = normalizeText(serviceKeyword);
      const matchedService = services.find(s => {
        const category = categoryMap.get(String(s.category_id));
        const baseKeywords = [
          s.title,
          s.slug,
          s.description,
          ...(Array.isArray(s.features) ? s.features : []),
          category?.name,
          category?.slug,
          ...(serviceAliases[s.id] || [])
        ]
          .map(normalizeText)
          .filter(Boolean);

        return baseKeywords.some(k => k.includes(keyword) || keyword.includes(k));
      });

      if (!matchedService) {
        toast.error("Không tìm thấy công việc này trong dữ liệu. Vui lòng thử từ khóa khác!");
        return;
      }

      toast.promise(
        new Promise(resolve => setTimeout(resolve, 1500)),
        {
          pending: '🚀 Đang quét tìm thợ gần bạn...',
          success: `Đã tìm thấy thợ cho: ${serviceKeyword}`,
          error: 'Lỗi hệ thống'
        }
      ).then(() => {
          navigate(`/service/${matchedService.id}`);
      });
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối. Vui lòng thử lại!");
    }
  };

  const handleGetMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ GPS!");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`);
          const data = await response.json();
          const address = data?.display_name || `${latitude}, ${longitude}`;
          setSearchInput(address);
          toast.success("Đã xác định được vị trí!");
        } catch (error) {
          toast.error("Lỗi lấy địa chỉ từ GPS");
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        toast.error("Bạn đã từ chối quyền truy cập vị trí.");
        setIsLocating(false);
      }
    );
  };

  const handleConfirmLocation = () => {
    if (searchInput.trim()) {
      setSelectedLocation(searchInput);
      toast.success("Địa chỉ đã được cập nhật!");
      setIsMapModalOpen(false);
    } else {
      toast.warning("Vui lòng nhập hoặc chọn một địa chỉ!");
    }
  };

  return (
    <div className="homepage-wrapper">
      <section className="hero-container">
        <div className="hero-left">
          <h1 className="hero-title">Dịch vụ Gia đình <br /><span className="highlight">Chuyên nghiệp</span></h1>
          <p className="hero-subtitle">Kết nối thợ sửa chữa, vệ sinh uy tín chỉ trong 30 phút.</p>
          
          <div className="search-and-location-box">
            <div className="location-selector" onClick={() => {
                setIsMapModalOpen(true);
                setSearchInput(selectedLocation); // Reset input modal về vị trí hiện tại
            }}>
              <MapPin size={20} color="#ef4444" />
              <span className="location-text">{selectedLocation}</span>
              <span className="change-link">Thay đổi</span>
            </div>
            <div className="search-box">
              <Search color="#9ca3af" size={20} />
              <input 
                type="text" 
                placeholder="Bạn cần sửa gì, dọn gì...?" 
                value={serviceKeyword}
                onChange={(e) => setServiceKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchWorker()}
              />
              <button className="search-btn" onClick={handleSearchWorker}>Tìm thợ</button>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <img src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=800" alt="Thợ" className="main-image" />
        </div>
      </section>

      <section className="services-section">
        <h2 className="section-title">Dịch vụ phổ biến</h2>
        {isLoading ? (
            <div className="loading-container"><Loader2 className="animate-spin" /> Đang tải...</div>
        ) : (
            <div className="services-grid">
            {categories.map((cat) => (
                <div className="service-card" key={cat.id} onClick={() => navigate(`/service?category=${cat.id}`)}>
                <div className="service-icon" style={{color: cat.color}}>{getCategoryIcon(cat.icon)}</div>
                <h3>{cat.name}</h3>
                <p>{cat.description || "Thợ tay nghề cao, phục vụ tận tình."}</p>
                </div>
            ))}
            </div>
        )}
      </section>

      {/* MODAL GOOGLE MAPS */}
      {isMapModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><MapPin size={20} color="#ef4444" /> Xác nhận địa chỉ</h3>
              <button className="close-btn" onClick={() => setIsMapModalOpen(false)}><X size={24} /></button>
            </div>
            <div className="modal-body">
              <div className="map-input-group">
                <input 
                    type="text" 
                    placeholder="Nhập địa chỉ nhà bạn..." 
                    value={searchInput} 
                    onChange={(e) => setSearchInput(e.target.value)} 
                />
                <button className="gps-btn" onClick={handleGetMyLocation} disabled={isLocating}>
                  {isLocating ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
                  {isLocating ? '...' : 'Vị trí tôi'}
                </button>
              </div>
              <div className="map-iframe-container">
                <iframe 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(searchInput || "Hà Nội")}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  title="map"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsMapModalOpen(false)}>Hủy</button>
              <button className="btn-confirm" onClick={handleConfirmLocation}>Xác nhận địa chỉ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}










