"use client";
import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import StockChart from "./stockChart";
import { StockNews } from "./stockNews";
import { useDebounce } from "@/hooks/useDebounce";

export default function StockInfo() {
  const [searchText, setSearchText] = useState("");
  const [symbol, setSymbol] = useState("AAPL"); // 单独管理symbol状态
  const debouncedSearchText = useDebounce(searchText, 500);
  const apiKey = process.env.ALPHAVANTAGE_API_KEY as string;

  // 当防抖后的搜索文本变化时更新symbol
  useEffect(() => {
    if (debouncedSearchText.trim()) {
      setSymbol(debouncedSearchText.trim().toUpperCase());
    }
  }, [debouncedSearchText]);

  return (
    <div className="space-y-4 p-4">
      <div className="relative mx-auto w-full max-w-md">
        <Input
          className="bg-muted pl-8"
          placeholder="搜索股票代码..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value.toUpperCase())}
        />
      </div>

      <div className="mx-auto grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="bg-card rounded-lg border p-4 shadow-sm">
          <StockChart
            symbol={symbol}
            interval="daily"
            timePeriod={90}
            apiKey={apiKey}
            chartType="area"
            showBrush={true}
            showReferenceLine={true}
            key={symbol}
          />
        </div>

        <div className="bg-card rounded-lg border p-4 shadow-sm">
          <StockNews
            symbol={symbol}
            apiKey={apiKey}
            className="h-[700px]" // 覆盖默认高度
          />
        </div>
      </div>
    </div>
  );
}
