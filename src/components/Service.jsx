import React, { useState } from 'react';
import { 
  Search, Filter, LayoutGrid, Brush, Zap, Wrench, Snowflake, 
  Star, ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react';
import './Service.css';

// 1. DATA (Giữ nguyên)
const db = {
  categories: [
    { id: "cat_1", name: "Dọn dẹp nhà cửa", slug: "don-dep-nha", icon: "cleaning_services", color: "#FF5733" },
    { id: "cat_2", name: "Sửa đồ gia dụng", slug: "sua-do-gia-dung", icon: "build", color: "#33FF57" },
    { id: "cat_3", name: "Điện nước", slug: "dien-nuoc", icon: "plumbing", color: "#3357FF" },
    { id: "cat_4", name: "Vệ sinh máy lạnh", slug: "ve-sinh-may-lanh", icon: "ac_unit", color: "#FF33E9" }
  ],
  providers: [
    {
      id: "p_101",
      name: "Nguyễn Văn Tuấn",
      category_id: "cat_3",
      avatar: "https://i.pravatar.cc/150?u=p_101",
      cover_image: "https://picsum.photos/seed/p101/600/300",
      bio: "Chuyên gia điện nước hơn 10 năm kinh nghiệm tại TP.HCM. Nhiệt tình, tận tâm, giá cả minh bạch.",
      rating: 4.9,
      total_reviews: 156,
      completed_jobs: 420,
      is_verified: true,
      skills: ["Sửa ống nước", "Lắp điện âm tường", "Sửa máy bơm"],
      work_area: ["Quận 1", "Quận 3", "Bình Thạnh"],
      status: "available",
      price_per_hour: 200000
    },
    {
      id: "p_102",
      name: "Trần Thị Lan",
      category_id: "cat_1",
      avatar: "https://i.pravatar.cc/150?u=p_102",
      cover_image: "https://picsum.photos/seed/p102/600/300",
      bio: "Dọn dẹp nhà cửa theo giờ, sạch sẽ, tỉ mỉ, có lý lịch rõ ràng.",
      rating: 4.7,
      total_reviews: 89,
      completed_jobs: 120,
      is_verified: true,
      skills: ["Dọn nhà", "Ủi đồ", "Nấu ăn gia đình"],
      work_area: ["Quận 7", "Quận 4", "Nhà Bè"],
      status: "busy",
      price_per_hour: 100000
    }
  ]
};

// 2. CÁC HÀM HỖ TRỢ
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
  // 3. KHỞI TẠO STATE (Thêm minRating)
  const [searchTerm, setSearchTerm] = useState(''); 
  const [selectedCategory, setSelectedCategory] = useState('all'); 
  const [maxPrice, setMaxPrice] = useState(500000); 
  const [minRating, setMinRating] = useState(0); // Mặc định là 0 (Tất cả)

  const getCategoryName = (catId) => {
    const category = db.categories.find(c => c.id === catId);
    return category ? category.name : "Dịch vụ khác";
  };

  // 4. LOGIC LỌC DỮ LIỆU
  const filteredProviders = db.providers.filter((provider) => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          provider.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || provider.category_id === selectedCategory;
    const matchesPrice = provider.price_per_hour <= maxPrice;
    
    // Điều kiện 4: Lọc theo đánh giá (rating của thợ phải >= mức chọn)
    const matchesRating = provider.rating >= minRating;

    // Phải thỏa mãn cả 4 điều kiện
    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });

  return (
    <div className="service-page">
      
      {/* THANH TÌM KIẾM */}
      <div className="service-top-search">
        <Search className="search-icon-top" size={20} />
        <input 
          type="text" 
          placeholder="Tìm kiếm thợ hoặc kỹ năng (VD: ống nước, dọn nhà)..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      <div className="service-layout">
        
        {/* CỘT TRÁI - SIDEBAR BỘ LỌC */}
        <div className="service-sidebar">
          <div className="filter-header">
            <Filter size={20} color="#ff5a1f" />
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
              {db.categories.map((cat) => (
                <div 
                  key={cat.id}
                  className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
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
              Giá tối đa/giờ: <span style={{color: '#ff5a1f', fontWeight: 'bold'}}>{formatCurrency(maxPrice)}</span>
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
              <span>50.000đ</span>
              <span>1.000.000đ</span>
            </div>
          </div>

         {/* LỌC ĐÁNH GIÁ (Dạng Radio + Stars) */}
          <div className="filter-section">
            <div className="filter-title">ĐÁNH GIÁ</div>
            <div className="rating-filter-list">
              
              {/* Nút chọn Tất cả */}
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

              {/* Lặp để tạo các mốc 5, 4, 3, 2, 1 sao */}
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
                    {/* Vòng lặp vẽ 5 ngôi sao: sao nào nhỏ hơn mốc thì màu vàng, lớn hơn thì màu xám */}
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

        {/* CỘT PHẢI - DANH SÁCH THỢ */}
        <div className="service-main">
          <div className="service-results-text">
            Tìm thấy <strong>{filteredProviders.length}</strong> kết quả phù hợp
          </div>

          {/* Khi không tìm thấy kết quả (Bao gồm reset luôn cả Rating) */}
          {filteredProviders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>Không tìm thấy thợ nào phù hợp với bộ lọc của bạn.</p>
              <button 
                onClick={() => { setSelectedCategory('all'); setSearchTerm(''); setMaxPrice(500000); setMinRating(0); }}
                style={{ marginTop: '16px', padding: '10px 20px', background: '#ff5a1f', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="service-grid">
              {filteredProviders.map((provider) => (
                <div className="service-card" key={provider.id}>
                  
                  <div className="card-image-wrapper">
                    <div className="card-badge">{getCategoryName(provider.category_id)}</div>
                    <img src={provider.cover_image} alt={provider.name} />
                  </div>
                  
                  <div className="card-body">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {provider.name}
                      {provider.is_verified && <CheckCircle2 size={16} color="#10b981" />}
                    </h3>
                    
                    <p className="card-desc">{provider.bio}</p>
                    
                    <div className="card-rating">
                      <Star size={14} fill="#fbbf24" className="star-icon" />
                      <strong>{provider.rating}</strong> ({provider.total_reviews} đánh giá)
                       • {provider.completed_jobs} việc hoàn thành
                    </div>

                    <div className="card-price-row">
                      <span>Mức giá:</span>
                      <span className="price-value">{formatCurrency(provider.price_per_hour)}/giờ</span>
                    </div>
                    
                    <div className="card-price-row">
                      <span>Ước tính ngày:</span>
                      <span className="price-value">{formatCurrency(provider.price_per_hour * 8)}/ngày</span>
                    </div>

                    <div className="card-footer" style={{ 
                      color: provider.status === 'available' ? '#10b981' : '#ef4444',
                      fontWeight: '600'
                    }}>
                      {provider.status === 'available' ? '● Sẵn sàng nhận việc' : '● Đang bận'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Phân trang */}
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