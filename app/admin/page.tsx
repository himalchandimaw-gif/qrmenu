"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Eye,
  ImagePlus,
  Leaf,
  Link2,
  LogOut,
  Pencil,
  Plus,
  QrCode,
  Save,
  Search,
  Settings,
  Sparkles,
  Star,
  Tags,
  Trash2,
  Upload,
  Utensils,
  Video,
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
  restaurant_id: string;
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
  video_url?: string | null;
  popular?: boolean | null;
  available?: boolean | null;
  display_order?: number | null;
  spicy_level?: number | null;
  prep_time?: string | null;
  is_veg?: boolean | null;
  is_new?: boolean | null;
  allergens?: string | null;
  categories?: {
    name: string;
  } | null;
};

type Customization = {
  id: string;
  restaurant_id: string;
  menu_item_id: string;
  name: string;
  options: unknown;
};

type ItemForm = {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  video_url: string;
  category_id: string;
  popular: boolean;
  available: boolean;
  spicy_level: string;
  prep_time: string;
  is_veg: boolean;
  is_new: boolean;
  allergens: string;
};

const emptyItemForm: ItemForm = {
  id: "",
  name: "",
  description: "",
  price: "",
  image_url: "",
  video_url: "",
  category_id: "",
  popular: false,
  available: true,
  spicy_level: "0",
  prep_time: "",
  is_veg: false,
  is_new: false,
  allergens: "",
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [customizations, setCustomizations] = useState<Customization[]>([]);

  const [activeTab, setActiveTab] = useState<"items" | "categories" | "settings">(
    "items"
  );

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [categoryName, setCategoryName] = useState("");

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemMode, setItemMode] = useState<"create" | "edit">("create");
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItemForm);

  const [optionName, setOptionName] = useState("");
  const [optionValues, setOptionValues] = useState("");

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

    const { data: customizationData } = await supabase
      .from("item_customizations")
      .select("*")
      .eq("restaurant_id", adminData.restaurant_id);

    setCustomizations(customizationData || []);
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
  const availableItems = items.filter((item) => item.available).length;
  const popularItems = items.filter((item) => item.popular).length;
  const videoItems = items.filter((item) => item.video_url).length;

  const themeColor = restaurant?.theme_color || "#111111";

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
    setOptionName("");
    setOptionValues("");
    setItemModalOpen(true);
  }

  function openEditItem(item: MenuItem) {
    setItemMode("edit");
    setItemForm({
      id: item.id,
      name: item.name || "",
      description: item.description || "",
      price: String(item.price || ""),
      image_url: item.image_url || "",
      video_url: item.video_url || "",
      category_id: item.category_id || "",
      popular: Boolean(item.popular),
      available: Boolean(item.available),
      spicy_level: String(item.spicy_level || 0),
      prep_time: item.prep_time || "",
      is_veg: Boolean(item.is_veg),
      is_new: Boolean(item.is_new),
      allergens: item.allergens || "",
    });

    setOptionName("");
    setOptionValues("");
    setItemModalOpen(true);
  }

  async function saveItem() {
    if (!restaurant) return;

    if (!itemForm.name.trim() || !itemForm.price) {
      alert("Item name and price are required.");
      return;
    }

    const payload = {
      restaurant_id: restaurant.id,
      category_id: itemForm.category_id || null,
      name: itemForm.name.trim(),
      description: itemForm.description,
      price: Number(itemForm.price),
      image_url: itemForm.image_url,
      video_url: itemForm.video_url,
      popular: itemForm.popular,
      available: itemForm.available,
      spicy_level: Number(itemForm.spicy_level || 0),
      prep_time: itemForm.prep_time,
      is_veg: itemForm.is_veg,
      is_new: itemForm.is_new,
      allergens: itemForm.allergens,
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

    setItemModalOpen(false);
    await loadData();
  }

  async function addCustomization() {
    if (!restaurant) return;

    if (!itemForm.id) {
      alert("Please save the item first. Then click Edit and add options.");
      return;
    }

    if (!optionName.trim() || !optionValues.trim()) {
      alert("Option name and values are required.");
      return;
    }

    const optionsArray = optionValues
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const { error } = await supabase.from("item_customizations").insert({
      restaurant_id: restaurant.id,
      menu_item_id: itemForm.id,
      name: optionName.trim(),
      options: optionsArray,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setOptionName("");
    setOptionValues("");
    await loadData();
  }

  async function deleteCustomization(id: string) {
    const ok = confirm("Delete this option group?");
    if (!ok) return;

    const { error } = await supabase
      .from("item_customizations")
      .delete()
      .eq("id", id);

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
      name: categoryName.trim(),
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
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="font-semibold">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-4">
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black">No restaurant found</h1>
          <p className="mt-2 text-neutral-500">
            Please connect this admin account to a restaurant.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-neutral-950 text-white">
              {restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Utensils className="h-7 w-7" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">
                  {restaurant.name}
                </h1>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-500">
                  Admin
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-500">
                Premium digital menu management
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={`/menu/${restaurant.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-black text-white"
            >
              <Eye className="h-4 w-4" />
              View Menu
            </a>

            <a
              href="/admin/qr"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-neutral-950 ring-1 ring-black/10"
            >
              <QrCode className="h-4 w-4" />
              QR Code
            </a>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-black text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard title="Total Items" value={totalItems} icon={<Utensils />} />
          <StatsCard title="Available" value={availableItems} icon={<CheckCircle2 />} />
          <StatsCard title="Popular" value={popularItems} icon={<Star />} />
          <StatsCard title="Videos" value={videoItems} icon={<Video />} />
        </div>

        <div className="mt-6 rounded-[2rem] bg-white p-2 shadow-sm ring-1 ring-black/5">
          <div className="grid gap-2 md:grid-cols-3">
            <TabButton
              active={activeTab === "items"}
              label="Menu Items"
              icon={<Utensils />}
              onClick={() => setActiveTab("items")}
            />

            <TabButton
              active={activeTab === "categories"}
              label="Categories"
              icon={<Tags />}
              onClick={() => setActiveTab("categories")}
            />

            <TabButton
              active={activeTab === "settings"}
              label="Settings"
              icon={<Settings />}
              onClick={() => setActiveTab("settings")}
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
              className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-black text-neutral-500">
                    <Sparkles className="h-3 w-3" />
                    Premium menu control
                  </div>

                  <h2 className="mt-3 text-3xl font-black tracking-tight">
                    Menu Items
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    Add photos, videos, prices and item-specific custom options.
                  </p>
                </div>

                <button
                  onClick={openAddItem}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-4 font-black text-white"
                >
                  <Plus className="h-5 w-5" />
                  Add Item
                </button>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-[1fr_260px]">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search item name, category or description..."
                    className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-4 pl-12 pr-4 outline-none transition focus:border-neutral-500 focus:bg-white"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 outline-none transition focus:border-neutral-500 focus:bg-white"
                >
                  <option value="all">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 space-y-3">
                {filteredItems.length === 0 && (
                  <div className="rounded-[2rem] border border-dashed border-neutral-300 p-10 text-center">
                    <Search className="mx-auto h-10 w-10 text-neutral-400" />
                    <h3 className="mt-3 text-xl font-black">No items found</h3>
                    <p className="mt-1 text-neutral-500">
                      Try another search or add a new item.
                    </p>
                  </div>
                )}

                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -2 }}
                    onClick={() => openEditItem(item)}
                    className="grid cursor-pointer gap-4 rounded-[1.75rem] border border-neutral-100 bg-white p-3 transition hover:border-neutral-300 hover:shadow-lg md:grid-cols-[96px_1fr_auto]"
                  >
                    <div className="h-28 overflow-hidden rounded-[1.25rem] bg-neutral-100 md:h-24 md:w-24">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-neutral-950 text-white">
                          <ImagePlus className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-xl font-black">
                          {item.name}
                        </h3>

                        {item.popular && <Pill>Popular</Pill>}
                        {item.is_new && <Pill>New</Pill>}
                        {item.video_url && <Pill>Video</Pill>}

                        {item.available ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                            Available
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                            Hidden
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm font-semibold text-neutral-500">
                        {item.categories?.name || "No category"}
                      </p>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-500">
                        {item.description || "No description"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-neutral-500">
                        {item.prep_time && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.prep_time}
                          </span>
                        )}

                        {item.is_veg && (
                          <span className="inline-flex items-center gap-1">
                            <Leaf className="h-3 w-3" />
                            Veg
                          </span>
                        )}

                        {item.spicy_level ? (
                          <span>Spicy {item.spicy_level}/5</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                      <p className="rounded-full bg-neutral-950 px-4 py-2 text-lg font-black text-white">
                        Rs. {Number(item.price).toLocaleString("en-LK")}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditItem(item);
                          }}
                          className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm font-black text-neutral-800"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item.id);
                          }}
                          className="rounded-full bg-red-600 px-4 py-2 text-sm font-black text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {activeTab === "categories" && (
            <motion.section
              key="categories"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <h2 className="text-3xl font-black tracking-tight">Categories</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Organize menu items by category.
              </p>

              <div className="mt-6 flex gap-3">
                <input
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Example: Rice, Coffee, Desserts"
                  className="flex-1 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 outline-none focus:border-neutral-500 focus:bg-white"
                />

                <button
                  onClick={addCategory}
                  className="rounded-2xl bg-neutral-950 px-6 font-black text-white"
                >
                  Add
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {categories.map((cat, index) => (
                  <div
                    key={cat.id}
                    className="grid gap-3 rounded-[1.5rem] border border-neutral-100 p-3 md:grid-cols-[1fr_160px_auto]"
                  >
                    <input
                      value={cat.name || ""}
                      onChange={(e) => {
                        const copy = [...categories];
                        copy[index].name = e.target.value;
                        setCategories(copy);
                      }}
                      className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 outline-none focus:border-neutral-500 focus:bg-white"
                    />

                    <input
                      type="number"
                      value={cat.display_order || 0}
                      onChange={(e) => {
                        const copy = [...categories];
                        copy[index].display_order = Number(e.target.value);
                        setCategories(copy);
                      }}
                      className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 outline-none focus:border-neutral-500 focus:bg-white"
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => updateCategory(cat)}
                        className="rounded-2xl bg-neutral-950 px-5 font-black text-white"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="rounded-2xl bg-red-600 px-5 font-black text-white"
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
              className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <h2 className="text-3xl font-black tracking-tight">
                Restaurant Settings
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Update brand details and minimalist menu colors.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InputBox label="Restaurant Name">
                  <input
                    value={restaurant.name || ""}
                    onChange={(e) =>
                      setRestaurant({ ...restaurant, name: e.target.value })
                    }
                    className="w-full bg-transparent outline-none"
                  />
                </InputBox>

                <InputBox label="Menu Slug">
                  <input
                    value={restaurant.slug || ""}
                    disabled
                    className="w-full bg-transparent text-neutral-500 outline-none"
                  />
                </InputBox>

                <InputBox label="Theme Color">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={restaurant.theme_color || "#111111"}
                      onChange={(e) =>
                        setRestaurant({
                          ...restaurant,
                          theme_color: e.target.value,
                        })
                      }
                      className="h-10 w-14 rounded-xl"
                    />

                    <input
                      value={restaurant.theme_color || ""}
                      onChange={(e) =>
                        setRestaurant({
                          ...restaurant,
                          theme_color: e.target.value,
                        })
                      }
                      className="w-full bg-transparent outline-none"
                    />
                  </div>
                </InputBox>

                <InputBox label="Background Color">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={restaurant.background_color || "#f5f5f4"}
                      onChange={(e) =>
                        setRestaurant({
                          ...restaurant,
                          background_color: e.target.value,
                        })
                      }
                      className="h-10 w-14 rounded-xl"
                    />

                    <input
                      value={restaurant.background_color || ""}
                      onChange={(e) =>
                        setRestaurant({
                          ...restaurant,
                          background_color: e.target.value,
                        })
                      }
                      className="w-full bg-transparent outline-none"
                    />
                  </div>
                </InputBox>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 md:col-span-2">
                  <label className="mb-3 block text-sm font-black text-neutral-600">
                    Restaurant Logo
                  </label>

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-black text-white">
                    <Upload className="h-4 w-4" />
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const url = await uploadImage(file);
                        if (url) {
                          setRestaurant({ ...restaurant, logo_url: url });
                        }
                      }}
                    />
                  </label>

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
                  className="min-h-32 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 outline-none focus:border-neutral-500 focus:bg-white md:col-span-2"
                />
              </div>

              <button
                onClick={updateRestaurant}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-4 font-black text-white"
              >
                <Save className="h-5 w-5" />
                Save Settings
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {itemModalOpen && (
          <ItemModal
            itemMode={itemMode}
            itemForm={itemForm}
            setItemForm={setItemForm}
            categories={categories}
            customizations={customizations}
            optionName={optionName}
            setOptionName={setOptionName}
            optionValues={optionValues}
            setOptionValues={setOptionValues}
            uploadImage={uploadImage}
            saveItem={saveItem}
            deleteItem={deleteItem}
            addCustomization={addCustomization}
            deleteCustomization={deleteCustomization}
            onClose={() => setItemModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function ItemModal({
  itemMode,
  itemForm,
  setItemForm,
  categories,
  customizations,
  optionName,
  setOptionName,
  optionValues,
  setOptionValues,
  uploadImage,
  saveItem,
  deleteItem,
  addCustomization,
  deleteCustomization,
  onClose,
}: {
  itemMode: "create" | "edit";
  itemForm: ItemForm;
  setItemForm: (value: ItemForm) => void;
  categories: Category[];
  customizations: Customization[];
  optionName: string;
  setOptionName: (value: string) => void;
  optionValues: string;
  setOptionValues: (value: string) => void;
  uploadImage: (file: File) => Promise<string>;
  saveItem: () => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addCustomization: () => Promise<void>;
  deleteCustomization: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const itemCustomizations = customizations.filter(
    (custom) => custom.menu_item_id === itemForm.id
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm md:items-center md:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.98 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl md:rounded-[2rem]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white/90 p-5 backdrop-blur">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-neutral-400">
              Menu Item
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-tight">
              {itemMode === "create" ? "Add New Item" : "Edit Item"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-neutral-100 p-3 text-neutral-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <InputBox label="Item Name">
                <input
                  value={itemForm.name}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, name: e.target.value })
                  }
                  placeholder="Chicken Kottu"
                  className="w-full bg-transparent outline-none"
                />
              </InputBox>

              <InputBox label="Price">
                <input
                  type="number"
                  value={itemForm.price}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, price: e.target.value })
                  }
                  placeholder="1200"
                  className="w-full bg-transparent outline-none"
                />
              </InputBox>

              <InputBox label="Category">
                <select
                  value={itemForm.category_id}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, category_id: e.target.value })
                  }
                  className="w-full bg-transparent outline-none"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </InputBox>

              <InputBox label="Preparation Time">
                <input
                  value={itemForm.prep_time}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, prep_time: e.target.value })
                  }
                  placeholder="10-15 min"
                  className="w-full bg-transparent outline-none"
                />
              </InputBox>

              <InputBox label="Spicy Level">
                <select
                  value={itemForm.spicy_level}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, spicy_level: e.target.value })
                  }
                  className="w-full bg-transparent outline-none"
                >
                  <option value="0">No spicy</option>
                  <option value="1">1 / 5</option>
                  <option value="2">2 / 5</option>
                  <option value="3">3 / 5</option>
                  <option value="4">4 / 5</option>
                  <option value="5">5 / 5</option>
                </select>
              </InputBox>

              <InputBox label="Allergens">
                <input
                  value={itemForm.allergens}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, allergens: e.target.value })
                  }
                  placeholder="Milk, nuts, egg"
                  className="w-full bg-transparent outline-none"
                />
              </InputBox>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <label className="mb-2 block text-sm font-black text-neutral-600">
                Description
              </label>

              <textarea
                value={itemForm.description}
                onChange={(e) =>
                  setItemForm({ ...itemForm, description: e.target.value })
                }
                placeholder="Short premium description for customers..."
                className="min-h-28 w-full bg-transparent outline-none"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ToggleBox
                title="Popular Item"
                text="Show in popular section"
                checked={itemForm.popular}
                onChange={(value) =>
                  setItemForm({ ...itemForm, popular: value })
                }
              />

              <ToggleBox
                title="Available"
                text="Turn off to hide from customer menu"
                checked={itemForm.available}
                onChange={(value) =>
                  setItemForm({ ...itemForm, available: value })
                }
              />

              <ToggleBox
                title="Vegetarian"
                text="Show veg badge"
                checked={itemForm.is_veg}
                onChange={(value) =>
                  setItemForm({ ...itemForm, is_veg: value })
                }
              />

              <ToggleBox
                title="New Item"
                text="Show new badge"
                checked={itemForm.is_new}
                onChange={(value) =>
                  setItemForm({ ...itemForm, is_new: value })
                }
              />
            </div>

            {itemMode === "edit" && (
              <div className="rounded-[1.75rem] border border-neutral-200 bg-neutral-50 p-5">
                <h3 className="text-2xl font-black tracking-tight">
                  Custom Options
                </h3>

                <p className="mt-1 text-sm text-neutral-500">
                  Add item-specific options. Coffee can have Sugar/Ice. Kottu
                  can have Chilly/Cheese. Dessert can have Cream/Size.
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <input
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    placeholder="Option name: Sugar / Cheese / Size"
                    className="rounded-2xl border border-neutral-200 bg-white p-4 outline-none focus:border-neutral-500"
                  />

                  <input
                    value={optionValues}
                    onChange={(e) => setOptionValues(e.target.value)}
                    placeholder="Options: No, Less, Normal, Extra"
                    className="rounded-2xl border border-neutral-200 bg-white p-4 outline-none focus:border-neutral-500"
                  />
                </div>

                <button
                  onClick={addCustomization}
                  className="mt-3 rounded-full bg-neutral-950 px-5 py-3 font-black text-white"
                >
                  Add Option Group
                </button>

                <div className="mt-5 space-y-3">
                  {itemCustomizations.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-5 text-center text-sm text-neutral-500">
                      No custom options yet.
                    </div>
                  )}

                  {itemCustomizations.map((custom) => (
                    <div
                      key={custom.id}
                      className="flex flex-col justify-between gap-3 rounded-2xl bg-white p-4 md:flex-row md:items-center"
                    >
                      <div>
                        <p className="font-black">{custom.name}</p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {optionsToArray(custom.options).map((option) => (
                            <span
                              key={option}
                              className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-bold text-neutral-600"
                            >
                              {option}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteCustomization(custom.id)}
                        className="rounded-full bg-red-600 px-4 py-2 text-sm font-black text-white"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {itemMode === "create" && (
              <div className="rounded-[1.75rem] border border-dashed border-neutral-300 bg-neutral-50 p-5">
                <h3 className="text-lg font-black">Custom Options</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  First save the item. Then click Edit and add options like
                  Sugar, Ice, Cheese, Chilly, Size, Cream, etc.
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[1.75rem] border border-neutral-200 bg-neutral-50 p-4">
              <label className="mb-3 block text-sm font-black text-neutral-600">
                Food Photo
              </label>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-white p-5 font-black text-neutral-700">
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
                  className="mt-4 h-64 w-full rounded-[1.5rem] object-cover"
                />
              )}
            </div>

            <InputBox label="Video URL">
              <input
                value={itemForm.video_url}
                onChange={(e) =>
                  setItemForm({ ...itemForm, video_url: e.target.value })
                }
                placeholder="https://..."
                className="w-full bg-transparent outline-none"
              />
            </InputBox>

            {itemForm.video_url && (
              <div className="rounded-[1.5rem] bg-neutral-950 p-4 text-white">
                <div className="mb-3 flex items-center gap-2 text-sm font-black">
                  <Video className="h-4 w-4" />
                  Video Preview
                </div>

                <video
                  src={itemForm.video_url}
                  controls
                  muted
                  className="h-52 w-full rounded-2xl object-cover"
                />
              </div>
            )}

            <div className="rounded-[1.75rem] bg-neutral-950 p-5 text-white">
              <p className="text-sm text-white/50">Customer menu link</p>

              <div className="mt-3 flex items-center gap-2 text-sm font-bold">
                <Link2 className="h-4 w-4" />
                Live updates instantly
              </div>

              <p className="mt-4 text-xs leading-6 text-white/50">
                After saving, customer menu will update without changing QR code.
              </p>
            </div>
          </aside>
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-neutral-100 bg-white/90 p-5 backdrop-blur md:flex-row md:justify-between">
          {itemMode === "edit" && (
            <button
              onClick={() => deleteItem(itemForm.id)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-4 font-black text-white"
            >
              <Trash2 className="h-5 w-5" />
              Delete Item
            </button>
          )}

          <div className="flex gap-3 md:ml-auto">
            <button
              onClick={onClose}
              className="flex-1 rounded-full bg-neutral-100 px-6 py-4 font-black text-neutral-800 md:flex-none"
            >
              Cancel
            </button>

            <button
              onClick={saveItem}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-4 font-black text-white md:flex-none"
            >
              <Save className="h-5 w-5" />
              Save Item
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-neutral-500">{title}</p>
          <p className="mt-2 text-4xl font-black tracking-tight">{value}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900">
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
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-[1.5rem] px-5 py-4 font-black transition ${
        active
          ? "bg-neutral-950 text-white"
          : "bg-transparent text-neutral-600 hover:bg-neutral-100"
      }`}
    >
      <span className="h-5 w-5">{icon}</span>
      {label}
    </button>
  );
}

function InputBox({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <label className="mb-2 block text-sm font-black text-neutral-600">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleBox({
  title,
  text,
  checked,
  onChange,
}: {
  title: string;
  text: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div>
        <p className="font-black">{title}</p>
        <p className="mt-1 text-sm text-neutral-500">{text}</p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5"
      />
    </label>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black text-neutral-700">
      {children}
    </span>
  );
}

function optionsToArray(options: unknown): string[] {
  if (Array.isArray(options)) {
    return options.map(String);
  }

  if (typeof options === "string") {
    try {
      const parsed = JSON.parse(options);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return options
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}