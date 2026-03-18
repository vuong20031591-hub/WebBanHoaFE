"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  RotateCcw,
  Flower2,
  ShoppingCart,
  AlertCircle,
  PackageSearch,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface PageData {
  content: Product[];
  totalPages: number;
  totalElements: number;
  number: number;
  last: boolean;
  first: boolean;
}

interface FilterState {
  name: string;
  minPrice: string;
  maxPrice: string;
  category: string;
}

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync state filter với URL khi load trang
  const [filters, setFilters] = useState<FilterState>({
    name: searchParams.get("name") || "",
    minPrice: searchParams.get("minPrice") ? new Intl.NumberFormat("vi-VN").format(Number(searchParams.get("minPrice"))) : "",
    maxPrice: searchParams.get("maxPrice") ? new Intl.NumberFormat("vi-VN").format(Number(searchParams.get("maxPrice"))) : "",
    category: searchParams.get("category") || "",
  });

  const formatInputCurrency = (value: string) => {
    if (!value) return "";
    const numberValue = value.replace(/\D/g, "");
    return numberValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getRawNumber = (formattedValue: string) => {
    return formattedValue.replace(/\./g, "");
  };

  const formatPriceVND = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "₫";

  // --- FIX LOGIC LỌC TẠI ĐÂY ---
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const params = new URLSearchParams(searchParamsString);
      const fName = params.get("name")?.toLowerCase() || "";
      const fCat = params.get("category") || "";
      const fMin = Number(params.get("minPrice")) || 0;
      const fMax = Number(params.get("maxPrice")) || Number.MAX_SAFE_INTEGER;
      const currentPage = Number(params.get("page")) || 0;

      const allMockData: Product[] = [
        { id: 1, name: "Hoa Hồng Đỏ Classic", price: 350000, category: "Hoa Hồng", image: "https://images.unsplash.com/photo-1548610762-65603791e5d2?q=80&w=400" },
        { id: 2, name: "Lan Hồ Điệp Trắng", price: 1200000, category: "Hoa Lan", image: "https://images.unsplash.com/photo-1566995071720-3330b65f042e?q=80&w=400" },
        { id: 3, name: "Hướng Dương Rạng Rỡ", price: 150000, category: "Hoa Hướng Dương", image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?q=80&w=400" },
        { id: 4, name: "Cẩm Tú Cầu Xanh", price: 450000, category: "Khác", image: "https://images.unsplash.com/photo-1507290439931-a861b5a38200?q=80&w=400" },
      ];

      // Logic lọc chuẩn:
      const filtered = allMockData.filter(p => {
        const matchName = p.name.toLowerCase().includes(fName);
        const matchCat = !fCat || p.category === fCat;
        const matchPrice = p.price >= fMin && p.price <= fMax;
        return matchName && matchCat && matchPrice;
      });

      const pageSize = 4;
      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / pageSize) || 1;
      const start = currentPage * pageSize;
      const content = filtered.slice(start, start + pageSize);

      setPageData({
        content,
        totalPages,
        totalElements,
        number: currentPage,
        first: currentPage === 0,
        last: currentPage >= totalPages - 1,
      });
    } catch (err) {
      setError("Lỗi dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, [searchParamsString]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleApplyFilter = () => {
    const newParams = new URLSearchParams();
    if (filters.name) newParams.set("name", filters.name);
    if (filters.category) newParams.set("category", filters.category);
    if (filters.minPrice) newParams.set("minPrice", getRawNumber(filters.minPrice));
    if (filters.maxPrice) newParams.set("maxPrice", getRawNumber(filters.maxPrice));
    newParams.set("page", "0"); // Luôn về trang 1 khi lọc
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleReset = () => {
    setFilters({ name: "", minPrice: "", maxPrice: "", category: "" });
    router.push(pathname);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-black font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex items-center gap-4">
          <Flower2 className="text-pink-600 w-12 h-12" />
          <h1 className="text-4xl font-black uppercase tracking-tighter">TIỆM HOA TƯƠI</h1>
        </div>

        {/* BỘ LỌC */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-black grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-4 space-y-2">
            <p className="font-black text-xs uppercase tracking-widest ml-1">Tìm theo tên</p>
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Nhập hoa..."
                className="w-full border-2 border-black rounded-2xl p-4 pl-12 font-bold outline-none focus:border-pink-500"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              />
            </div>
          </div>

          <div className="md:col-span-3 space-y-2">
            <p className="font-black text-xs uppercase tracking-widest ml-1">Danh mục</p>
            <select
              className="w-full border-2 border-black rounded-2xl p-4 font-black outline-none bg-slate-50 cursor-pointer"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">TẤT CẢ</option>
              <option value="Hoa Hồng">HOA HỒNG</option>
              <option value="Hoa Lan">HOA LAN</option>
              <option value="Hoa Hướng Dương">HOA HƯỚNG DƯƠNG</option>
            </select>
          </div>

          <div className="md:col-span-3 space-y-2">
            <p className="font-black text-xs uppercase tracking-widest ml-1">Giá (VNĐ)</p>
            <div className="flex gap-2 items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Từ"
                  className="w-full border-2 border-black rounded-2xl p-4 pr-10 font-bold outline-none"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: formatInputCurrency(e.target.value) })}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">đ</span>
              </div>
              <span className="font-black">-</span>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Đến"
                  className="w-full border-2 border-black rounded-2xl p-4 pr-10 font-bold outline-none"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: formatInputCurrency(e.target.value) })}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">đ</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={handleApplyFilter}
              className="flex-1 bg-black text-white p-4 rounded-2xl font-black hover:bg-slate-800 border-2 border-black active:scale-95 transition-all"
            >
              LỌC
            </button>
            <button onClick={handleReset} className="p-4 border-2 border-black rounded-2xl hover:bg-red-50 transition-colors">
              <RotateCcw size={20} strokeWidth={3} />
            </button>
          </div>
        </section>

        {/* NỘI DUNG */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="bg-white border-2 border-black rounded-[2rem] h-80 animate-pulse" />)}
          </div>
        ) : !pageData || pageData.content.length === 0 ? (
          <div className="text-center py-20 bg-slate-100 border-2 border-black border-dashed rounded-[3rem]">
            <PackageSearch className="mx-auto text-slate-400 mb-4" size={48} />
            <p className="font-black uppercase text-slate-500">Không tìm thấy sản phẩm</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {pageData.content.map((p) => (
                <div key={p.id} className="group bg-white border-2 border-black rounded-[2rem] overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all">
                  <div className="relative h-56 bg-slate-100">
                    <img src={p.image} className="w-full h-full object-cover border-b-2 border-black" alt={p.name} />
                    <span className="absolute top-4 right-4 bg-pink-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase border-2 border-black">{p.category}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-black text-lg uppercase line-clamp-1">{p.name}</h3>
                    <div className="flex justify-between items-center mt-4">
                      <span className="font-bold text-xl tracking-tighter">{formatPriceVND(p.price)}</span>
                      <button className="bg-black text-white p-3 rounded-xl hover:bg-pink-600 border-2 border-black"><ShoppingCart size={18} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PHÂN TRANG */}
            <div className="mt-12 flex flex-col md:flex-row items-center justify-between bg-white border-2 border-black p-6 rounded-[2rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-bold text-slate-500 uppercase text-sm">
                Trang <span className="text-black font-black">{pageData.number + 1}</span> / {pageData.totalPages} 
                <span className="mx-3">|</span> Tổng <span className="text-black font-black">{pageData.totalElements}</span> sản phẩm
              </p>
              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <button
                  disabled={pageData.first}
                  onClick={() => router.push(`${pathname}?${new URLSearchParams({...Object.fromEntries(searchParams), page: (pageData.number - 1).toString()})}`)}
                  className="p-3 border-2 border-black rounded-xl disabled:opacity-30"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  disabled={pageData.last}
                  onClick={() => router.push(`${pathname}?${new URLSearchParams({...Object.fromEntries(searchParams), page: (pageData.number + 1).toString()})}`)}
                  className="p-3 border-2 border-black rounded-xl disabled:opacity-30"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}