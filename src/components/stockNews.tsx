"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchStockNews,
  FormattedNewsItem,
} from "../app/api/stock-news/stockNewsService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area"; // 添加滚动区域组件

interface StockNewsProps {
  symbol: string;
  apiKey: string;
  className?: string;
}

export function StockNews({ symbol, apiKey, className }: StockNewsProps) {
  const [news, setNews] = useState<FormattedNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(3);

  // 加载更多（改为手动按钮触发）
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + 1, news.length));
  }, [news.length]);

  // 初始化加载
  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const formatForAPI = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}${month}${day}T0000`;
        };

        const newsData = await fetchStockNews(
          [symbol],
          10,
          formatForAPI(lastWeek),
          formatForAPI(now),
          apiKey,
        );
        setNews(newsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load news");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [symbol, apiKey]);

  if (loading) {
    return (
      <ScrollArea className={`h-[500px] rounded-md border ${className}`}>
        <div className="space-y-4 p-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  }

  if (error) {
    return (
      <ScrollArea className={`h-[300px] rounded-md border ${className}`}>
        <Card className="m-4">
          <CardHeader>
            <CardTitle>Error loading news</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </ScrollArea>
    );
  }

  if (news.length === 0) {
    return (
      <ScrollArea className={`h-[300px] rounded-md border ${className}`}>
        <Card className="m-4">
          <CardHeader>
            <CardTitle>No news available</CardTitle>
          </CardHeader>
        </Card>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea
      className={`h-[500px] rounded-md border ${className}`}
      type="always" // 强制显示滚动条
    >
      <div className="space-y-4 p-4">
        {news.slice(0, visibleCount).map((item) => (
          <Card key={item.url}>
            <CardHeader className="pb-2">
              <CardTitle
                className="cursor-pointer text-lg"
                onClick={() =>
                  setExpandedId(expandedId === item.url ? null : item.url)
                }
              >
                {item.title}
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>
                  {item.date} • {item.source}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setExpandedId(expandedId === item.url ? null : item.url)
                  }
                >
                  {expandedId === item.url ? "Collapse" : "Read more"}
                </Button>
              </CardDescription>
            </CardHeader>

            {expandedId === item.url && (
              <CardContent className="pt-0">
                {/* 内容详情保持不变 */}
              </CardContent>
            )}
          </Card>
        ))}

        {visibleCount < news.length && (
          <div className="flex justify-center pt-2">
            <Button variant="outline" onClick={loadMore} className="w-full">
              Load More (+1)
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
