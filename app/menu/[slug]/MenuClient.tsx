"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChefHat,
  Clock,
  Flame,
  Leaf,
  PlayCircle,
  Search,
  Sparkles,
  Star,
  X,
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
  video_url?: string | null;
  category_id?: string | null;
  popular?: boolean | null;
  available?: boolean | null;
  spicy_level?: number | null;
  prep_time?: string | null;
  is_veg?: boolean | null;
  is_new?: boolean | null;
  allergens?: string | null;
};

type Customization = {
  id: string;
  restaurant_id: string;
  menu_item_id: string;
  name: string;
  options: string[];
};

export default function MenuClient({
  restaurant,
  categories,
  items,
  customizations,
}: {
  restaurant: Restaurant;
  categories: Category[];
  items: MenuItem[];
  customizations: Customization[];
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const themeColor = restaurant.theme_color || "#111111";
  const backgroundColor = restaurant.background_color || "#f5f5f4";

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();

    return items.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);

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

  const selectedCustomizations = selectedItem
    ? customizations.filter((c) => c.menu_item_id === selectedItem.id)
    : [];

  return (
    <main
      className="min-h-screen overflow-x-hidden text-neutral-950"
      style={{ backgroundColor }}
    >
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-6">
        <nav className="flex items-center justify-between rounded-full border border-black/5 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-neutral-950 text-white">
              {restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ChefHat className="h-5 w-5" />
              )}
            </div>

            <div>
              <h1 className="text-sm font-black leading-none">
                {restaurant.name}
              </h1>
              <p className="mt-1 text-xs text-neutral-500">Premium QR Menu</p>
            </div>
          </div>

          <div className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-bold text-neutral-600">
            Live Menu
          </div>
        </nav>

        <div className="grid items-end gap-8 py-12 md:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 text-sm font-bold shadow-sm">
              <Sparkles className="h-4 w-4" />
              Digital dining experience
            </div>

            <h2 className="max-w-3xl text-5xl font-black tracking-tight md:text-7xl">
              Choose your meal with confidence.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-neutral-600 md:text-lg">
              {restaurant.description ||
                "Explore dishes with photos, videos, details and customization options."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.55 }}
            className="rounded-[2rem] bg-neutral-950 p-5 text-white shadow-2xl"
          >
            <p className="text-sm text-white/50">Today’s experience</p>
            <h3 className="mt-2 text-3xl font-black">Fresh. Simple. Fast.</h3>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <InfoBox value={items.length.toString()} label="Items" />
              <InfoBox value={categories.length.toString()} label="Categories" />
              <InfoBox value={popularItems.length.toString()} label="Popular" />
            </div>
          </motion.div>
        </div>

        <div className="sticky top-3 z-30 rounded-[2rem] border border-black/5 bg-white/90 p-3 shadow-xl backdrop-blur-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu items..."
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-4 pl-12 pr-4 text-sm outline-none transition focus:border-neutral-500 focus:bg-white"
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <FilterButton
              label="All"
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
              themeColor={themeColor}
            />

            {popularItems.length > 0 && (
              <FilterButton
                label="Popular"
                active={activeCategory === "popular"}
                onClick={() => setActiveCategory("popular")}
                themeColor={themeColor}
              />
            )}

            {categories.map((cat) => (
              <FilterButton
                key={cat.id}
                label={cat.name}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
                themeColor={themeColor}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        {filteredItems.length === 0 && (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
            <Search className="mx-auto h-10 w-10 text-neutral-400" />
            <h3 className="mt-3 text-xl font-black">No items found</h3>
            <p className="mt-1 text-neutral-500">Try another search.</p>
          </div>
        )}

        {activeCategory === "popular" ? (
          <MenuSection
            title="Popular Picks"
            items={filteredItems}
            themeColor={themeColor}
            onSelect={setSelectedItem}
          />
        ) : activeCategory !== "all" ? (
          <MenuSection
            title={
              categories.find((cat) => cat.id === activeCategory)?.name ||
              "Menu Items"
            }
            items={filteredItems}
            themeColor={themeColor}
            onSelect={setSelectedItem}
          />
        ) : (
          <>
            {popularItems.length > 0 && search.trim() === "" && (
              <MenuSection
                title="Popular Picks"
                items={popularItems}
                themeColor={themeColor}
                onSelect={setSelectedItem}
              />
            )}

            {groupedCategories.map((cat) => (
              <MenuSection
                key={cat.id}
                title={cat.name}
                items={cat.items}
                themeColor={themeColor}
                onSelect={setSelectedItem}
              />
            ))}
          </>
        )}
      </section>

      <AnimatePresence>
        {selectedItem && (
          <FoodPopup
            item={selectedItem}
            customizations={selectedCustomizations}
            onClose={() => setSelectedItem(null)}
            themeColor={themeColor}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function InfoBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl bg-white/10 p-4 text-center">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs text-white/50">{label}</p>
    </div>
  );
}

function FilterButton({
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
      className="shrink-0 rounded-full px-5 py-3 text-sm font-black transition"
      style={{
        backgroundColor: active ? themeColor : "#f5f5f4",
        color: active ? "white" : "#44403c",
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
  onSelect,
}: {
  title: string;
  items: MenuItem[];
  themeColor: string;
  onSelect: (item: MenuItem) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-400">
            Menu
          </p>
          <h2 className="text-3xl font-black tracking-tight">{title}</h2>
        </div>

        <p className="text-sm font-bold text-neutral-500">{items.length} items</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <FoodCard
            key={item.id}
            item={item}
            index={index}
            themeColor={themeColor}
            onSelect={onSelect}
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
  onSelect,
}: {
  item: MenuItem;
  index: number;
  themeColor: string;
  onSelect: (item: MenuItem) => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.2) }}
      whileHover={{ y: -4 }}
      onClick={() => onSelect(item)}
      className="group grid w-full grid-cols-[110px_1fr] overflow-hidden rounded-[1.75rem] bg-white p-3 text-left shadow-sm transition hover:shadow-xl md:grid-cols-[150px_1fr]"
    >
      <div className="relative h-32 overflow-hidden rounded-[1.25rem] bg-neutral-100 md:h-40">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-white">
            <ChefHat className="h-10 w-10" />
          </div>
        )}

        {item.video_url && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <PlayCircle className="h-10 w-10 text-white drop-shadow" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-between p-2 md:p-4">
        <div>
          <div className="flex flex-wrap gap-2">
            {item.popular && (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase text-neutral-700">
                <Star className="h-3 w-3" />
                Popular
              </span>
            )}

            {item.is_new && (
              <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-black uppercase text-green-700">
                New
              </span>
            )}

            {item.is_veg && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-700">
                <Leaf className="h-3 w-3" />
                Veg
              </span>
            )}
          </div>

          <h3 className="mt-3 line-clamp-1 text-lg font-black md:text-xl">
            {item.name}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm leading-6 text-neutral-500">
            {item.description || "Freshly prepared item"}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xl font-black" style={{ color: themeColor }}>
            Rs. {Number(item.price).toLocaleString("en-LK")}
          </p>

          <span className="rounded-full bg-neutral-950 px-4 py-2 text-xs font-black text-white">
            View
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function FoodPopup({
  item,
  customizations,
  onClose,
  themeColor,
}: {
  item: MenuItem;
  customizations: Customization[];
  onClose: () => void;
  themeColor: string;
}) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {}
  );

  function chooseOption(name: string, option: string) {
    setSelectedOptions((prev) => ({
      ...prev,
      [name]: option,
    }));
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm md:items-center md:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl md:rounded-[2rem]"
      >
        <div className="relative h-72 overflow-hidden bg-neutral-100 md:h-96">
          {item.video_url ? (
            <video
              src={item.video_url}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-950 text-white">
              <ChefHat className="h-16 w-16" />
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/90 p-3 text-neutral-950 shadow-lg backdrop-blur"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-4 flex gap-2">
            {item.popular && (
              <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-neutral-900 shadow">
                ⭐ Popular
              </span>
            )}

            {item.video_url && (
              <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-neutral-900 shadow">
                Video Preview
              </span>
            )}
          </div>
        </div>

        <div className="p-5 md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                {item.name}
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-neutral-600">
                {item.description || "Freshly prepared item"}
              </p>
            </div>

            <p
              className="shrink-0 rounded-full px-5 py-3 text-2xl font-black text-white"
              style={{ backgroundColor: themeColor }}
            >
              Rs. {Number(item.price).toLocaleString("en-LK")}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {item.prep_time && (
              <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm font-bold text-neutral-700">
                <Clock className="h-4 w-4" />
                {item.prep_time}
              </span>
            )}

            {item.spicy_level ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
                <Flame className="h-4 w-4" />
                Spicy {item.spicy_level}/5
              </span>
            ) : null}

            {item.is_veg && (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                <Leaf className="h-4 w-4" />
                Vegetarian
              </span>
            )}

            {item.allergens && (
              <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-800">
                Allergens: {item.allergens}
              </span>
            )}
          </div>

          {customizations.length > 0 && (
            <div className="mt-8 rounded-[2rem] bg-neutral-50 p-5">
              <h3 className="text-xl font-black">Customize your preference</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Package 1 preview only. In ordering package, these choices will
                be sent with the order.
              </p>

              <div className="mt-5 space-y-5">
                {customizations.map((custom) => (
                  <div key={custom.id}>
                    <p className="mb-2 font-black">{custom.name}</p>

                    <div className="flex flex-wrap gap-2">
                      {custom.options.map((option) => {
                        const active = selectedOptions[custom.name] === option;

                        return (
                          <button
                            key={option}
                            onClick={() => chooseOption(custom.name, option)}
                            className="rounded-full px-4 py-2 text-sm font-black transition"
                            style={{
                              backgroundColor: active ? themeColor : "white",
                              color: active ? "white" : "#44403c",
                              border: active
                                ? `1px solid ${themeColor}`
                                : "1px solid #e7e5e4",
                            }}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {Object.keys(selectedOptions).length > 0 && (
                <div className="mt-5 rounded-2xl bg-white p-4 text-sm text-neutral-600">
                  <p className="font-black text-neutral-950">
                    Selected preferences:
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(selectedOptions).map(([key, value]) => (
                      <span
                        key={key}
                        className="rounded-full bg-neutral-100 px-3 py-1 font-bold"
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}