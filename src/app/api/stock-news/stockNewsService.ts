// stockNewsService.ts
interface NewsSentimentResponse {
    feed?: NewsItem[];
    Information?: string;
  }
  
  interface NewsItem {
    title: string;
    url: string;
    time_published: string;
    authors?: string[];
    summary: string;
    banner_image?: string;
    source: string;
    overall_sentiment_score?: number;
    overall_sentiment_label?: string;
  }
  
  export interface FormattedNewsItem {
    title: string;
    url: string;
    date: string;
    source: string;
    authors?: string[];
    summary: string;
    sentimentScore?: number;
    sentimentLabel?: string;
  }
  
  const formatDate = (apiDate: string): string => {
    // 将"20220410T124500"转换为"Apr 10, 2022"
    const year = apiDate.substring(0, 4);
    const month = apiDate.substring(4, 6);
    const day = apiDate.substring(6, 8);
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  export const fetchStockNews = async (
    tickers: string[] = [],
    limit: number = 5,
    apiKey: string,
    timeFrom?: string,
    timeTo?: string,
  ): Promise<FormattedNewsItem[]> => {
    try {
      if (!apiKey) {
        throw new Error('Alpha Vantage API key is required');
      }
  
      const params = new URLSearchParams({
        function: 'NEWS_SENTIMENT',
        apikey: apiKey,
        limit: limit.toString(),
        sort: 'LATEST' // 默认按最新排序
      });
  
      if (tickers.length > 0) {
        params.append('tickers', tickers.join(','));
      }
  
      if (timeFrom) {
        // 确保时间格式为YYYYMMDDTHHMM
        const formattedTimeFrom = timeFrom.includes('T') 
          ? timeFrom 
          : `${timeFrom.replace(/-/g, '')}T0000`;
        params.append('time_from', formattedTimeFrom);
      }
  
      if (timeTo) {
        const formattedTimeTo = timeTo.includes('T')
          ? timeTo
          : `${timeTo.replace(/-/g, '')}T2359`;
        params.append('time_to', formattedTimeTo);
      }
  
      const url = `https://www.alphavantage.co/query?${params.toString()}`;
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
  
      const data: NewsSentimentResponse = await response.json();
  
      if (data.Information) {
        throw new Error(data.Information);
      }
  
      if (!data.feed || data.feed.length === 0) {
        return [];
      }
  
      return data.feed.map((item: NewsItem) => ({
        title: item.title,
        url: item.url,
        date: formatDate(item.time_published),
        source: item.source,
        authors: item.authors,
        summary: item.summary,
        sentimentScore: item.overall_sentiment_score,
        sentimentLabel: item.overall_sentiment_label
      }));
    } catch (error) {
      console.error('Error fetching stock news:', error);
      throw error;
    }
  };
  