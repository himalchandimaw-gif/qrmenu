"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Eye,
  ImagePlus,
  LogOut,
  Pencil,
  Plus,
  Save,
  Search,
  Settings,
  Star,
  Tags,
  Trash2,
  Upload,
  Utensils,
  X,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  theme_color?: string | null;
  background_color?: string | null;
};

type Category = {
  id: string;
  name: string;
  display_order?: number | null;
};

type MenuItem = {
  id: string;
  restaurant_id: string;
  category_id?: string | null;
  name: string;
  description?: string | null;
  price: number | string;
  image_url?: string | null;
  popular?: boolean | null;
  available?: boolean | null;
  display_order?: number | null;
  categories?: {
    name: string;
  } | null;
};

const emptyItemForm = {
  id: "",
  name: "",
  description: "",
  price: "",
  image_url: "",
  category_id: "",
  popular: false,
  available: true,
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);

  const [activeTab, setActiveTab] = useState<"items" | "categories" | "settings">(
    "items"
  );

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [categoryName, setCategoryName] = useState("");

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemMode, setItemMode] = useState<"create" | "edit">("create");
  const [itemForm, setItemForm] = useState<any>(emptyItemForm);

  useEffect(() => {
    checkLogin();
  }, []);

  async function checkLogin() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      router.push("/login");
      return;
    }

    await loadData();
    setLoading(false);
  }

  async function loadData() {
    const { data: adminData, error: adminError } = await supabase
      .from("restaurant_admins")
      .select("restaurant_id")
      .limit(1)
      .single();

    if (adminError || !adminData) {
      alert("No restaurant assigned to this admin account.");
      setLoading(false);
      return;
    }

    const { data: restaurantData } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", adminData.restaurant_id)
      .single();

    setRestaurant(restaurantData);

    const { data: categoryData } = await supabase
      .from("categories")
      .select("*")
      .eq("restaurant_id", adminData.restaurant_id)
      .order("display_order", { ascending: true });

    setCategories(categoryData || []);

    const { data: itemData } = await supabase
      .from("menu_items")
      .select("*, categories(name)")
      .eq("restaurant_id", adminData.restaurant_id)
      .order("display_order", { ascending: true });

    setItems(itemData || []);
  }

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();

    return items.filter((item) => {
      const matchSearch =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.categories?.name?.toLowerCase().includes(q);

      const matchCategory =
        filterCategory === "all" || item.category_id === filterCategory;

      return matchSearch && matchCategory;
    });
  }, [items, search, filterCategory]);

  const totalItems = items.length;
  const popularItems = items.filter((item) => item.popular).length;
  const unavailableItems = items.filter((item) => !item.available).length;

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function uploadImage(file: File) {
    if (!restaurant) return "";

    const cleanName = file.name.replace(/\s+/g, "-").toLowerCase();
    const fileName = `${restaurant.id}/${Date.now()}-${cleanName}`;

    const { error } = await supabase.storage
      .from("menu-images")
      .upload(fileName, file);

    if (error) {
      alert(error.message);
      return "";
    }

    const { data } = supabase.storage.from("menu-images").getPublicUrl(fileName);
    return data.publicUrl;
  }

  function openAddItem() {
    setItemMode("create");
    setItemForm(emptyItemForm);
    setItemModalOpen(true);
  }

  function openEditItem(item: MenuItem) {
    setItemMode("edit");
    setItemForm({
      id: item.id,
      name: item.name || "",
      description: item.description || "",
      price: item.price || "",
      image_url: item.image_url || "",
      category_id: item.category_id || "",
      popular: Boolean(item.popular),
      available: Boolean(item.available),
    });
    setItemModalOpen(true);
  }

  async function saveItem() {
    if (!restaurant) return;

    if (!itemForm.name || !itemForm.price) {
      alert("Item name and price are required.");
      return;
    }

    const payload = {
      restaurant_id: restaurant.id,
      category_id: itemForm.category_id || null,
      name: itemForm.name,
      description: itemForm.description,
      price: Number(itemForm.price),
      image_url: itemForm.image_url,
      popular: Boolean(itemForm.popular),
      available: Boolean(itemForm.available),
    };

    if (itemMode === "create") {
      const { error } = await supabase.from("menu_items").insert({
        ...payload,
        display_order: items.length + 1,
      });

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("menu_items")
        .update(payload)
        .eq("id", itemForm.id);

      if (error) {
        alert(error.message);
        return;
      }
    }

    setItemModalOpen(false);
    setItemForm(emptyItemForm);
    await loadData();
  }

  async function deleteItem(id: string) {
    const ok = confirm("Delete this menu item?");
    if (!ok) return;

    const { error } = await supabase.from("menu_items").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
  }

  async function addCategory() {
    if (!restaurant) return;
    if (!categoryName.trim()) return;

    const { error } = await supabase.from("categories").insert({
      restaurant_id: restaurant.id,
      name: categoryName,
      display_order: categories.length + 1,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setCategoryName("");
    await loadData();
  }

  async function updateCategory(category: Category) {
    const { error } = await supabase
      .from("categories")
      .update({
        name: category.name,
        display_order: category.display_order,
      })
      .eq("id", category.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Category updated");
    await loadData();
  }

  async function deleteCategory(id: string) {
    const ok = confirm(
      "Delete this category? Menu items will stay, but category will be removed."
    );
    if (!ok) return;

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
  }

  async function updateRestaurant() {
    if (!restaurant) return;

    const { error } = await supabase
      .from("restaurants")
      .update({
        name: restaurant.name,
        description: restaurant.description,
        logo_url: restaurant.logo_url,
        theme_color: restaurant.theme_color,
        background_color: restaurant.background_color,
      })
      .eq("id", restaurant.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Restaurant settings updated");
    await loadData();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="font-semibold">Loading admin panel...</p>
        </div>
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="rounded-3xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold">No restaurant found</h1>
          <p className="mt-2 text-gray-600">
            Please connect this admin account to a restaurant.
          </p>
        </div>
      </main>
    );
  }

  const themeColor = restaurant.theme_color || "#b45309";

  return (
    <main className="min-h-screen bg-gray-100">
      <div
        className="relative overflow-hidden px-4 py-8 text-white"
        style={{
          background: `radial-gradient(circle at top left, ${themeColor}, #111827 55%, #030712)`,
        }}
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-yellow-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold text-white/60">
                Restaurant QR Menu Dashboard
              </p>
              <h1 className="mt-1 text-4xl font-black">{restaurant.name}</h1>
              <p className="mt-2 max-w-xl text-white/70">
                Manage menu items, categories, prices, photos, theme and
                availability.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={`/menu/${restaurant.slug}`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-gray-950 shadow-lg"
              >
                <Eye className="h-5 w-5" />
                View Menu
              </a>
              <a
  href="/admin/qr"
  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-gray-950 shadow-lg"
>
  QR Code
</a>

              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-bold text-white shadow-lg"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <StatsCard title="Menu Items" value={totalItems} icon={<Utensils />} />
            <StatsCard title="Categories" value={categories.length} icon={<Tags />} />
            <StatsCard title="Popular" value={popularItems} icon={<Star />} />
            <StatsCard
              title="Unavailable"
              value={unavailableItems}
              icon={<XCircle />}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="-mt-10 rounded-[2rem] border border-white/70 bg-white/90 p-3 shadow-2xl backdrop-blur">
          <div className="grid gap-3 md:grid-cols-3">
            <TabButton
              active={activeTab === "items"}
              label="Menu Items"
              icon={<Utensils />}
              onClick={() => setActiveTab("items")}
              themeColor={themeColor}
            />

            <TabButton
              active={activeTab === "categories"}
              label="Categories"
              icon={<Tags />}
              onClick={() => setActiveTab("categories")}
              themeColor={themeColor}
            />

            <TabButton
              active={activeTab === "settings"}
              label="Settings"
              icon={<Settings />}
              onClick={() => setActiveTab("settings")}
              themeColor={themeColor}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "items" && (
            <motion.section
              key="items"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="mt-6"
            >
              <div className="rounded-[2rem] bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      Menu Items
                    </h2>
                    <p className="text-sm text-gray-500">
                      Search, add, edit, delete and manage item options.
                    </p>
                  </div>

                  <button
                    onClick={openAddItem}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-bold text-white shadow-lg"
                    style={{ backgroundColor: themeColor }}
                  >
                    <Plus className="h-5 w-5" />
                    Add Item
                  </button>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by item name, category or description..."
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 outline-none focus:border-gray-400 focus:bg-white"
                    />
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 outline-none focus:border-gray-400 focus:bg-white"
                  >
                    <option value="all">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 space-y-3">
                  {filteredItems.length === 0 && (
                    <div className="rounded-3xl border border-dashed p-10 text-center">
                      <Search className="mx-auto h-10 w-10 text-gray-400" />
                      <h3 className="mt-3 text-lg font-bold">No items found</h3>
                      <p className="text-gray-500">
                        Try another search or add a new menu item.
                      </p>
                    </div>
                  )}

                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -2 }}
                      onClick={() => openEditItem(item)}
                      className="grid cursor-pointer gap-4 rounded-3xl border bg-white p-4 transition hover:border-gray-300 hover:shadow-md md:grid-cols-[90px_1fr_auto]"
                    >
                      <div className="h-24 w-full overflow-hidden rounded-2xl bg-gray-100 md:h-24 md:w-24">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className="flex h-full w-full items-center justify-center text-white"
                            style={{ backgroundColor: themeColor }}
                          >
                            <ImagePlus className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black text-gray-900">
                            {item.name}
                          </h3>

                          {item.popular && (
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                              ⭐ Popular
                            </span>
                          )}

                          {item.available ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                              <XCircle className="h-3 w-3" />
                              Hidden
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                          {item.categories?.name || "No category"}
                        </p>

                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                          {item.description || "No description"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                        <p
                          className="rounded-full px-4 py-2 text-lg font-black text-white"
                          style={{ backgroundColor: themeColor }}
                        >
                          Rs. {Number(item.price).toLocaleString("en-LK")}
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditItem(item);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteItem(item.id);
                            }}
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {activeTab === "categories" && (
            <motion.section
              key="categories"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm"
            >
              <h2 className="text-2xl font-black text-gray-900">Categories</h2>
              <p className="text-sm text-gray-500">
                Add and edit menu categories.
              </p>

              <div className="mt-5 flex gap-3">
                <input
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Example: Rice, Kottu, Coffee"
                  className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 p-4 outline-none focus:border-gray-400 focus:bg-white"
                />

                <button
                  onClick={addCategory}
                  className="rounded-2xl bg-gray-900 px-6 font-bold text-white"
                >
                  Add
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {categories.map((cat, index) => (
                  <div
                    key={cat.id}
                    className="grid gap-3 rounded-3xl border p-4 md:grid-cols-[1fr_160px_auto]"
                  >
                    <input
                      value={cat.name || ""}
                      onChange={(e) => {
                        const copy = [...categories];
                        copy[index].name = e.target.value;
                        setCategories(copy);
                      }}
                      className="rounded-2xl border border-gray-200 bg-gray-50 p-4 outline-none focus:border-gray-400 focus:bg-white"
                    />

                    <input
                      type="number"
                      value={cat.display_order || 0}
                      onChange={(e) => {
                        const copy = [...categories];
                        copy[index].display_order = Number(e.target.value);
                        setCategories(copy);
                      }}
                      className="rounded-2xl border border-gray-200 bg-gray-50 p-4 outline-none focus:border-gray-400 focus:bg-white"
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => updateCategory(cat)}
                        className="rounded-2xl bg-green-700 px-5 font-bold text-white"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="rounded-2xl bg-red-600 px-5 font-bold text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {activeTab === "settings" && (
            <motion.section
              key="settings"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm"
            >
              <h2 className="text-2xl font-black text-gray-900">
                Restaurant Settings
              </h2>
              <p className="text-sm text-gray-500">
                Change name, logo, description and theme colors.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input
                  value={restaurant.name || ""}
                  onChange={(e) =>
                    setRestaurant({ ...restaurant, name: e.target.value })
                  }
                  placeholder="Restaurant name"
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 outline-none focus:border-gray-400 focus:bg-white"
                />

                <input
                  value={restaurant.slug || ""}
                  disabled
                  className="rounded-2xl border border-gray-200 bg-gray-100 p-4 text-gray-500"
                />

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <label className="mb-2 block text-sm font-bold text-gray-600">
                    Theme color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={restaurant.theme_color || "#b45309"}
                      onChange={(e) =>
                        setRestaurant({
                          ...restaurant,
                          theme_color: e.target.value,
                        })
                      }
                      className="h-12 w-16 rounded-xl"
                    />

                    <input
                      value={restaurant.theme_color || ""}
                      onChange={(e) =>
                        setRestaurant({
                          ...restaurant,
                          theme_color: e.target.value,
                        })
                      }
                      className="flex-1 bg-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <label className="mb-2 block text-sm font-bold text-gray-600">
                    Background color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={restaurant.background_color || "#fff7ed"}
                      onChange={(e) =>
                        setRestaurant({
                          ...restaurant,
                          background_color: e.target.value,
                        })
                      }
                      className="h-12 w-16 rounded-xl"
                    />

                    <input
                      value={restaurant.background_color || ""}
                      onChange={(e) =>
                        setRestaurant({
                          ...restaurant,
                          background_color: e.target.value,
                        })
                      }
                      className="flex-1 bg-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-gray-600">
                    Logo
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const url = await uploadImage(file);
                      if (url) {
                        setRestaurant({ ...restaurant, logo_url: url });
                      }
                    }}
                  />

                  {restaurant.logo_url && (
                    <img
                      src={restaurant.logo_url}
                      alt="Logo"
                      className="mt-4 h-24 w-24 rounded-2xl object-cover"
                    />
                  )}
                </div>

                <textarea
                  value={restaurant.description || ""}
                  onChange={(e) =>
                    setRestaurant({
                      ...restaurant,
                      description: e.target.value,
                    })
                  }
                  placeholder="Restaurant description"
                  className="min-h-32 rounded-2xl border border-gray-200 bg-gray-50 p-4 outline-none focus:border-gray-400 focus:bg-white md:col-span-2"
                />
              </div>

              <button
                onClick={updateRestaurant}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl px-6 py-4 font-bold text-white"
                style={{ backgroundColor: themeColor }}
              >
                <Save className="h-5 w-5" />
                Save Settings
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {itemModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {itemMode === "create" ? "Add New Item" : "Edit Item"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Update item name, price, photo, category and options.
                  </p>
                </div>

                <button
                  onClick={() => setItemModalOpen(false)}
                  className="rounded-full bg-gray-100 p-3"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input
                  value={itemForm.name}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, name: e.target.value })
                  }
                  placeholder="Item name"
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 outline-none focus:border-gray-400 focus:bg-white"
                />

                <input
                  type="number"
                  value={itemForm.price}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, price: e.target.value })
                  }
                  placeholder="Price"
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 outline-none focus:border-gray-400 focus:bg-white"
                />

                <select
                  value={itemForm.category_id}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, category_id: e.target.value })
                  }
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 outline-none focus:border-gray-400 focus:bg-white"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 font-bold text-gray-600">
                  <Upload className="h-5 w-5" />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const url = await uploadImage(file);
                      if (url) {
                        setItemForm({ ...itemForm, image_url: url });
                      }
                    }}
                  />
                </label>

                {itemForm.image_url && (
                  <img
                    src={itemForm.image_url}
                    alt="Preview"
                    className="h-56 w-full rounded-3xl object-cover md:col-span-2"
                  />
                )}

                <textarea
                  value={itemForm.description}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, description: e.target.value })
                  }
                  placeholder="Description"
                  className="min-h-28 rounded-2xl border border-gray-200 bg-gray-50 p-4 outline-none focus:border-gray-400 focus:bg-white md:col-span-2"
                />

                <label className="flex items-center justify-between rounded-2xl border bg-gray-50 p-4">
                  <div>
                    <p className="font-bold">Popular Item</p>
                    <p className="text-sm text-gray-500">
                      Show this item in popular section.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={itemForm.popular}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, popular: e.target.checked })
                    }
                    className="h-5 w-5"
                  />
                </label>

                <label className="flex items-center justify-between rounded-2xl border bg-gray-50 p-4">
                  <div>
                    <p className="font-bold">Available</p>
                    <p className="text-sm text-gray-500">
                      Turn off to hide from customer menu.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={itemForm.available}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, available: e.target.checked })
                    }
                    className="h-5 w-5"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-4 md:flex-row md:justify-between">
                {itemMode === "edit" && (
                  <button
                    onClick={() => {
                      deleteItem(itemForm.id);
                      setItemModalOpen(false);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 font-bold text-white"
                  >
                    <Trash2 className="h-5 w-5" />
                    Delete Item
                  </button>
                )}

                <div className="flex gap-3 md:ml-auto">
                  <button
                    onClick={() => setItemModalOpen(false)}
                    className="flex-1 rounded-2xl bg-gray-100 px-6 py-4 font-bold text-gray-700 md:flex-none"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={saveItem}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-4 font-bold text-white md:flex-none"
                    style={{ backgroundColor: themeColor }}
                  >
                    <Save className="h-5 w-5" />
                    Save Item
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function StatsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/60">{title}</p>
          <p className="mt-1 text-3xl font-black text-white">{value}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          {icon}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  label,
  icon,
  active,
  onClick,
  themeColor,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  themeColor: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-2xl px-5 py-4 font-bold transition"
      style={{
        backgroundColor: active ? themeColor : "transparent",
        color: active ? "white" : "#374151",
      }}
    >
      <span className="h-5 w-5">{icon}</span>
      {label}
    </button>
  );
}