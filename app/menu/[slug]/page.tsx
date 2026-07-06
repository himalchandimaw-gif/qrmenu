import { supabase } from "@/lib/supabase";
import MenuClient from "./MenuClient";

export const dynamic = "force-dynamic";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!restaurant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50 p-4">
        <div className="rounded-3xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold">Restaurant not found</h1>
          <p className="mt-2 text-gray-600">Please check the QR menu link.</p>
        </div>
      </main>
    );
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("display_order", { ascending: true });

  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("available", true)
    .order("display_order", { ascending: true });

  return (
    <MenuClient
      restaurant={restaurant}
      categories={categories || []}
      items={items || []}
    />
  );
}