import { Search } from "lucide-react";
import { Category } from "@/lib/categories";

interface ProductFilterProps {
  name: string;
  categoryId: string;
  categories: Category[];
  minPrice: string;
  maxPrice: string;
  onChange: (key: string, value: string) => void;
}

export function ProductFilter({
  name,
  categoryId,
  categories,
  minPrice,
  maxPrice,
  onChange,
}: ProductFilterProps) {
  const divider = <div className="border-t border-[rgba(45,42,38,0.1)] my-4" />;

  return (
    <aside className="w-full shrink-0 lg:w-[224px]">
      <p
        className="text-[#2d2a26] text-[16px] font-bold tracking-[3px] mb-4"
        style={{ fontFamily: "var(--font-noto-serif)" }}
      >
        NAME
      </p>
      {divider}
      <div className="h-10 bg-[rgba(156,163,175,0.2)] rounded flex items-center px-3">
        <Search className="w-3.5 h-3.5 text-[#9ca3af] mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search by name"
          value={name}
          onChange={(e) => onChange("name", e.target.value)}
          className="w-full bg-transparent text-[#5c6b5e] text-[14px] outline-none placeholder-[#9ca3af]"
          style={{ fontFamily: "var(--font-inter)" }}
        />
      </div>

      <p
        className="text-[#2d2a26] text-[16px] font-bold tracking-[3px] mt-8 mb-4"
        style={{ fontFamily: "var(--font-noto-serif)" }}
      >
        CATEGORY
      </p>
      {divider}
      <div className="h-10 bg-[rgba(156,163,175,0.2)] rounded flex items-center px-3">
        <select
          value={categoryId}
          onChange={(e) => onChange("categoryId", e.target.value)}
          className="w-full bg-transparent text-[#5c6b5e] text-[14px] outline-none"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <p
        className="text-[#2d2a26] text-[16px] font-bold tracking-[3px] mt-8 mb-4"
        style={{ fontFamily: "var(--font-noto-serif)" }}
      >
        PRICE
      </p>
      {divider}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-10 bg-[rgba(156,163,175,0.2)] rounded flex items-center px-3">
          <span className="text-[#9ca3af] text-[14px] mr-1" style={{ fontFamily: "var(--font-inter)" }}>₫</span>
          <input
            type="number"
            placeholder="0"
            value={minPrice}
            onChange={(e) => onChange("minPrice", e.target.value)}
            className="w-full bg-transparent text-[#9ca3af] text-[14px] outline-none"
            style={{ fontFamily: "var(--font-inter)" }}
          />
        </div>
        <span className="text-[rgba(92,107,94,0.4)] text-[28px] font-thin">-</span>
        <div className="flex-1 h-10 bg-[rgba(156,163,175,0.2)] rounded flex items-center px-3">
          <span className="text-[#9ca3af] text-[14px] mr-1" style={{ fontFamily: "var(--font-inter)" }}>₫</span>
          <input
            type="number"
            placeholder="500000"
            value={maxPrice}
            onChange={(e) => onChange("maxPrice", e.target.value)}
            className="w-full bg-transparent text-[#9ca3af] text-[14px] outline-none"
            style={{ fontFamily: "var(--font-inter)" }}
          />
        </div>
      </div>
    </aside>
  );
}
