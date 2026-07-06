"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  Sparkles,
  ChefHat,
  Utensils,
  Coffee,
} from "lucide-react";

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
  name: string;
  description?: string | null;
  price: number | string;
  image_url?: string | null;
  category_id?: string | null;
  popular?: boolean | null;
  available?: boolean | null;
};

export default function MenuClient({
  restaurant,
  categories,
  items,
}: {
  restaurant: Restaurant;
  categories: Category[];
  items: MenuItem[];
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const themeColor = restaurant.theme_color || "#b45309";
  const backgroundColor = restaurant.background_color || "#fff7ed";

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "all" ||
        activeCategory === item.category_id ||
        (activeCategory === "popular" && item.popular);

      return matchesSearch && matchesCategory;
    });
  }, [items, search, activeCategory]);

  const popularItems = items.filter((item) => item.popular);

  const groupedCategories = categories
    .map((cat) => ({
      ...cat,
      items: filteredItems.filter((item) => item.category_id === cat.id),
    }))
    .filter((cat) => cat.items.length > 0);

  const uncategorizedItems = filteredItems.filter((item) => !item.category_id);

  return (
    <main
      className="min-h-screen overflow-x-hidden pb-12"
      style={{ backgroundColor }}
    >
      <Hero restaurant={restaurant} themeColor={themeColor} />

      <section className="mx-auto -mt-8 max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-white/70 bg-white/90 p-4 shadow-2xl backdrop-blur md:p-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search foods, drinks, coffee..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
            />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            <CategoryButton
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
              label="All"
              themeColor={themeColor}
            />

            {popularItems.length > 0 && (
              <CategoryButton
                active={activeCategory === "popular"}
                onClick={() => setActiveCategory("popular")}
                label="Popular"
                themeColor={themeColor}
              />
            )}

            {categories.map((cat) => (
              <CategoryButton
                key={cat.id}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
                label={cat.name}
                themeColor={themeColor}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {activeCategory === "all" && search.trim() === "" && popularItems.length > 0 && (
        <section className="mx-auto mt-8 max-w-6xl px-4">
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            <h2 className="text-2xl font-black text-gray-900">
              Popular Picks
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popularItems.map((item, index) => (
              <FoodCard
                key={item.id}
                item={item}
                index={index}
                themeColor={themeColor}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto mt-10 max-w-6xl px-4">
        {filteredItems.length === 0 && (
          <div className="rounded-3xl bg-white p-10 text-center shadow">
            <ChefHat className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-bold">No items found</h2>
            <p className="mt-1 text-gray-500">Try another search or category.</p>
          </div>
        )}

        {activeCategory === "popular" ? (
          <MenuSection
            title="Popular Items"
            items={filteredItems}
            themeColor={themeColor}
          />
        ) : activeCategory !== "all" ? (
          <MenuSection
            title={
              categories.find((cat) => cat.id === activeCategory)?.name ||
              "Menu Items"
            }
            items={filteredItems}
            themeColor={themeColor}
          />
        ) : (
          <>
            {groupedCategories.map((cat) => (
              <MenuSection
                key={cat.id}
                title={cat.name}
                items={cat.items}
                themeColor={themeColor}
              />
            ))}

            {uncategorizedItems.length > 0 && (
              <MenuSection
                title="Other Items"
                items={uncategorizedItems}
                themeColor={themeColor}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}

function Hero({
  restaurant,
  themeColor,
}: {
  restaurant: Restaurant;
  themeColor: string;
}) {
  return (
    <section
      className="relative overflow-hidden px-4 pb-20 pt-10 text-white"
      style={{
        background: `radial-gradient(circle at top left, ${themeColor}, #111827 55%, #030712)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
        animate={{ opacity: 0.25, scale: 1, rotate: 0 }}
        transition={{ duration: 1 }}
        className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: 8 }}
        animate={{ opacity: 0.18, scale: 1, rotate: 0 }}
        transition={{ duration: 1.2 }}
        className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-yellow-300 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-xl backdrop-blur">
              {restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <Utensils className="h-7 w-7" />
              )}
            </div>

            <div>
              <p className="text-sm text-white/70">Digital QR Menu</p>
              <h1 className="text-xl font-black">{restaurant.name}</h1>
            </div>
          </div>

          <div className="hidden rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur md:block">
            Scan • View • Enjoy
          </div>
        </motion.div>

        <div className="grid items-center gap-8 pt-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Freshly prepared menu
            </div>

            <h2 className="text-5xl font-black leading-tight md:text-7xl">
              Taste the best <br />
              <span className="text-white/70">from our kitchen.</span>
            </h2>

            <p className="mt-5 max-w-xl text-lg text-white/75">
              {restaurant.description ||
                "Browse our menu, check prices and discover popular dishes."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.65 }}
            className="rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur"
          >
            <div className="rounded-[1.5rem] bg-white p-5 text-gray-900">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{ backgroundColor: themeColor }}
                >
                  <Coffee className="h-8 w-8" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Today’s Special
                  </p>
                  <h3 className="text-2xl font-black">Popular Items</h3>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-gray-100 p-3">
                  <p className="text-xl font-black">QR</p>
                  <p className="text-xs text-gray-500">Menu</p>
                </div>
                <div className="rounded-2xl bg-gray-100 p-3">
                  <p className="text-xl font-black">Live</p>
                  <p className="text-xs text-gray-500">Prices</p>
                </div>
                <div className="rounded-2xl bg-gray-100 p-3">
                  <p className="text-xl font-black">Fresh</p>
                  <p className="text-xs text-gray-500">Foods</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CategoryButton({
  label,
  active,
  onClick,
  themeColor,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  themeColor: string;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-full border px-5 py-3 text-sm font-bold transition"
      style={{
        backgroundColor: active ? themeColor : "white",
        color: active ? "white" : "#374151",
        borderColor: active ? themeColor : "#e5e7eb",
      }}
    >
      {label}
    </button>
  );
}

function MenuSection({
  title,
  items,
  themeColor,
}: {
  title: string;
  items: MenuItem[];
  themeColor: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900">{title}</h2>
        <p className="text-sm font-semibold text-gray-500">
          {items.length} items
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <FoodCard
            key={item.id}
            item={item}
            index={index}
            themeColor={themeColor}
          />
        ))}
      </div>
    </div>
  );
}

function FoodCard({
  item,
  index,
  themeColor,
}: {
  item: MenuItem;
  index: number;
  themeColor: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.25) }}
      whileHover={{ y: -6 }}
      className="group overflow-hidden rounded-[2rem] bg-white shadow-lg shadow-black/5"
    >
      <div className="relative h-56 overflow-hidden bg-gray-100">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-white"
            style={{
              background: `linear-gradient(135deg, ${themeColor}, #111827)`,
            }}
          >
            <ChefHat className="h-16 w-16 opacity-80" />
          </div>
        )}

        {item.popular && (
          <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-2 text-xs font-black text-gray-900 shadow">
            ⭐ Popular
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-black text-gray-900">{item.name}</h3>

          <p
            className="shrink-0 rounded-full px-3 py-2 text-sm font-black text-white"
            style={{ backgroundColor: themeColor }}
          >
            Rs. {Number(item.price).toLocaleString("en-LK")}
          </p>
        </div>

        <p className="mt-3 min-h-10 text-sm leading-6 text-gray-600">
          {item.description || "Freshly prepared item"}
        </p>
      </div>
    </motion.article>
  );
}