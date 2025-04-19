interface AlphaVantageResponse {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Interval'?: string;
    '4. Output Size'?: string;
    '5. Time Zone': string;
  };
  'Time Series (Daily)'?: Record<string, Record<string, string>>;
  'Time Series (1min)'?: Record<string, Record<string, string>>;
  'Time Series (5min)'?: Record<string, Record<string, string>>;
  'Time Series (15min)'?: Record<string, Record<string, string>>;
  'Time Series (30min)'?: Record<string, Record<string, string>>;
  'Time Series (60min)'?: Record<string, Record<string, string>>;
  'Weekly Time Series'?: Record<string, Record<string, string>>;
  'Monthly Time Series'?: Record<string, Record<string, string>>;
}

export interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const fetchStockData = async (
  symbol: string,
  interval: string = 'daily',
  timePeriod: number = 30,
  apiKey: string
): Promise<StockDataPoint[]> => {
  try {
    let functionParam = 'TIME_SERIES_DAILY';
    let timeSeriesKey = 'Time Series (Daily)';

    // Determine the appropriate API function and response key based on interval
    switch (interval) {
      case '1min':
        functionParam = 'TIME_SERIES_INTRADAY';
        timeSeriesKey = 'Time Series (1min)';
        break;
      case '5min':
        functionParam = 'TIME_SERIES_INTRADAY';
        timeSeriesKey = 'Time Series (5min)';
        break;
      case '15min':
        functionParam = 'TIME_SERIES_INTRADAY';
        timeSeriesKey = 'Time Series (15min)';
        break;
      case '30min':
        functionParam = 'TIME_SERIES_INTRADAY';
        timeSeriesKey = 'Time Series (30min)';
        break;
      case '60min':
        functionParam = 'TIME_SERIES_INTRADAY';
        timeSeriesKey = 'Time Series (60min)';
        break;
      case 'weekly':
        functionParam = 'TIME_SERIES_WEEKLY';
        timeSeriesKey = 'Weekly Time Series';
        break;
      case 'monthly':
        functionParam = 'TIME_SERIES_MONTHLY';
        timeSeriesKey = 'Monthly Time Series';
        break;
      default:
        functionParam = 'TIME_SERIES_DAILY';
        timeSeriesKey = 'Time Series (Daily)';
    }

    // Build the API URL
    let url = `https://www.alphavantage.co/query?function=${functionParam}&symbol=${symbol}&apikey=${apiKey}`;
    
    // Add interval parameter for intraday requests
    if (interval.includes('min')) {
      url += `&interval=${interval}`;
    }

    // For daily data, we can request compact (last 100 data points) or full (20+ years)
    if (functionParam === 'TIME_SERIES_DAILY') {
      url += timePeriod <= 100 ? '&outputsize=compact' : '&outputsize=full';
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: AlphaVantageResponse = await response.json();

    // Check if the expected time series data exists
    const timeSeries = data[timeSeriesKey as keyof AlphaVantageResponse];
    if (!timeSeries) {
      throw new Error('No time series data found in API response');
    }

    // Convert the data to our desired format
    const dataPoints: StockDataPoint[] = Object.entries(timeSeries)
      .slice(0, timePeriod) // Limit to the requested time period
      .map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseFloat(values['5. volume']),
      }))
      .reverse(); // Reverse to show oldest first

    return dataPoints;
  } catch (error) {
    console.error('Error in fetchStockData:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch stock data');
  }
};