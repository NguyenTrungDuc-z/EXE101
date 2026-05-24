import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import { 
  Search, Filter, LayoutGrid, Brush, Zap, Wrench, Snowflake, 
  Star, ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react';
import './Service.css';

// 1. CÁC HÀM HỖ TRỢ
const formatCurrency = (amount) => {
  if (!amount) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

const getCategoryIcon = (iconString) => {
  switch (iconString) {
    case 'cleaning_services': return <Brush size={18} />;
    case 'build': return <Wrench size={18} />;
    case 'plumbing': return <Zap size={18} />;
    case 'ac_unit': return <Snowflake size={18} />;
    default: return <LayoutGrid size={18} />;
  }
};

export default function Service() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  // 2. KHỞI TẠO STATE (Đổi providers thành services)
  const [dbData, setDbData] = useState({ categories: [], services: [] });
  const [isLoading, setIsLoading] = useState(true);

  // STATE CHO BỘ LỌC (FILTERS)
  const [searchTerm, setSearchTerm] = useState(''); 
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all'); 
  const [maxPrice, setMaxPrice] = useState(500000); 
  const [minRating, setMinRating] = useState(0); 

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  // 3. FETCH DATA TỪ JSON-SERVER (Bảng services)
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:9999/categories').then(res => res.json()),
      fetch('http://localhost:9999/services').then(res => res.json())
    ])
    .then(([categoriesData, servicesData]) => {
      setDbData({ 
        categories: categoriesData, 
        services: servicesData 
      });
      setIsLoading(false);
    })
    .catch(error => {
      console.error("Lỗi khi tải dữ liệu từ API:", error);
      setIsLoading(false);
    });
  }, []);

  // Hàm lấy tên danh mục
  const getCategoryName = (catId) => {
    if (!dbData || !dbData.categories) return "Dịch vụ khác";
    const category = dbData.categories.find(c => String(c.id) === String(catId));
    return category ? category.name : "Dịch vụ khác";
  };

  // 4. LOGIC LỌC DỮ LIỆU DỰA TRÊN dbData.services
  const filteredServices = (dbData.services || []).filter((service) => {
    const matchesSearch = 
      (service.title && service.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = selectedCategory === 'all' || String(service.category_id) === String(selectedCategory);
    
    const matchesPrice = service.basePriceHour <= maxPrice; 
    const matchesRating = service.rating >= minRating;

    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', fontSize: '18px', color: '#6b7280' }}>
        Đang tải danh sách dịch vụ...
      </div>
    );
  }

  return (
    <div className="service-page">
      
      {/* THANH TÌM KIẾM */}
      <div className="service-top-search">
        <Search className="search-icon-top" size={20} />
        <input 
          type="text" 
          placeholder="Tìm kiếm dịch vụ (VD: dọn nhà, sửa máy lạnh)..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      <div className="service-layout">
        
        {/* CỘT TRÁI - SIDEBAR BỘ LỌC */}
        <div className="service-sidebar">
          <div className="filter-header">
            <Filter size={20} color="#2563eb" />
            Bộ lọc tìm kiếm
          </div>

          {/* LỌC DANH MỤC */}
          <div className="filter-section">
            <div className="filter-title">Danh mục</div>
            <div className="category-list">
              <div 
                className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                <LayoutGrid size={18} /> Tất cả dịch vụ
              </div>
              {dbData.categories.map((cat) => (
                <div 
                  key={cat.id}
                  className={`category-item ${String(selectedCategory) === String(cat.id) ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)} 
                >
                  {getCategoryIcon(cat.icon)} {cat.name}
                </div>
              ))}
            </div>
          </div>

          {/* LỌC KHOẢNG GIÁ THEO GIỜ */}
          <div className="filter-section">
            <div className="filter-title">
              Giá tối đa/giờ: <span style={{color: '#2563eb', fontWeight: 'bold'}}>{formatCurrency(maxPrice)}</span>
            </div>
            <input 
              type="range" 
              min="50000" 
              max="500000" 
              step="10000" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))} 
              className="price-slider" 
            />
            <div className="price-range-labels">
              <span>50.000Đ</span>
              <span>2.000.000Đ</span>
            </div>
          </div>

         {/* LỌC ĐÁNH GIÁ */}
          <div className="filter-section">
            <div className="filter-title">ĐÁNH GIÁ TRUNG BÌNH</div>
            <div className="rating-filter-list">
              
              <label className="rating-radio-label">
                <input 
                  type="radio" 
                  name="ratingFilter"
                  value={0} 
                  checked={minRating === 0}
                  onChange={() => setMinRating(0)}
                />
                <span>Tất cả đánh giá</span>
              </label>

              {[5, 4, 3, 2, 1].map((starVal) => (
                <label key={starVal} className="rating-radio-label">
                  <input 
                    type="radio" 
                    name="ratingFilter"
                    value={starVal} 
                    checked={minRating === starVal}
                    onChange={() => setMinRating(starVal)}
                  />
                  <div className="rating-stars">
                    {[...Array(5)].map((_, index) => (
                      <Star 
                        key={index} 
                        size={16} 
                        fill={index < starVal ? "#fbbf24" : "#e5e7eb"} 
                        color={index < starVal ? "#fbbf24" : "#e5e7eb"} 
                      />
                    ))}
                  </div>
                </label>
              ))}
              
            </div>
          </div>
        </div>

        {/* CỘT PHẢI - DANH SÁCH DỊCH VỤ */}
        <div className="service-main">
          <div className="service-results-text">
            Tìm thấy <strong>{filteredServices.length}</strong> kết quả phù hợp
          </div>

          {/* KHI KHÔNG TÌM THẤY KẾT QUẢ */}
          {filteredServices.length === 0 ? (
            <div className="no-results-box">
              <p>Không tìm thấy dịch vụ nào phù hợp với bộ lọc của bạn.</p>
              <button 
                onClick={() => { setSelectedCategory('all'); setSearchTerm(''); setMaxPrice(500000); setMinRating(0); }}
                className="btn-reset-filter"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="service-grid">
              {/* RENDER DANH SÁCH TỪ filteredServices */}
              {filteredServices.map((service) => (
                <div 
                  className="service-card" 
                  key={service.id}
                  onClick={() => navigate(`/service/${service.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  
                  <div className="card-image-wrapper">
                    <div className="card-badge">{getCategoryName(service.category_id)}</div>
                    <img src={service.cover_image} alt={service.title} />
                  </div>
                  
                  <div className="card-body">
                    {/* TÊN DỊCH VỤ */}
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {service.title}
                      <CheckCircle2 size={16} color="#10b981" />
                    </h3>
                    
                    <p className="card-desc" style={{marginBottom: '10px'}}>{service.description}</p>
                    
                    {/* ĐÁNH GIÁ CHUNG DỊCH VỤ */}
                    <div className="card-rating">
                      <Star size={14} fill="#fbbf24" className="star-icon" />
                      <strong>{service.rating}</strong> ({service.total_reviews} đánh giá)
                    </div>

                    {/* GIÁ TIỀN */}
                    <div className="card-price-row">
                      <span className="price-label">Theo giờ:</span>
                      <span className="price-value">{formatCurrency(service.basePriceHour)}/giờ</span>
                    </div>
                    
                    <div className="card-price-row">
                      <span className="price-label">Theo ngày:</span>
                      <span className="price-value">{formatCurrency(service.basePriceDay)}/ngày</span>
                    </div>

                    {/* DÒNG THÔNG BÁO CHO MÔ HÌNH GRAB */}
                    <div className="card-footer" style={{marginTop: '12px', fontSize: '13px', color: '#10b981', fontWeight: '600', display: 'flex', justifyContent: 'center', backgroundColor: '#ecfdf5', padding: '8px', borderRadius: '6px'}}>
                      Hệ thống tự động điều phối thợ
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PHÂN TRANG */}
          {filteredServices.length > 0 && (
            <div className="pagination-wrapper">
              <button className="page-btn"><ChevronLeft size={16} /></button>
              <button className="page-btn active">1</button>
              <button className="page-btn"><ChevronRight size={16} /></button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}