export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateAdminRequest } from "@/lib/admin-utils";

export async function GET(req: Request) {
  try {
    const auth = validateAdminRequest(req);
    if (!auth.valid || auth.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, status, created_at, product_id, quantity")
      .in("status", ["paid", "minting", "minted", "completed"]);

    if (error) throw error;

    const { data: products } = await supabase
      .from("products")
      .select("id, price, name");

    const productMap = new Map((products || []).map(p => [p.id, p]));

    const enriched = (orders || []).map(o => {
      const product = productMap.get(o.product_id);
      const price = product?.price || 0;
      const qty = o.quantity || 1;
      return {
        ...o,
        revenue: price * qty,
        product_name: product?.name || "N/A",
        date: o.created_at.split("T")[0],
      };
    });

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const weekStr = startOfWeek.toISOString().split("T")[0];

    const monthStr = today.substring(0, 7);
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    const yearStr = today.substring(0, 4);

    function sumByFilter(filterFn: (d: string) => boolean) {
      return enriched
        .filter(o => filterFn(o.date))
        .reduce((sum, o) => sum + o.revenue, 0);
    }

    function countByFilter(filterFn: (d: string) => boolean) {
      return enriched.filter(o => filterFn(o.date)).length;
    }

    const quarterStart = new Date(now.getFullYear(), (quarter - 1) * 3, 1).toISOString().split("T")[0];
    const quarterEnd = new Date(now.getFullYear(), quarter * 3, 0).toISOString().split("T")[0];

    const dailyMap = new Map<string, { revenue: number; orders: number }>();
    enriched.forEach(o => {
      const existing = dailyMap.get(o.date) || { revenue: 0, orders: 0 };
      existing.revenue += o.revenue;
      existing.orders += 1;
      dailyMap.set(o.date, existing);
    });

    const dailyBreakdown = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);

    return NextResponse.json({
      success: true,
      summary: {
        today: { revenue: sumByFilter(d => d === today), orders: countByFilter(d => d === today) },
        week: { revenue: sumByFilter(d => d >= weekStr), orders: countByFilter(d => d >= weekStr) },
        month: { revenue: sumByFilter(d => d.startsWith(monthStr)), orders: countByFilter(d => d.startsWith(monthStr)) },
        quarter: { revenue: sumByFilter(d => d >= quarterStart && d <= quarterEnd), orders: countByFilter(d => d >= quarterStart && d <= quarterEnd) },
        year: { revenue: sumByFilter(d => d.startsWith(yearStr)), orders: countByFilter(d => d.startsWith(yearStr)) },
        total: { revenue: enriched.reduce((s, o) => s + o.revenue, 0), orders: enriched.length },
      },
      dailyBreakdown,
      allOrders: enriched,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
