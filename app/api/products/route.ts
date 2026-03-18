export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { validateAdminRequest } from "@/lib/admin-utils";

export async function GET() {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM products ORDER BY created_at ASC"
    );
    return NextResponse.json({ success: true, products: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!validateAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      price,
      image_url,
      category,
      is_permanent_available,
      product_type,
    } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO products (name, description, price, image_url, category, is_permanent_available, product_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name,
        description ?? null,
        price,
        image_url ?? null,
        category ?? null,
        typeof is_permanent_available === "boolean" ? is_permanent_available : true,
        product_type ?? "gift",
      ]
    );

    return NextResponse.json({ success: true, product: rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
