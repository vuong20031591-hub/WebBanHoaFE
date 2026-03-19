export const dynamic = "force-dynamic";

type ProductResponse = {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  createdAt: string;
  categoryId: number;
  categoryName: string;
};

type CategoryResponse = {
  id: number;
  name: string;
  description: string;
};

type PageResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

async function getProducts(): Promise<PageResponse<ProductResponse>> {
  const response = await fetch(
    `${API_BASE_URL}/api/products?page=0&size=20&sortBy=createdAt&direction=desc`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Không lấy được danh sách sản phẩm: ${response.status}`);
  }

  return response.json();
}

async function getCategories(): Promise<CategoryResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/categories`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Không lấy được danh mục: ${response.status}`);
  }

  return response.json();
}

export default async function Home() {
  let products: ProductResponse[] = [];
  let categories: CategoryResponse[] = [];
  let apiError: string | null = null;

  try {
    const [productsPage, categoriesData] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);
    products = productsPage.content;
    categories = categoriesData;
  } catch (error) {
    apiError = error instanceof Error ? error.message : "Không thể kết nối Backend API";
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 md:p-10">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-bold md:text-3xl">Website Bán Hoa - Product Page</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            FE đang gọi trực tiếp Backend API tại <strong>{API_BASE_URL}</strong>
          </p>
        </header>

        {apiError ? (
          <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <p className="font-semibold">Kết nối API thất bại</p>
            <p className="mt-1 text-sm">{apiError}</p>
            <p className="mt-2 text-sm">
              Đảm bảo Backend đang chạy ở <strong>{API_BASE_URL}</strong>.
            </p>
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Tổng sản phẩm hiển thị</p>
            <p className="mt-1 text-2xl font-bold">{products.length}</p>
          </article>
          <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Số danh mục</p>
            <p className="mt-1 text-2xl font-bold">{categories.length}</p>
          </article>
          <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Trạng thái BE</p>
            <p className={`mt-1 text-lg font-semibold ${apiError ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {apiError ? "Disconnected" : "Connected"}
            </p>
          </article>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold">Danh mục</h2>
          {categories.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Chưa có danh mục.</p>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-700"
                >
                  <p className="font-medium">{category.name}</p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {category.description || "Không có mô tả"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold">Sản phẩm mới nhất</h2>
          {products.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Chưa có sản phẩm.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left dark:border-zinc-700">
                    <th className="px-2 py-2">ID</th>
                    <th className="px-2 py-2">Tên</th>
                    <th className="px-2 py-2">Danh mục</th>
                    <th className="px-2 py-2">Giá</th>
                    <th className="px-2 py-2">Ảnh</th>
                    <th className="px-2 py-2">Mô tả</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-zinc-100 align-top dark:border-zinc-800">
                      <td className="px-2 py-2">#{product.id}</td>
                      <td className="px-2 py-2 font-medium">{product.name}</td>
                      <td className="px-2 py-2">{product.categoryName}</td>
                      <td className="px-2 py-2">{currencyFormatter.format(product.price)}</td>
                      <td className="px-2 py-2 break-all text-blue-600 dark:text-blue-400">
                        {product.image || "N/A"}
                      </td>
                      <td className="px-2 py-2 text-zinc-600 dark:text-zinc-400">
                        {product.description || "Không có mô tả"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
