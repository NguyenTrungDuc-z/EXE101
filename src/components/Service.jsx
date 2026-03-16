import React, { useState, useEffect } from 'react';
// IMPORT THÊM HOOKS TỪ REACT-ROUTER-DOM
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import { 
  Search, Filter, LayoutGrid, Brush, Zap, Wrench, Snowflake, 
  Star, ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react';
import './Service.css';

// 1. CÁC HÀM HỖ TRỢ
const formatCurrency = (amount) => {
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
  // KHỞI TẠO BIẾN ĐIỀU HƯỚNG VÀ ĐỌC URL
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  // 2. KHỞI TẠO STATE CHO DATA TỪ JSON
  const [dbData, setDbData] = useState({ categories: [], providers: [] });
  const [isLoading, setIsLoading] = useState(true);

  // STATE CHO BỘ LỌC (FILTERS)
  const [searchTerm, setSearchTerm] = useState(''); 
  // Lấy danh mục mặc định từ URL, nếu không có thì mặc định là 'all'
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all'); 
  const [maxPrice, setMaxPrice] = useState(1000000); 
  const [minRating, setMinRating] = useState(0); 

  // Nếu người dùng đang ở trang dịch vụ mà đổi URL (VD: bấm từ Navbar), cập nhật lại state
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  // 3. FETCH DATA TỪ JSON-SERVER (CỔNG 9999)
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:9999/categories').then(res => res.json()),
      fetch('http://localhost:9999/providers').then(res => res.json())
    ])
    .then(([categoriesData, providersData]) => {
      setDbData({ 
        categories: categoriesData, 
        providers: providersData 
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
    // Ép kiểu về chuỗi để so sánh cho an toàn
    const category = dbData.categories.find(c => String(c.id) === String(catId));
    return category ? category.name : "Dịch vụ khác";
  };

  // 4. LOGIC LỌC DỮ LIỆU DỰA TRÊN STATE dbData
  const filteredProviders = (dbData.providers || []).filter((provider) => {
    const matchesSearch = 
      (provider.title && provider.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (provider.name && provider.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (provider.skills && provider.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())));
      
    // Ép kiểu về chuỗi (String) để tránh lỗi lệch kiểu giữa ID trên URL và ID trong JSON
    const matchesCategory = selectedCategory === 'all' || String(provider.category_id) === String(selectedCategory);
    const matchesPrice = provider.price_per_hour <= maxPrice;
    const matchesRating = provider.rating >= minRating;

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
          placeholder="Tìm kiếm dịch vụ, tên thợ hoặc kỹ năng (VD: ống nước, dọn nhà)..." 
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
                  // Đảm bảo highlight đúng category khi match string
                  className={`category-item ${String(selectedCategory) === String(cat.id) ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)} 
                >
                  {getCategoryIcon(cat.icon)} {cat.name}
                </div>
              ))}
            </div>
          </div>

          {/* LỌC KHOẢNG GIÁ */}
          <div className="filter-section">
            <div className="filter-title">
              Giá tối đa/giờ: <span style={{color: '#2563eb', fontWeight: 'bold'}}>{formatCurrency(maxPrice)}</span>
            </div>
            <input 
              type="range" 
              min="50000" 
              max="1000000" 
              step="50000" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))} 
              className="price-slider" 
            />
            <div className="price-range-labels">
              <span>50.000Đ</span>
              <span>1.000.000Đ</span>
            </div>
          </div>

         {/* LỌC ĐÁNH GIÁ */}
          <div className="filter-section">
            <div className="filter-title">ĐÁNH GIÁ</div>
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
            Tìm thấy <strong>{filteredProviders.length}</strong> kết quả phù hợp
          </div>

          {/* KHI KHÔNG TÌM THẤY KẾT QUẢ */}
          {filteredProviders.length === 0 ? (
            <div className="no-results-box">
              <p>Không tìm thấy dịch vụ nào phù hợp với bộ lọc của bạn.</p>
              <button 
                onClick={() => { setSelectedCategory('all'); setSearchTerm(''); setMaxPrice(1000000); setMinRating(0); }}
                className="btn-reset-filter"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="service-grid">
              {filteredProviders.map((provider) => (
                <div 
                  className="service-card" 
                  key={provider.id}
                  // THÊM SỰ KIỆN CLICK CHUYỂN TRANG VÀ ĐỔI TRỎ CHUỘT
                  onClick={() => navigate(`/service/${provider.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  
                  <div className="card-image-wrapper">
                    <div className="card-badge">{getCategoryName(provider.category_id)}</div>
                    <img src={provider.cover_image} alt={provider.title || provider.name} />
                  </div>
                  
                  <div className="card-body">
                    {/* TÊN DỊCH VỤ (TITLE) */}
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {provider.title || provider.name}
                      {provider.is_verified && <CheckCircle2 size={16} color="#10b981" />}
                    </h3>
                    
                    <p className="card-desc">{provider.bio}</p>
                    
                    {/* ĐÁNH GIÁ */}
                    <div className="card-rating">
                      <Star size={14} fill="#fbbf24" className="star-icon" />
                      <strong>{provider.rating}</strong> ({provider.total_reviews} đánh giá)
                    </div>

                    {/* GIÁ TIỀN */}
                    <div className="card-price-row">
                      <span className="price-label">Theo giờ:</span>
                      <span className="price-value">{formatCurrency(provider.price_per_hour)}/giờ</span>
                    </div>
                    
                    <div className="card-price-row">
                      <span className="price-label">Theo ngày:</span>
                      <span className="price-value">{formatCurrency(provider.price_per_hour * 8)}/ngày</span>
                    </div>

                    {/* SỐ LƯỢNG THỢ */}
                    <div className="card-footer">
                      <strong>{provider.available_workers || 1} thợ</strong> có sẵn
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PHÂN TRANG */}
          {filteredProviders.length > 0 && (
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