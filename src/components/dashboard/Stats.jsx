"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, CurrencyDollar, Receipt } from "tabler-icons-react";

import { fetchProducts } from "@/services/product";
import { fetchSales } from "@/services/sale";

export default function Stats() {
  const [totalStock, setTotalStock] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [todayTransactions, setTodayTransactions] = useState(0);
  const [loading, setLoading] = useState(true);

  const targetRevenue = 30000000;

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);

        const products = await fetchProducts();
        const totalStockCount = products.reduce(
          (sum, product) => sum + (product.stock ?? 0),
          0
        );
        setTotalStock(totalStockCount);

        const salesResponse = await fetchSales();
        const sales = Array.isArray(salesResponse)
          ? salesResponse
          : salesResponse.data ?? [];

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = today.getMonth();
        const dd = today.getDate();

        let monthlyRevenue = 0;
        let todayTransactionCount = 0;

        sales.forEach((sale) => {
          const saleDate = new Date(sale.date);
          if (saleDate.getFullYear() === yyyy && saleDate.getMonth() === mm) {
            monthlyRevenue += sale.total ?? 0;
          }
          if (
            saleDate.getFullYear() === yyyy &&
            saleDate.getMonth() === mm &&
            saleDate.getDate() === dd
          ) {
            todayTransactionCount++;
          }
        });

        setRevenue(monthlyRevenue);
        setTodayTransactions(todayTransactionCount);
      } catch (error) {
        console.error("Load stats error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const formatCurrency = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-400">Loading stats...</div>
    );
  }

  const revenuePercent = Math.min((revenue / targetRevenue) * 100, 100).toFixed(
    1
  );

  const stats = [
    {
      name: "Total Stock",
      value: totalStock,
      icon: <ShoppingCart />,
      content: null,
    },
    {
      name: "Monthly Revenue",
      value: formatCurrency(revenue),
      icon: <CurrencyDollar />,
      content: (
        <p className="text-xs text-gray-400 mt-1">
          Target: {formatCurrency(targetRevenue)}
        </p>
      ),
    },
    {
      name: "Revenue Target Progress",
      value: `${revenuePercent}%`,
      icon: <CurrencyDollar />,
      content: (
        <div className="w-full bg-gray-200 h-3 mt-3">
          <div
            className="bg-[#3F7F83] h-3"
            style={{ width: `${revenuePercent}%` }}
          />
        </div>
      ),
    },
    {
      name: "Today's Transactions",
      value: todayTransactions,
      icon: <Receipt />,
      content: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white p-6 shadow-sm border border-gray-100 flex flex-col justify-center"
          style={{ minHeight: "140px", borderRadius: 16 }}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#3F7F83] to-[#2B5658] flex items-center justify-center text-white">
              {stat.icon}
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm text-gray-500">{stat.name}</p>
              <p className="text-2xl font-semibold text-[#2B5658]">
                {stat.value}
              </p>
              {stat.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
