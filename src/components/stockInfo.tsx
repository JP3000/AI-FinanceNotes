"src/components/stockInfo.tsx";
"use client";
import React from "react";
import { Input } from "./ui/input";
import StockChart from "./stockChart";

export default function StockInfo() {
  const [searchText, setSearchText] = React.useState("");
  const apiKey = process.env.ALPHAVANTAGE_API_KEY as string;

  return (
    <div className="space-y-4 p-4">
      {/* 搜索框 */}
      <div className="relative mx-auto w-full max-w-md">
        <Input
          className="bg-muted pl-8"
          placeholder="搜索股票代码..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* 双图表并排布局 */}
      <div className="mx-auto grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 实时价格卡片 */}
        <div className="bg-card rounded-lg border p-4 shadow-sm">
          <StockChart
            symbol="AAPL"
            interval="daily"
            timePeriod={90}
            apiKey={apiKey}
            chartType="area"
            showBrush={true}
            showReferenceLine={true}
          />
        </div>

        {/* 历史走势卡片 */}
        <div className="bg-card rounded-lg border p-4 shadow-sm">
          <StockChart
            symbol="TSLA"
            interval="daily"
            timePeriod={90}
            apiKey={apiKey}
            chartType="area"
            showBrush={true}
            showReferenceLine={true}
          />
        </div>
      </div>
    </div>
  );
}
